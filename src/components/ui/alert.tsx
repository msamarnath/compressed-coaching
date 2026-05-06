import * as React from "react";

import { cn } from "@/components/ui/cn";

export function Alert({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div role="alert" className={cn("relative w-full rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive", className)} {...props} />;
}

