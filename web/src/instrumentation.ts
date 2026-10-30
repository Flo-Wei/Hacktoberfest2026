export async function register() {
  // Next.js also builds this file for Edge, and only drops the import in this exact form.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { syncCatalog } = await import("./lib/catalog");
    void syncCatalog();
  }
}
