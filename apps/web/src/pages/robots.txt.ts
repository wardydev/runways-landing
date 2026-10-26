import { loadContent } from '../lib/content.mjs';
import { robots } from '../lib/pages.mjs';
export async function GET() {
  return new Response(robots(await loadContent(import.meta.env)), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
