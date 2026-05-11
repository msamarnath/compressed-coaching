import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { getCfEnv } from "@/lib/cf-env";
import { executeQuery, executeQueryFirst, getDatabase } from "@/lib/d1-client";

const CreateMcqSchema = z.object({
	title: z.string().trim().min(1).max(2000),
	explanation: z.string().trim().max(4000).optional().or(z.literal("")),
	marks: z.number().int().min(0).max(1000),
	difficulty: z.enum(["Easy", "Medium", "Hard"]),
	tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
	options: z.array(z.string().trim().min(1).max(500)).min(2).max(10),
	correctOptionIndex: z.number().int().min(0),
});

function clampInt(value: number, min: number, max: number): number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export async function GET(req: Request) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { searchParams } = new URL(req.url);
	const query = searchParams.get("q")?.trim() ?? "";
	const sortByRaw = (searchParams.get("sortBy") ?? "created_at").toLowerCase();
	const sortDirRaw = (searchParams.get("sortDir") ?? "desc").toLowerCase();
	const page = clampInt(Number(searchParams.get("page") ?? "1"), 1, 10_000);
	const pageSize = clampInt(Number(searchParams.get("pageSize") ?? "10"), 5, 100);

	const sortBy =
		sortByRaw === "updated_at"
			? "updated_at"
			: sortByRaw === "title"
				? "prompt"
				: ("created_at" as const);
	const sortDir = sortDirRaw === "asc" ? "asc" : ("desc" as const);

	const env = getCfEnv();
	const db = getDatabase(env);

	const where: string[] = ["q.user_id = ?"];
	const params: unknown[] = [user.id];

	if (query.length > 0) {
		where.push("q.prompt LIKE ?");
		params.push(`%${query}%`);
	}

	const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

	const totalRow = await executeQueryFirst<{ total: number }>(
		db,
		`SELECT COUNT(1) as total FROM mcq_questions q ${whereSql}`,
		...params,
	);
	const totalItems = totalRow?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const safePage = Math.min(page, totalPages);
	const offset = (safePage - 1) * pageSize;

	const orderClause =
		sortBy === "prompt"
			? `ORDER BY q.prompt ${sortDir}, q.id ${sortDir}`
			: `ORDER BY q.${sortBy} ${sortDir}, q.id ${sortDir}`;

	const { results } = await executeQuery<{
		id: string;
		title: string;
		created_at: string;
		updated_at: string;
		option_count: number;
		marks: number;
		difficulty: string;
	}>(
		db,
		`
    SELECT
      q.id,
      q.prompt as title,
      q.created_at,
      q.updated_at,
      q.marks,
      q.difficulty,
      (SELECT COUNT(1) FROM mcq_options o WHERE o.question_id = q.id) as option_count
    FROM mcq_questions q
    ${whereSql}
    ${orderClause}
    LIMIT ? OFFSET ?
  `,
		...params,
		pageSize,
		offset,
	);

	return NextResponse.json({
		items: results.map((r) => ({
			id: r.id,
			title: r.title,
			optionCount: r.option_count,
			marks: r.marks,
			difficulty: r.difficulty,
			createdAt: r.created_at,
			updatedAt: r.updated_at,
		})),
		page: safePage,
		pageSize,
		totalItems,
		totalPages,
		query,
		sortBy,
		sortDir,
	});
}

export async function POST(req: Request) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	try {
		const body = await req.json();
		const parsed = CreateMcqSchema.parse(body);

		if (parsed.correctOptionIndex >= parsed.options.length) {
			return NextResponse.json({ error: "Invalid correct option selection." }, { status: 400 });
		}

		const env = getCfEnv();
		const db = getDatabase(env);

		const q = await executeQueryFirst<{ id: string }>(
			db,
			`INSERT INTO mcq_questions (user_id, prompt, explanation, marks, difficulty)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id`,
			user.id,
			parsed.title,
			parsed.explanation && parsed.explanation.length > 0 ? parsed.explanation : null,
			parsed.marks,
			parsed.difficulty,
		);

		if (!q) return NextResponse.json({ error: "Failed to create question." }, { status: 500 });

		const statements: D1PreparedStatement[] = [];
		for (let i = 0; i < parsed.options.length; i += 1) {
			const isCorrect = i === parsed.correctOptionIndex ? 1 : 0;
			statements.push(
				db
					.prepare(
						`INSERT INTO mcq_options (question_id, option_text, is_correct, display_order)
             VALUES (?1, ?2, ?3, ?4)`,
					)
					.bind(q.id, parsed.options[i], isCorrect, i),
			);
		}

		await db.batch(statements);

		// Upsert tags and link to the question (best-effort; keeps create flow simple)
		for (const rawName of parsed.tags) {
			const name = rawName.trim();
			if (!name) continue;

			// Ensure tag exists
			await executeQueryFirst<{ id: string }>(
				db,
				`INSERT INTO mcq_tags (user_id, name)
         VALUES (?, ?)
         ON CONFLICT(user_id, name) DO UPDATE SET name = excluded.name
         RETURNING id`,
				user.id,
				name,
			);

			const tag = await executeQueryFirst<{ id: string }>(db, "SELECT id FROM mcq_tags WHERE user_id = ? AND name = ? LIMIT 1", user.id, name);
			if (!tag) continue;

			// Link tag to question (ignore duplicates)
			await executeQueryFirst(
				db,
				`INSERT OR IGNORE INTO mcq_question_tags (question_id, tag_id) VALUES (?, ?) RETURNING question_id`,
				q.id,
				tag.id,
			);
		}

		return NextResponse.json({ ok: true, id: q.id }, { status: 201 });
	} catch (err) {
		if (err instanceof ZodError) return NextResponse.json({ error: "Invalid MCQ data." }, { status: 400 });
		return NextResponse.json({ error: "Failed to create question." }, { status: 500 });
	}
}

