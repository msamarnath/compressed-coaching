import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCfEnv } from "@/lib/cf-env";
import { getDatabase, executeMutation, executeQueryFirst } from "@/lib/d1-client";
import { pbkdf2HashPassword, pbkdf2VerifyPassword, randomToken, sha256Hex } from "@/lib/crypto";

const SESSION_COOKIE_NAME = "qm_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const SignupSchema = z.object({
	firstName: z.string().trim().min(1).max(80),
	lastName: z.string().trim().min(1).max(80),
	email: z.string().trim().toLowerCase().email().max(254),
	password: z.string().min(8).max(128),
});

export const LoginSchema = z.object({
	email: z.string().trim().toLowerCase().email().max(254),
	password: z.string().min(1).max(128),
});

type DbUser = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	password_hash: string;
};

export function getSessionCookieName(): string {
	return SESSION_COOKIE_NAME;
}

export function getSessionCookieMaxAgeSeconds(): number {
	return Math.floor(SESSION_DURATION_MS / 1000);
}

export type CurrentUser = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
	if (!token) return null;

	const env = getCfEnv();
	const db = getDatabase(env);
	const tokenHash = await sha256Hex(token);

	const row = await executeQueryFirst<{
		user_id: string;
		email: string;
		first_name: string;
		last_name: string;
		expires_at: string;
		revoked_at: string | null;
	}>(
		db,
		`
    SELECT
      s.user_id,
      u.email,
      u.first_name,
      u.last_name,
      s.expires_at,
      s.revoked_at
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.session_token_hash = ?
      AND s.revoked_at IS NULL
      AND s.expires_at > CURRENT_TIMESTAMP
    LIMIT 1
  `,
		tokenHash,
	);

	if (!row) return null;

	void executeMutation(db, "UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE session_token_hash = ?", tokenHash);

	return {
		id: row.user_id,
		email: row.email,
		firstName: row.first_name,
		lastName: row.last_name,
	};
}

export async function requireUser(): Promise<CurrentUser> {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	return user;
}

export async function signup(input: unknown): Promise<void> {
	const parsed = SignupSchema.parse(input);
	const env = getCfEnv();
	const db = getDatabase(env);

	const existing = await executeQueryFirst<{ id: string }>(db, "SELECT id FROM users WHERE email = ? LIMIT 1", parsed.email);
	if (existing) {
		throw new Error("EMAIL_IN_USE");
	}

	const passwordHash = await pbkdf2HashPassword(parsed.password);
	await executeMutation(
		db,
		`INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)`,
		parsed.firstName,
		parsed.lastName,
		parsed.email,
		passwordHash,
	);

	const user = await executeQueryFirst<DbUser>(db, "SELECT * FROM users WHERE email = ? LIMIT 1", parsed.email);
	if (!user) throw new Error("SIGNUP_FAILED");

	await createSessionForUser(user.id);
}

export async function login(input: unknown): Promise<void> {
	const parsed = LoginSchema.parse(input);
	const env = getCfEnv();
	const db = getDatabase(env);

	const user = await executeQueryFirst<DbUser>(db, "SELECT * FROM users WHERE email = ? LIMIT 1", parsed.email);
	if (!user) throw new Error("INVALID_CREDENTIALS");

	const ok = await pbkdf2VerifyPassword(parsed.password, user.password_hash);
	if (!ok) throw new Error("INVALID_CREDENTIALS");

	await createSessionForUser(user.id);
}

export async function createSessionForUser(userId: string): Promise<string> {
	const env = getCfEnv();
	const db = getDatabase(env);

	const token = randomToken(32);
	const tokenHash = await sha256Hex(token);

	const headerStore = await headers();
	const ua = headerStore.get("user-agent");
	const forwardedFor = headerStore.get("x-forwarded-for");
	const ipAddress = forwardedFor ? forwardedFor.split(",")[0]?.trim() : null;

	await executeMutation(
		db,
		`INSERT INTO sessions (user_id, session_token_hash, expires_at, user_agent, ip_address)
     VALUES (?, ?, datetime(CURRENT_TIMESTAMP, '+7 days'), ?, ?)`,
		userId,
		tokenHash,
		ua,
		ipAddress,
	);

	return token;
}

export async function revokeSessionToken(token: string): Promise<void> {
	const env = getCfEnv();
	const db = getDatabase(env);
	const tokenHash = await sha256Hex(token);
	await executeMutation(db, "UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE session_token_hash = ?", tokenHash);
}

