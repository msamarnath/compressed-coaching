import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
	return (
		<div className="min-h-screen bg-background">
			<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
			<div className="relative flex min-h-screen items-center justify-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Welcome back</CardTitle>
					<CardDescription>Log in to view and manage your MCQ questions.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<LoginForm />
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link className="underline underline-offset-4" href="/signup">
							Sign up
						</Link>
					</p>
				</CardContent>
			</Card>
			</div>
		</div>
	);
}

