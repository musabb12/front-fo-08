import { readWebDevelopmentService } from "@/lib/cms/service-repository";

/**
 * Load CMS content directly from the repository (no HTTP round-trip).
 */
export async function fetchWebDevelopmentService() {
  return readWebDevelopmentService();
}
