import * as React from "react";

import { cn } from "@/components/ui/cn";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
	variant?: "default" | "success" | "destructive" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
				variant === "default" && "bg-muted text-foreground border-transparent",
				variant === "outline" && "bg-transparent text-foreground",
				variant === "success" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
				variant === "destructive" && "bg-destructive/10 text-destructive border-destructive/20",
				className,
			)}
			{...props}
		/>
	);
}

