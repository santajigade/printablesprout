import { allPrintables } from '../lib/printables';
export async function GET() {
  const items = await allPrintables();
  return new Response(JSON.stringify(items.map((p) => ({ t: p.data.title, s: p.data.slug, c: p.data.category, d: p.data.description, k: (p.data.keywords ?? '') + ' ' + p.data.tags.join(' '), i: p.data.image }))),
    { headers: { 'Content-Type': 'application/json' } });
}
