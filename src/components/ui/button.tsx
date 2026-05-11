import * as React from "react";

import { cn } from "@/components/ui/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: "default" | "secondary" | "outline" | "destructive" | "ghost";
	size?: "default" | "sm" | "lg";
};

export function Button({ className, variant = "default", size = "default", ...props }: ButtonProps) {
	return (
		<button
			className={cn(
				"inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"disabled:pointer-events-none disabled:opacity-50",
				"ring-offset-background",
				size === "sm" && "h-9 px-3",
				size === "default" && "h-10 px-4 py-2",
				size === "lg" && "h-11 px-8",
				variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/85",
				variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80",
				variant === "outline" && "border border-border bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/70",
				variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80",
				variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
				className,
			)}
			{...props}
		/>
	);
}

