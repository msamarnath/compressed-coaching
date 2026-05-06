import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-background">
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
	);
}

