import { getCollection } from 'astro:content';
export async function allStories() {
  return (await getCollection('stories')).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
// Reading time from the raw markdown (figures and markup removed)
export function readMins(body: string) {
  const words = body.replace(/<[^>]+>/g, ' ').replace(/[#*_>\[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 130));
}
