import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, Linkedin, Mail, User } from 'lucide-react';
import { getPublishedBlogBySlug } from '@/lib/blog';
import { PublicHeader } from '@/components/marketing/PublicHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);
  if (!blog) return {};

  return {
    title: `${blog.title} | All In One SEO Audit Tool`,
    description: blog.metaDescription || blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.metaDescription || blog.excerpt,
      images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) notFound();

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/blog/${blog.slug}`;

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <PublicHeader />

      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
          <ArrowLeft className="size-4" />
          Back to blog
        </Link>

        <div className="mt-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {blog.categories.map((category) => (
              <Badge key={category} variant="secondary">{category}</Badge>
            ))}
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{blog.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">{blog.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-2"><User className="size-4" /> {blog.author?.name ?? 'SEO Team'}</span>
            <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {blog.coverImageUrl && (
          <img src={blog.coverImageUrl} alt={blog.title} className="mt-8 aspect-[16/9] w-full rounded-xl object-cover shadow-sm" />
        )}

        <div
          className="prose prose-slate mt-10 max-w-none prose-headings:font-semibold prose-a:text-orange-600 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6 dark:border-slate-800">
          <span className="mr-2 text-sm text-slate-500 dark:text-slate-400">Share</span>
          <Button asChild variant="outline" size="sm">
            <a href={`mailto:?subject=${encodeURIComponent(blog.title)}&body=${encodeURIComponent(shareUrl)}`}>
              <Mail className="size-4" />
              Email
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
              <Linkedin className="size-4" />
              LinkedIn
            </a>
          </Button>
        </div>
      </article>
    </main>
  );
}
