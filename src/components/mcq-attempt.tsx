"use client";

import * as React from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

type McqOption = {
	id: string;
	text: string;
	isCorrect: boolean;
	displayOrder: number;
};

type McqDetail = {
	id: string;
	title: string;
	explanation: string | null;
	marks: number;
	difficulty: string;
	tags: string[];
	options: McqOption[];
};

export function McqAttempt({ questionId }: { questionId: string }) {
	const [data, setData] = React.useState<McqDetail | null>(null);
	const [isLoading, setIsLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const [selectedId, setSelectedId] = React.useState<string | null>(null);
	const [submitted, setSubmitted] = React.useState(false);

	React.useEffect(() => {
		let alive = true;

		async function run() {
			setIsLoading(true);
			setError(null);
			try {
				const res = await fetch(`/api/mcq/${questionId}`, { method: "GET" });
				if (!res.ok) {
					const body = (await res.json().catch(() => null)) as { error?: string } | null;
					throw new Error(body?.error ?? "Failed to load question.");
				}
				const json = (await res.json()) as McqDetail;
				if (!alive) return;
				setData(json);
				setSelectedId(json.options[0]?.id ?? null);
			} catch (e) {
				if (!alive) return;
				setError(e instanceof Error ? e.message : "Failed to load question.");
			} finally {
				if (!alive) return;
				setIsLoading(false);
			}
		}

		void run();
		return () => {
			alive = false;
		};
	}, [questionId]);

	function submit() {
		setSubmitted(true);
	}

	function reset() {
		setSubmitted(false);
	}

	if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
	if (error) return <Alert aria-live="polite">{error}</Alert>;
	if (!data) return <Alert aria-live="polite">Question not found.</Alert>;

	const correct = data.options.find((o) => o.isCorrect) ?? null;
	const selected = data.options.find((o) => o.id === selectedId) ?? null;
	const isCorrect = submitted && correct && selected ? correct.id === selected.id : null;

	return (
		<div className="space-y-6">
			<div className="space-y-2">
				<p className="text-sm text-muted-foreground">Question Title</p>
				<p className="text-lg font-semibold leading-relaxed">{data.title}</p>
				<div className="flex flex-wrap items-center gap-2 pt-1">
					<Badge variant="outline">{data.marks} mark{data.marks === 1 ? "" : "s"}</Badge>
					<Badge variant="outline">{data.difficulty}</Badge>
					{data.tags?.length ? (
						data.tags.map((t) => (
							<Badge key={t} variant="default">
								{t}
							</Badge>
						))
					) : (
						<Badge variant="outline">No tags</Badge>
					)}
				</div>
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<p className="text-sm font-medium">Options</p>
					{submitted ? (
						isCorrect ? <Badge variant="success">Correct</Badge> : <Badge variant="destructive">Wrong</Badge>
					) : (
						<Badge variant="outline">Not submitted</Badge>
					)}
				</div>

				<div className="space-y-2">
					{data.options.map((o) => {
						const showCorrect = submitted && o.isCorrect;
						const showWrongPick = submitted && selectedId === o.id && !o.isCorrect;

						return (
							<label
								key={o.id}
								className={cn(
									"flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
									"hover:bg-muted/30",
									selectedId === o.id && "border-foreground/20 bg-muted/20",
									showCorrect && "border-emerald-500/30 bg-emerald-500/10",
									showWrongPick && "border-destructive/30 bg-destructive/10",
								)}
							>
								<input
									type="radio"
									name="attempt"
									checked={selectedId === o.id}
									onChange={() => setSelectedId(o.id)}
									disabled={submitted}
									className="mt-1"
								/>
								<div className="flex-1">
									<p className="font-medium">{o.text}</p>
									{submitted && o.isCorrect ? (
										<p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">Correct answer</p>
									) : null}
									{submitted && selectedId === o.id && !o.isCorrect ? (
										<p className="mt-1 text-sm text-destructive">Your selection</p>
									) : null}
								</div>
							</label>
						);
					})}
				</div>
			</div>

			{data.explanation ? (
				<div className="rounded-lg border bg-muted/20 p-4">
					<p className="text-sm font-medium mb-1">Explanation</p>
					<p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.explanation}</p>
				</div>
			) : null}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
				{submitted ? (
					<Button type="button" variant="outline" onClick={reset}>
						Try again
					</Button>
				) : (
					<Button type="button" onClick={submit} disabled={!selectedId}>
						Submit answer
					</Button>
				)}
			</div>
		</div>
	);
}

