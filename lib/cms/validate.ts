import type { WebDevelopmentService } from "@/lib/types";
import { normalizeWebDevelopmentService } from "@/lib/cms/normalize";

/**
 * Runtime guard — accepts legacy + current shapes, then normalizes.
 */
export function isWebDevelopmentService(
  value: unknown
): value is WebDevelopmentService {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record.slug !== "web-development") return false;
  try {
    normalizeWebDevelopmentService(value);
    return true;
  } catch {
    return false;
  }
}
