import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export async function getPosts(opts?: { includeDrafts?: boolean }) {
  const includeDrafts = opts?.includeDrafts ?? false;
  const posts = await getCollection('posts', ({ data }) => includeDrafts ? true : !data.draft);
  // Sort newest first
  posts.sort((a, b) => {
    const aDate = a.data.date instanceof Date ? a.data.date.getTime() : new Date(a.data.date as unknown as string).getTime();
    const bDate = b.data.date instanceof Date ? b.data.date.getTime() : new Date(b.data.date as unknown as string).getTime();
    return bDate - aDate;
  });
  return posts;
}

export async function getAllTags(opts?: { includeDrafts?: boolean }) {
  const posts = await getPosts(opts);
  const tagSet = new Set<string>();
  posts.forEach((p) => (p.data.tags || []).forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

export function formatDate(d: Date | string) {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export type PostEntry = CollectionEntry<'posts'>;
