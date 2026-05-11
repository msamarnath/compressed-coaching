"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Option = { id: string; text: string };

function newId(): string {
	return Math.random().toString(16).slice(2);
}

function normalizeTag(raw: string): string {
	return raw.trim().replace(/\s+/g, " ");
}

export function CreateMcqForm() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const [title, setTitle] = React.useState("");
	const [explanation, setExplanation] = React.useState("");
	const [marks, setMarks] = React.useState<number>(1);
	const [difficulty, setDifficulty] = React.useState<"Easy" | "Medium" | "Hard">("Medium");
	const [tags, setTags] = React.useState<string[]>([]);
	const [tagInput, setTagInput] = React.useState("");
	const [tagSuggestions, setTagSuggestions] = React.useState<string[]>([]);

	const [options, setOptions] = React.useState<Option[]>([
		{ id: newId(), text: "" },
		{ id: newId(), text: "" },
		{ id: newId(), text: "" },
		{ id: newId(), text: "" },
	]);
	const [correctOptionIndex, setCorrectOptionIndex] = React.useState(0);

	React.useEffect(() => {
		let alive = true;
		async function load() {
			try {
				const res = await fetch("/api/mcq/tags");
				if (!res.ok) return;
				const json = (await res.json()) as { items: string[] };
				if (!alive) return;
				setTagSuggestions(json.items ?? []);
			} catch {
				// ignore (tags are optional)
			}
		}
		void load();
		return () => {
			alive = false;
		};
	}, []);

	function setOptionText(index: number, text: string) {
		setOptions((prev) => prev.map((o, i) => (i === index ? { ...o, text } : o)));
	}

	function addOption() {
		setOptions((prev) => [...prev, { id: newId(), text: "" }]);
	}

	function removeOption(index: number) {
		setOptions((prev) => prev.filter((_, i) => i !== index));
		setCorrectOptionIndex((prev) => {
			if (index === prev) return 0;
			if (index < prev) return prev - 1;
			return prev;
		});
	}

	function addTag(raw: string) {
		const tag = normalizeTag(raw);
		if (!tag) return;
		setTags((prev) => (prev.includes(tag) ? prev : [...prev, tag].slice(0, 20)));
		setTagInput("");
	}

	function removeTag(tag: string) {
		setTags((prev) => prev.filter((t) => t !== tag));
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsSubmitting(true);
		setError(null);

		try {
			const res = await fetch("/api/mcq", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					title,
					explanation,
					marks,
					difficulty,
					tags,
					options: options.map((o) => o.text),
					correctOptionIndex,
				}),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				setError(data.error ?? "Failed to create question.");
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
		<form className="space-y-6" onSubmit={onSubmit}>
			{error ? <Alert aria-live="polite">{error}</Alert> : null}

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="title">Question Title</Label>
					<Textarea
						id="title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Type the question title…"
						required
					/>
				</div>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="marks">Marks</Label>
						<Input
							id="marks"
							type="number"
							min={0}
							max={1000}
							value={marks}
							onChange={(e) => setMarks(Number(e.target.value))}
							inputMode="numeric"
							required
							aria-describedby="marks-help"
						/>
						<p id="marks-help" className="text-xs text-muted-foreground">
							Enter a non-negative number.
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="difficulty">Difficulty Level</Label>
						<select
							id="difficulty"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							value={difficulty}
							onChange={(e) => setDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
							aria-label="Difficulty level"
						>
							<option value="Easy">Easy</option>
							<option value="Medium">Medium</option>
							<option value="Hard">Hard</option>
						</select>
					</div>
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="explanation">Explanation (optional)</Label>
				<Textarea
					id="explanation"
					value={explanation}
					onChange={(e) => setExplanation(e.target.value)}
					placeholder="Explain why the correct answer is correct…"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="tags">Tags</Label>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<Input
						id="tags"
						list="tag-suggestions"
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						placeholder="Type a tag and press Enter…"
						aria-label="Add tag"
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								addTag(tagInput);
							}
						}}
					/>
					<Button type="button" variant="outline" onClick={() => addTag(tagInput)} disabled={!normalizeTag(tagInput)}>
						Add tag
					</Button>
					<datalist id="tag-suggestions">
						{tagSuggestions.map((t) => (
							<option key={t} value={t} />
						))}
					</datalist>
				</div>

				{tags.length > 0 ? (
					<ul className="flex flex-wrap gap-2" aria-label="Selected tags">
						{tags.map((t) => (
							<li key={t} className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm">
								<span>{t}</span>
								<button
									type="button"
									className="underline underline-offset-2"
									onClick={() => removeTag(t)}
									aria-label={`Remove tag ${t}`}
								>
									Remove
								</button>
							</li>
						))}
					</ul>
				) : (
					<p className="text-xs text-muted-foreground">Optional. Add up to 20 tags.</p>
				)}
			</div>

			<div className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-sm font-medium">Options</p>
						<p className="text-sm text-muted-foreground">Select the correct answer.</p>
					</div>
					<Button type="button" variant="outline" onClick={addOption} disabled={options.length >= 10}>
						Add option
					</Button>
				</div>

				<div className="space-y-3">
					{options.map((opt, idx) => (
						<div
							key={opt.id}
							className="rounded-lg border bg-background p-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center"
						>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="radio"
									name="correct"
									checked={correctOptionIndex === idx}
									onChange={() => setCorrectOptionIndex(idx)}
								/>
								<span className="text-muted-foreground">Correct</span>
							</label>

							<div className="flex-1">
								<Label className="sr-only" htmlFor={`opt-${opt.id}`}>
									Option {idx + 1}
								</Label>
								<Input
									id={`opt-${opt.id}`}
									value={opt.text}
									onChange={(e) => setOptionText(idx, e.target.value)}
									placeholder={`Option ${idx + 1}`}
									required
								/>
							</div>

							<Button
								type="button"
								variant="ghost"
								onClick={() => removeOption(idx)}
								disabled={options.length <= 2}
							>
								Remove
							</Button>
						</div>
					))}
				</div>
			</div>

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
				<Button type="button" variant="outline" onClick={() => router.push("/mcq")} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving..." : "Save question"}
				</Button>
			</div>
		</form>
	);
}

