import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { uploadBlogCoverImage } from '@/lib/cloudinary';

export type BlogStatus = 'draft' | 'published';

export interface BlogPostWithAuthor {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  categories: string[];
  tags: string[];
  metaDescription: string | null;
  status: string;
  authorId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: { name: string | null; email: string | null } | null;
}

interface BlogPostRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string | null;
  coverImagePublicId: string | null;
  categories: string[] | null;
  tags: string[] | null;
  metaDescription: string | null;
  status: string;
  authorId: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorName: string | null;
  authorEmail: string | null;
}

export interface ParsedBlogInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string | null;
  status: BlogStatus;
  categories: string[];
  tags: string[];
  image: File | null;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitList(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapBlogRow(row: BlogPostRow): BlogPostWithAuthor {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    coverImageUrl: row.coverImageUrl,
    coverImagePublicId: row.coverImagePublicId,
    categories: row.categories ?? [],
    tags: row.tags ?? [],
    metaDescription: row.metaDescription,
    status: row.status,
    authorId: row.authorId,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    author:
      row.authorName || row.authorEmail
        ? {
            name: row.authorName,
            email: row.authorEmail,
          }
        : null,
  };
}

async function findBlogBySlug(slug: string, options?: { publishedOnly?: boolean }) {
  const rows = await db.$queryRaw<BlogPostRow[]>`
    SELECT
      b.id,
      b.title,
      b.slug,
      b.excerpt,
      b.content,
      b."coverImageUrl",
      b."coverImagePublicId",
      b.categories,
      b.tags,
      b."metaDescription",
      b.status,
      b."authorId",
      b."publishedAt",
      b."createdAt",
      b."updatedAt",
      u.name as "authorName",
      u.email as "authorEmail"
    FROM "BlogPost" b
    LEFT JOIN "User" u ON u.id = b."authorId"
    WHERE b.slug = ${slug}
      AND (${options?.publishedOnly ?? false} = false OR b.status = 'published')
    LIMIT 1
  `;

  return rows[0] ? mapBlogRow(rows[0]) : null;
}

export async function getBlogById(id: string) {
  const rows = await db.$queryRaw<BlogPostRow[]>`
    SELECT
      b.id,
      b.title,
      b.slug,
      b.excerpt,
      b.content,
      b."coverImageUrl",
      b."coverImagePublicId",
      b.categories,
      b.tags,
      b."metaDescription",
      b.status,
      b."authorId",
      b."publishedAt",
      b."createdAt",
      b."updatedAt",
      u.name as "authorName",
      u.email as "authorEmail"
    FROM "BlogPost" b
    LEFT JOIN "User" u ON u.id = b."authorId"
    WHERE b.id = ${id}
    LIMIT 1
  `;

  return rows[0] ? mapBlogRow(rows[0]) : null;
}

export async function getPublishedBlogBySlug(slug: string) {
  return findBlogBySlug(slug, { publishedOnly: true });
}

export async function ensureUniqueSlug(baseSlug: string, existingId?: string) {
  const cleanBase = slugify(baseSlug) || `post-${Date.now()}`;
  let slug = cleanBase;
  let index = 2;

  while (
    (
      await db.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM "BlogPost"
        WHERE slug = ${slug}
          AND (${existingId ?? null}::text IS NULL OR id <> ${existingId ?? null})
        LIMIT 1
      `
    ).length > 0
  ) {
    slug = `${cleanBase}-${index}`;
    index += 1;
  }

  return slug;
}

export async function parseBlogFormData(formData: FormData, existingId?: string) {
  const title = String(formData.get('title') ?? '').trim();
  const requestedSlug = String(formData.get('slug') ?? '').trim();
  const excerpt = String(formData.get('excerpt') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const metaDescription = String(formData.get('metaDescription') ?? '').trim();
  const status = String(formData.get('status') ?? 'draft') === 'published' ? 'published' : 'draft';
  const categories = splitList(formData.get('categories'));
  const tags = splitList(formData.get('tags'));
  const image = formData.get('image');
  const errors: string[] = [];

  if (!title) errors.push('Blog title is required.');
  if (!excerpt) errors.push('Short description is required.');
  if (!content || content.length < 20) errors.push('Blog content must be at least 20 characters.');
  if (metaDescription.length > 180) errors.push('Meta description should stay under 180 characters.');

  if (errors.length > 0) {
    return { ok: false as const, errors };
  }

  return {
    ok: true as const,
    data: {
      title,
      slug: await ensureUniqueSlug(requestedSlug || title, existingId),
      excerpt,
      content,
      metaDescription: metaDescription || null,
      status: status as BlogStatus,
      categories,
      tags,
      image: image instanceof File && image.size > 0 ? image : null,
    } satisfies ParsedBlogInput,
  };
}

export async function createBlogPost(input: {
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaDescription: string | null;
  status: BlogStatus;
  categories: string[];
  tags: string[];
  image: File | null;
}) {
  let imagePayload: { secureUrl: string; publicId: string } | null = null;
  if (input.image) {
    const uploaded = await uploadBlogCoverImage({ file: input.image, slug: input.slug });
    imagePayload = { secureUrl: uploaded.secureUrl, publicId: uploaded.publicId };
  }

  const id = randomUUID();
  const now = new Date();
  const publishedAt = input.status === 'published' ? now : null;
  const rows = await db.$queryRaw<BlogPostRow[]>`
    INSERT INTO "BlogPost" (
      id,
      title,
      slug,
      excerpt,
      content,
      "metaDescription",
      status,
      categories,
      tags,
      "coverImageUrl",
      "coverImagePublicId",
      "authorId",
      "publishedAt",
      "createdAt",
      "updatedAt"
    )
    VALUES (
      ${id},
      ${input.title},
      ${input.slug},
      ${input.excerpt},
      ${input.content},
      ${input.metaDescription},
      ${input.status},
      ${input.categories},
      ${input.tags},
      ${imagePayload?.secureUrl ?? null},
      ${imagePayload?.publicId ?? null},
      ${input.authorId},
      ${publishedAt},
      ${now},
      ${now}
    )
    RETURNING
      id,
      title,
      slug,
      excerpt,
      content,
      "coverImageUrl",
      "coverImagePublicId",
      categories,
      tags,
      "metaDescription",
      status,
      "authorId",
      "publishedAt",
      "createdAt",
      "updatedAt",
      NULL::text as "authorName",
      NULL::text as "authorEmail"
  `;

  return (await getBlogById(rows[0].id)) ?? mapBlogRow(rows[0]);
}

export async function updateBlogPost(id: string, input: ParsedBlogInput) {
  const existing = await getBlogById(id);
  if (!existing) throw new Error('Blog post not found');

  let imagePayload: { secureUrl: string; publicId: string } | null = null;
  if (input.image) {
    const uploaded = await uploadBlogCoverImage({
      file: input.image,
      slug: input.slug,
      previousPublicId: existing.coverImagePublicId,
    });
    imagePayload = { secureUrl: uploaded.secureUrl, publicId: uploaded.publicId };
  }

  const publishedAt = input.status === 'published' ? existing.publishedAt ?? new Date() : null;
  await db.$executeRaw`
    UPDATE "BlogPost"
    SET
      title = ${input.title},
      slug = ${input.slug},
      excerpt = ${input.excerpt},
      content = ${input.content},
      "metaDescription" = ${input.metaDescription},
      status = ${input.status},
      categories = ${input.categories},
      tags = ${input.tags},
      "coverImageUrl" = ${imagePayload?.secureUrl ?? existing.coverImageUrl},
      "coverImagePublicId" = ${imagePayload?.publicId ?? existing.coverImagePublicId},
      "publishedAt" = ${publishedAt},
      "updatedAt" = ${new Date()}
    WHERE id = ${id}
  `;

  const updated = await getBlogById(id);
  if (!updated) throw new Error('Blog post not found');
  return updated;
}

export async function listAdminBlogs() {
  const rows = await db.$queryRaw<BlogPostRow[]>`
    SELECT
      b.id,
      b.title,
      b.slug,
      b.excerpt,
      b.content,
      b."coverImageUrl",
      b."coverImagePublicId",
      b.categories,
      b.tags,
      b."metaDescription",
      b.status,
      b."authorId",
      b."publishedAt",
      b."createdAt",
      b."updatedAt",
      u.name as "authorName",
      u.email as "authorEmail"
    FROM "BlogPost" b
    LEFT JOIN "User" u ON u.id = b."authorId"
    ORDER BY b."createdAt" DESC
  `.catch(() => []);

  return rows.map(mapBlogRow);
}

export async function listPublishedBlogs() {
  const rows = await db.$queryRaw<BlogPostRow[]>`
    SELECT
      b.id,
      b.title,
      b.slug,
      b.excerpt,
      b.content,
      b."coverImageUrl",
      b."coverImagePublicId",
      b.categories,
      b.tags,
      b."metaDescription",
      b.status,
      b."authorId",
      b."publishedAt",
      b."createdAt",
      b."updatedAt",
      u.name as "authorName",
      u.email as "authorEmail"
    FROM "BlogPost" b
    LEFT JOIN "User" u ON u.id = b."authorId"
    WHERE b.status = 'published'
    ORDER BY b."publishedAt" DESC NULLS LAST, b."createdAt" DESC
  `.catch(() => []);

  return rows.map(mapBlogRow);
}

export async function deleteBlogPost(id: string) {
  await db.$executeRaw`
    DELETE FROM "BlogPost"
    WHERE id = ${id}
  `;
}
