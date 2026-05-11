import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateMcqForm } from "@/components/create-mcq-form";
import { requireUser } from "@/lib/auth";

export default async function NewMcqPage() {
	await requireUser();

	return (
		<div className="min-h-screen bg-background">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
			<div className="relative mx-auto max-w-5xl px-6 py-10">
				<div className="mb-6">
					<Link className="text-sm text-muted-foreground underline underline-offset-4" href="/mcq">
						← Back to list
					</Link>
				</div>
				<Card>
					<CardHeader>
						<CardTitle>Create MCQ</CardTitle>
						<CardDescription>Enter the question prompt, options, and choose the correct answer.</CardDescription>
					</CardHeader>
					<CardContent>
						<CreateMcqForm />
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

