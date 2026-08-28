import { describe, expect, it } from "vitest";
import { normalizeWebDevelopmentService } from "@/lib/cms/normalize";
import { defaultWebDevelopmentService } from "@/lib/cms/defaults";

describe("normalizeWebDevelopmentService", () => {
  it("merges partial payloads with defaults", () => {
    const result = normalizeWebDevelopmentService({
      slug: "web-development",
      seoTitle: "Test title",
    });
    expect(result.seoTitle).toBe("Test title");
    expect(result.hero.slides.length).toBeGreaterThan(0);
    expect(result.slug).toBe("web-development");
  });

  it("returns defaults for invalid input", () => {
    const result = normalizeWebDevelopmentService(null);
    expect(result).toEqual(defaultWebDevelopmentService);
  });
});

describe("rateLimit", () => {
  it("blocks after limit exceeded", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test-${Date.now()}`;
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(true);
    expect(rateLimit(key, 2, 60_000).allowed).toBe(false);
  });
});
