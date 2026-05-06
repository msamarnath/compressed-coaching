import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/components/signup-form";

export default function SignupPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-6 bg-background">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>Create your account</CardTitle>
					<CardDescription>Sign up to start creating and managing MCQ questions.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<SignupForm />
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link className="underline underline-offset-4" href="/login">
							Log in
						</Link>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

