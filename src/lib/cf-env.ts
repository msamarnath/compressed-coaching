import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getCfEnv(): CloudflareEnv {
	const { env } = getCloudflareContext();
	return env;
}

