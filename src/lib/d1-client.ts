function normalizePlaceholders(sql: string, paramCount: number): string {
	if (paramCount === 0) return sql;
	let index = 0;
	return sql.replace(/\?/g, () => {
		index += 1;
		return `?${index}`;
	});
}

function assertD1Ok(result: { success?: boolean; error?: string }, context: string): void {
	if (result.success === false) {
		throw new Error(`${context}: ${result.error ?? "D1 operation failed"}`);
	}
}

export function getDatabase(env: CloudflareEnv): D1Database {
	return env.quizmaker_app_database;
}

export async function executeQuery<T = unknown>(
	db: D1Database,
	sql: string,
	...params: unknown[]
): Promise<{ results: T[] }> {
	const normalized = normalizePlaceholders(sql, params.length);
	const stmt = db.prepare(normalized).bind(...params);
	const result = await stmt.all<T>();
	assertD1Ok(result, `executeQuery: ${sql}`);
	return { results: result.results ?? [] };
}

export async function executeQueryFirst<T = unknown>(
	db: D1Database,
	sql: string,
	...params: unknown[]
): Promise<T | null> {
	const { results } = await executeQuery<T>(db, sql, ...params);
	return results.length > 0 ? results[0] : null;
}

export async function executeMutation(
	db: D1Database,
	sql: string,
	...params: unknown[]
): Promise<D1Result> {
	const normalized = normalizePlaceholders(sql, params.length);
	const result = await db.prepare(normalized).bind(...params).run();
	assertD1Ok(result, `executeMutation: ${sql}`);
	return result;
}

export async function executeBatch(db: D1Database, statements: D1PreparedStatement[]): Promise<D1Result[]> {
	return db.batch(statements);
}

