import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * Called by the admin after it changes products or variants, so the store shows the
 * change straight away instead of after the 60-second page cache. Clearing the cache is
 * harmless (pages just fetch fresh data), so no secret is needed.
 */
export async function POST() {
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
