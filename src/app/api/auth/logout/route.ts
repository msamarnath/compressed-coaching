import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { getSessionCookieName, revokeSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
	const cookieStore = await cookies();
	const token = cookieStore.get(getSessionCookieName())?.value;
	if (token) await revokeSessionToken(token);

	const res = NextResponse.redirect(new URL("/login", req.url), { status: 303 });
	res.cookies.set(getSessionCookieName(), "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});
	return res;
}

