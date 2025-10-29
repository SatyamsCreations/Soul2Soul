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

/**
 * Build a short excerpt from the post's actual content (fallbacks to frontmatter description).
 * Strips code, HTML/MDX tags, images, and markdown syntax, then trims to maxChars.
 */
export function getExcerpt(post: CollectionEntry<'posts'>, maxChars = 160) {
  const raw = typeof (post as any).body === 'string' ? ((post as any).body as string) : '';
  let text = raw || (post.data.description ?? '');
  if (!text) return '';

  // Remove code fences and inline code
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');

  // Remove images
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ');

  // Convert links: [label](url) -> label, and reference links
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

  // Remove HTML/MDX tags/components
  text = text.replace(/<[^>]+>/g, ' ');

  // Remove leading markdown tokens on lines (headings, quotes, lists)
  text = text.replace(/^[#>*\-\s]+/gm, '');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length > maxChars) {
    let cut = text.slice(0, maxChars).trim();
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > 60) cut = cut.slice(0, lastSpace);
    text = cut + '…';
  }

  return text;
}

/**
 * Build an HTML excerpt that preserves basic emphasis (bold/italic) from the first paragraph.
 * - Escapes HTML to avoid injection, then rehydrates bold/italic markers into <strong>/<em>.
 * - Strips code blocks/inline code, images, and converts links to their label.
 * - Relies on CSS line-clamp in the list for visual truncation.
 */
export function getExcerptHtml(post: CollectionEntry<'posts'>) {
  const raw = typeof (post as any).body === 'string' ? ((post as any).body as string) : (post.data.description ?? '');
  if (!raw) return '';

  // Remove fenced code blocks first so they don't pollute paragraphs
  const pre = raw.replace(/```[\s\S]*?```/g, ' ');

  // Take the first two non-empty paragraphs (before blank lines)
  const paras = pre.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).slice(0, 2);

  const cleaned = paras.map((p) => {
    let s = p;

    // Remove inline code
    s = s.replace(/`[^`]*`/g, ' ');

    // Remove images
    s = s.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ');

    // Convert links to label (inline + reference)
    s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    s = s.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

    // Remove any raw HTML/MDX tags/components
    s = s.replace(/<[^>]+>/g, ' ');

    // Remove markdown list/quote/heading markers at line starts
    s = s.replace(/^[#>*\-\s]+/gm, '');

    // Escape HTML to ensure safety before inserting our own tags
    s = s.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');

    // Preserve emphasis: bold first, then italic
    s = s.replace(/(\*\*|__)(.+?)\1/g, '<strong>$2</strong>');
    s = s.replace(/(\*|_)([^*_]+?)\1/g, '<em>$2</em>');

    // Normalize whitespace within the paragraph
    s = s.replace(/\s+/g, ' ').trim();

    return s;
  });

  // Join paragraphs with an explicit line break so the second paragraph starts on the next line
  const out = cleaned.join(' <br /> ');

  return out;
}

/**
 * Compute estimated reading time like Medium: minutes = ceil(words / wpm).
 * - Strips code blocks/inline code, images, HTML/MDX tags, links, and markdown markers
 * - Defaults to 200 words per minute
 */
export function getReadingTime(post: CollectionEntry<'posts'>, wpm = 200) {
  const raw = typeof (post as any).body === 'string' ? ((post as any).body as string) : '';
  let text = raw || (post.data.description ?? '');
  if (!text) return { minutes: 1, text: '1 min read', words: 0 };

  // Remove code fences and inline code
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');

  // Remove images
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, ' ');

  // Convert links to label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  text = text.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1');

  // Remove any raw HTML/MDX tags/components
  text = text.replace(/<[^>]+>/g, ' ');

  // Remove markdown list/quote/heading markers at line starts
  text = text.replace(/^[#>*\-\s]+/gm, '');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  const words = text ? text.split(/\s+/).length : 0;
  const minutes = Math.max(1, Math.ceil(words / wpm));
  return { minutes, text: `${minutes} min read`, words };
}

export type PostEntry = CollectionEntry<'posts'>;
