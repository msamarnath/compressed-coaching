import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCfEnv } from "@/lib/cf-env";
import { requireUser } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { executeQuery, executeQueryFirst, getDatabase } from "@/lib/d1-client";

type PageProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function clampInt(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min;
	if (value < min) return min;
	if (value > max) return max;
	return value;
}

export default async function McqListPage({ searchParams }: PageProps) {
	const user = await requireUser();
	const env = getCfEnv();
	const db = getDatabase(env);

	const sp = (await searchParams) ?? {};
	const q = typeof sp.q === "string" ? sp.q.trim() : "";
	const sortByRaw = typeof sp.sortBy === "string" ? sp.sortBy : "created_at";
	const sortDirRaw = typeof sp.sortDir === "string" ? sp.sortDir : "desc";
	const page = clampInt(Number(typeof sp.page === "string" ? sp.page : "1"), 1, 10_000);
	const pageSize = clampInt(Number(typeof sp.pageSize === "string" ? sp.pageSize : "10"), 10, 50);

	const sortBy = sortByRaw === "updated_at" ? "updated_at" : sortByRaw === "title" ? "prompt" : ("created_at" as const);
	const sortDir = sortDirRaw === "asc" ? "asc" : ("desc" as const);

	const where: string[] = ["q.user_id = ?"];
	const params: unknown[] = [user.id];

	if (q.length > 0) {
		where.push("q.prompt LIKE ?");
		params.push(`%${q}%`);
	}

	const whereSql = `WHERE ${where.join(" AND ")}`;

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

	const { results: items } = await executeQuery<{
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

	const showingFrom = totalItems === 0 ? 0 : offset + 1;
	const showingTo = Math.min(offset + pageSize, totalItems);

	function hrefWith(next: Record<string, string>) {
		const url = new URL("http://local/mcq");
		if (q) url.searchParams.set("q", q);
		url.searchParams.set("sortBy", sortBy);
		url.searchParams.set("sortDir", sortDir);
		url.searchParams.set("pageSize", String(pageSize));
		url.searchParams.set("page", String(safePage));
		for (const [k, v] of Object.entries(next)) url.searchParams.set(k, v);
		return `${url.pathname}?${url.searchParams.toString()}`;
	}

	function sortHref(column: "created_at" | "updated_at" | "prompt") {
		const nextSortDir = sortBy === column ? (sortDir === "asc" ? "desc" : "asc") : "asc";
		const sortByParam = column === "prompt" ? "title" : column;
		return hrefWith({ sortBy: sortByParam, sortDir: nextSortDir, page: "1" });
	}

	function sortIndicator(column: "created_at" | "updated_at" | "prompt") {
		if (sortBy !== column) return null;
		return sortDir === "asc" ? "▲" : "▼";
	}

	function ariaSort(column: "created_at" | "updated_at" | "prompt") {
		if (sortBy !== column) return "none";
		return sortDir === "asc" ? "ascending" : "descending";
	}

	return (
		<div className="min-h-screen bg-background">
			<header className="border-b">
				<div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Signed in as</p>
						<p className="text-sm font-medium">{user.email}</p>
					</div>
					<form action="/api/auth/logout" method="post">
						<Button type="submit" variant="outline">
							Logout
						</Button>
					</form>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 py-10">
				<Card className="border-0 shadow-none bg-transparent">
					<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<h1 className="text-2xl font-semibold tracking-tight">MCQ Questions</h1>
							<p className="text-sm text-muted-foreground">Search, sort, and manage your questions.</p>
						</div>
						<div className="flex gap-3">
							<Link href="/mcq/new">
								<Button>Add question</Button>
							</Link>
						</div>
					</div>

					<div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border bg-background p-4 shadow-sm sm:grid-cols-3 sm:items-center">
						<form className="sm:col-span-2" action="/mcq" method="get" aria-label="Search questions">
							<Input
								name="q"
								defaultValue={q}
								placeholder="Search by question prompt…"
								aria-label="Search by question prompt"
							/>
							<input type="hidden" name="sortBy" value={sortBy} />
							<input type="hidden" name="sortDir" value={sortDir} />
							<select
								name="pageSize"
								defaultValue={String(pageSize)}
								className="mt-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:mt-2 sm:max-w-[12rem]"
								aria-label="Questions per page"
							>
								<option value="10">10 per page</option>
								<option value="25">25 per page</option>
								<option value="50">50 per page</option>
							</select>
						</form>
						<div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
							<div className="text-sm text-muted-foreground">
								{totalItems === 0 ? "0 records" : `${totalItems} record${totalItems === 1 ? "" : "s"}`}
							</div>
							<p className="text-xs text-muted-foreground">Tip: click table headers to sort.</p>
						</div>
					</div>

					<div className="rounded-xl border bg-background shadow-sm">
					<CardHeader>
						<CardTitle className="text-base">Listing</CardTitle>
						<CardDescription>
							Showing {showingFrom}–{showingTo} of {totalItems}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{totalItems === 0 ? (
							<div className="py-16 text-center">
								<p className="text-lg font-semibold">NO questions created yet</p>
								<p className="mt-2 text-sm text-muted-foreground">Create your first question to get started.</p>
								<div className="mt-6">
									<Link href="/mcq/new">
										<Button>Create first question</Button>
									</Link>
								</div>
							</div>
						) : (
							<div className="space-y-3">
								<div className="overflow-hidden rounded-lg border">
									<table className="w-full text-sm">
										<thead className="bg-muted/40">
											<tr className="text-left">
												<th className="px-4 py-3 font-medium" aria-sort={ariaSort("prompt")}>
													<Link
														href={sortHref("prompt")}
														aria-label={`Sort by Question Title ${sortBy === "prompt" ? (sortDir === "asc" ? "descending" : "ascending") : "ascending"}`}
														className="no-underline"
													>
														<span className="underline underline-offset-4 hover:text-foreground">
															Question Title {sortIndicator("prompt")}
														</span>
													</Link>
												</th>
												<th className="px-4 py-3 font-medium w-32">Options</th>
												<th className="px-4 py-3 font-medium w-28">Marks</th>
												<th className="px-4 py-3 font-medium w-32">Difficulty</th>
												<th className="px-4 py-3 font-medium w-44" aria-sort={ariaSort("updated_at")}>
													<Link
														href={sortHref("updated_at")}
														aria-label={`Sort by Updated ${sortBy === "updated_at" ? (sortDir === "asc" ? "descending" : "ascending") : "ascending"}`}
														className="no-underline"
													>
														<span className="underline underline-offset-4 hover:text-foreground">
															Updated {sortIndicator("updated_at")}
														</span>
													</Link>
												</th>
												<th className="px-4 py-3 font-medium w-32">Actions</th>
											</tr>
										</thead>
										<tbody>
											{items.map((it) => (
												<tr key={it.id} className="border-t">
													<td className="px-4 py-3">
														<p className="font-medium line-clamp-2">{it.title}</p>
													</td>
													<td className="px-4 py-3 text-muted-foreground">
														<Badge variant="outline">{it.option_count}</Badge>
													</td>
													<td className="px-4 py-3 text-muted-foreground">{it.marks}</td>
													<td className="px-4 py-3 text-muted-foreground">{it.difficulty}</td>
													<td className="px-4 py-3 text-muted-foreground">{it.updated_at}</td>
													<td className="px-4 py-3">
														<Link href={`/mcq/${it.id}`}>
															<Button size="sm" variant="outline">
																Preview
															</Button>
														</Link>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								<div className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										Page {safePage} of {totalPages}
									</div>
									<div className="flex gap-2">
										<Link aria-disabled={safePage <= 1} href={hrefWith({ page: String(Math.max(1, safePage - 1)) })}>
											<Button variant="outline" size="sm" disabled={safePage <= 1}>
												Prev
											</Button>
										</Link>
										<Link aria-disabled={safePage >= totalPages} href={hrefWith({ page: String(Math.min(totalPages, safePage + 1)) })}>
											<Button variant="outline" size="sm" disabled={safePage >= totalPages}>
												Next
											</Button>
										</Link>
									</div>
								</div>
							</div>
						)}
					</CardContent>
					</div>
				</Card>
			</main>
		</div>
	);
}

