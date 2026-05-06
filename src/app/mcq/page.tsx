import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCfEnv } from "@/lib/cf-env";
import { requireUser } from "@/lib/auth";
import { executeQueryFirst, getDatabase } from "@/lib/d1-client";

export default async function McqListPage() {
	const user = await requireUser();
	const env = getCfEnv();
	const db = getDatabase(env);

	const row = await executeQueryFirst<{ count: number }>(
		db,
		"SELECT COUNT(1) as count FROM mcq_questions WHERE user_id = ?",
		user.id,
	);
	const count = row?.count ?? 0;

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
				<Card>
					<CardHeader>
						<CardTitle>MCQ Questions</CardTitle>
						<CardDescription>Manage your multiple choice questions.</CardDescription>
					</CardHeader>
					<CardContent>
						{count === 0 ? (
							<div className="py-16 text-center">
								<p className="text-lg font-semibold">NO questions created yet</p>
							</div>
						) : (
							<p className="text-sm text-muted-foreground">You have {count} question(s).</p>
						)}
					</CardContent>
				</Card>
			</main>
		</div>
	);
}

