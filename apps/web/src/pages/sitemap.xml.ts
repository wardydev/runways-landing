import { loadContent } from '../lib/content.mjs';
import { sitemap } from '../lib/pages.mjs';
export async function GET() {
  return new Response(sitemap(await loadContent(import.meta.env)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
