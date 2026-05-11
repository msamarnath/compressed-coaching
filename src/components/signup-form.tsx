"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ firstName, lastName, email, password }),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setError(data.error ?? "Signup failed.");
				return;
			}

			router.push("/mcq");
			router.refresh();
		} catch {
			setError("Unexpected error. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form className="space-y-4" onSubmit={onSubmit}>
			{error ? <Alert aria-live="polite">{error}</Alert> : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<Label htmlFor="firstName">First name</Label>
					<Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" required />
				</div>
				<div className="space-y-2">
					<Label htmlFor="lastName">Last name</Label>
					<Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" required />
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
			</div>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Creating account..." : "Create account"}
			</Button>
		</form>
	);
}

