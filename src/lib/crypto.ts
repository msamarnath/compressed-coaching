function toHex(bytes: ArrayBuffer): string {
	return Array.from(new Uint8Array(bytes))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function fromHex(hex: string): Uint8Array {
	if (hex.length % 2 !== 0) throw new Error("Invalid hex string");
	const out = new Uint8Array(hex.length / 2);
	for (let i = 0; i < out.length; i += 1) {
		out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return out;
}

export function randomToken(bytes: number): string {
	const arr = new Uint8Array(bytes);
	crypto.getRandomValues(arr);
	return toHex(arr.buffer);
}

export async function sha256Hex(input: string): Promise<string> {
	const data = new TextEncoder().encode(input);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return toHex(digest);
}

export async function pbkdf2HashPassword(password: string, options?: { iterations?: number }): Promise<string> {
	const iterations = options?.iterations ?? 100_000;
	const salt = new Uint8Array(32);
	crypto.getRandomValues(salt);
	const saltBuffer = salt.slice().buffer; // ensure ArrayBuffer (not ArrayBufferLike)

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);

	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations },
		keyMaterial,
		256,
	);

	return `pbkdf2_sha256$${iterations}$${toHex(salt.buffer)}$${toHex(bits)}`;
}

export async function pbkdf2VerifyPassword(password: string, encoded: string): Promise<boolean> {
	const [scheme, iterationsStr, saltHex, hashHex] = encoded.split("$");
	if (scheme !== "pbkdf2_sha256") return false;
	const iterations = Number(iterationsStr);
	if (!Number.isFinite(iterations) || iterations <= 0) return false;

	const salt = fromHex(saltHex);
	const expectedHash = fromHex(hashHex);
	const saltBuffer = salt.slice().buffer; // ensure ArrayBuffer (not ArrayBufferLike)

	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		{ name: "PBKDF2" },
		false,
		["deriveBits"],
	);

	const bits = await crypto.subtle.deriveBits(
		{ name: "PBKDF2", hash: "SHA-256", salt: saltBuffer, iterations },
		keyMaterial,
		256,
	);

	const actual = new Uint8Array(bits);
	if (actual.length !== expectedHash.length) return false;

	let diff = 0;
	for (let i = 0; i < actual.length; i += 1) diff |= actual[i] ^ expectedHash[i];
	return diff === 0;
}

