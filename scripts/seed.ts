import { defaultWebDevelopmentService } from "../lib/cms/defaults";
import { readWebDevelopmentService, writeWebDevelopmentService } from "../lib/cms/service-repository";

async function main() {
  const current = await readWebDevelopmentService();
  if (current.seoTitle) {
    console.log("Service already seeded:", current.slug, `(v${(current as { version?: number }).version ?? "json"})`);
    return;
  }
  await writeWebDevelopmentService(defaultWebDevelopmentService, "seed-script");
  console.log("Seeded web-development service.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
