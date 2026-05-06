import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { LoginSchema, createSessionForUser, getSessionCookieMaxAgeSeconds, getSessionCookieName } from "@/lib/auth";
import { getCfEnv } from "@/lib/cf-env";
import { executeQueryFirst, getDatabase } from "@/lib/d1-client";
import { pbkdf2VerifyPassword } from "@/lib/crypto";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = LoginSchema.parse(body);

		const env = getCfEnv();
		const db = getDatabase(env);

		const user = await executeQueryFirst<{ id: string; password_hash: string }>(
			db,
			"SELECT id, password_hash FROM users WHERE email = ? LIMIT 1",
			parsed.email,
		);

		if (!user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

		const ok = await pbkdf2VerifyPassword(parsed.password, user.password_hash);
		if (!ok) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

		const token = await createSessionForUser(user.id);
		const res = NextResponse.json({ ok: true });
		res.cookies.set(getSessionCookieName(), token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: getSessionCookieMaxAgeSeconds(),
		});
		return res;
	} catch (err) {
		if (err instanceof ZodError) {
			return NextResponse.json({ error: "Invalid login data." }, { status: 400 });
		}

		return NextResponse.json({ error: "Failed to log in." }, { status: 500 });
	}
}

