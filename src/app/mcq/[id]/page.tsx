import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { McqAttempt } from "@/components/mcq-attempt";
import { requireUser } from "@/lib/auth";

export default async function McqPreviewPage({ params }: { params: Promise<{ id: string }> }) {
	await requireUser();
	const { id } = await params;

	return (
		<div className="min-h-screen bg-background">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
			<div className="relative mx-auto max-w-5xl px-6 py-10">
				<div className="mb-6 flex items-center justify-between gap-4">
					<Link className="text-sm text-muted-foreground underline underline-offset-4" href="/mcq">
						← Back to list
					</Link>
					<form action="/api/auth/logout" method="post">
						<Button type="submit" variant="outline" size="sm">
							Logout
						</Button>
					</form>
				</div>

				<Card>
					<CardHeader className="space-y-3">
						<div className="flex items-center justify-between gap-4">
							<CardTitle>Preview</CardTitle>
							<Badge variant="outline">MCQ</Badge>
						</div>
						<CardDescription>Select an option and submit to check your answer.</CardDescription>
					</CardHeader>
					<CardContent>
						<McqAttempt questionId={id} />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

