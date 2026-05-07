import Link from 'next/link';
import { CalendarDays, User } from 'lucide-react';
import { listPublishedBlogs } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';

export default async function BlogPage() {
  const blogs = await listPublishedBlogs();

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-orange-600">Blog</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">SEO audit insights</h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
            Practical articles about technical SEO, performance, schema, AI search visibility, and turning audit findings into action.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {blogs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800">
                  {blog.coverImageUrl ? (
                    <img src={blog.coverImageUrl} alt={blog.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">SEO Audit</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {blog.categories.slice(0, 2).map((category) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                  <h2 className="text-lg font-semibold leading-snug group-hover:text-orange-600">{blog.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{blog.excerpt}</p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User className="size-3.5" /> {blog.author?.name ?? 'SEO Team'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-xl font-semibold">No posts published yet</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Published admin posts will appear here automatically.</p>
          </div>
        )}
      </section>
    </main>
  );
}
