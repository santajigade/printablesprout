import { getCollection } from 'astro:content';
export async function allPrintables() {
  const p = await getCollection('printables');
  return p.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
