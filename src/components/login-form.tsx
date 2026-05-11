"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setError(data.error ?? "Login failed.");
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

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
			</div>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Logging in..." : "Log in"}
			</Button>
		</form>
	);
}

