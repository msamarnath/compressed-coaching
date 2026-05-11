import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCfEnv } from "@/lib/cf-env";
import { executeQuery, executeQueryFirst, getDatabase } from "@/lib/d1-client";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const { id } = await ctx.params;

	const env = getCfEnv();
	const db = getDatabase(env);

	const question = await executeQueryFirst<{ id: string; prompt: string; explanation: string | null; marks: number; difficulty: string }>(
		db,
		`SELECT id, prompt, explanation, marks, difficulty
     FROM mcq_questions
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
		id,
		user.id,
	);

	if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

	const { results: options } = await executeQuery<{ id: string; option_text: string; is_correct: number; display_order: number }>(
		db,
		`SELECT id, option_text, is_correct, display_order
     FROM mcq_options
     WHERE question_id = ?
     ORDER BY display_order ASC, id ASC`,
		id,
	);

	const { results: tags } = await executeQuery<{ name: string }>(
		db,
		`SELECT t.name
     FROM mcq_question_tags qt
     JOIN mcq_tags t ON t.id = qt.tag_id
     WHERE qt.question_id = ?
     ORDER BY t.name ASC`,
		id,
	);

	return NextResponse.json({
		id: question.id,
		title: question.prompt,
		explanation: question.explanation,
		marks: question.marks,
		difficulty: question.difficulty,
		tags: tags.map((t) => t.name),
		options: options.map((o) => ({
			id: o.id,
			text: o.option_text,
			isCorrect: o.is_correct === 1,
			displayOrder: o.display_order,
		})),
	});
}

