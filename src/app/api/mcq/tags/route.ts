import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getCfEnv } from "@/lib/cf-env";
import { executeQuery, getDatabase } from "@/lib/d1-client";

export async function GET() {
	const user = await getCurrentUser();
	if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

	const env = getCfEnv();
	const db = getDatabase(env);

	const { results } = await executeQuery<{ name: string }>(
		db,
		"SELECT name FROM mcq_tags WHERE user_id = ? ORDER BY name ASC LIMIT 100",
		user.id,
	);

	return NextResponse.json({ items: results.map((r) => r.name) });
}

