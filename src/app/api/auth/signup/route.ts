import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { SignupSchema, createSessionForUser, getSessionCookieMaxAgeSeconds, getSessionCookieName } from "@/lib/auth";
import { getCfEnv } from "@/lib/cf-env";
import { executeQueryFirst, getDatabase } from "@/lib/d1-client";
import { pbkdf2HashPassword } from "@/lib/crypto";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const parsed = SignupSchema.parse(body);

		const env = getCfEnv();
		const db = getDatabase(env);

		const existing = await executeQueryFirst<{ id: string }>(
			db,
			"SELECT id FROM users WHERE email = ? LIMIT 1",
			parsed.email,
		);
		if (existing) {
			return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
		}

		const passwordHash = await pbkdf2HashPassword(parsed.password);
		const user = await executeQueryFirst<{ id: string }>(
			db,
			`INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES (?, ?, ?, ?)
       RETURNING id`,
			parsed.firstName,
			parsed.lastName,
			parsed.email,
			passwordHash,
		);
		if (!user) return NextResponse.json({ error: "Failed to sign up." }, { status: 500 });

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
			return NextResponse.json({ error: "Invalid signup data." }, { status: 400 });
		}

		return NextResponse.json({ error: "Failed to sign up." }, { status: 500 });
	}
}

