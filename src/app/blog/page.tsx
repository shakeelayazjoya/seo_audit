import Link from 'next/link';
import { CalendarDays, User, ArrowRight } from 'lucide-react';
import { listPublishedBlogs } from '@/lib/blog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default async function BlogPage() {
  const blogs = await listPublishedBlogs();
  console.log('Fetched blogs:', blogs);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,rgb(255,255,255) 1px,transparent 1px),linear-gradient(to bottom,rgb(255,255,255) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6">
          <span className="mb-4 inline-flex items-center rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-400">
            Blog
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">SEO audit insights</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Practical articles about technical SEO, performance, schema, AI search visibility, and turning audit findings into action.
          </p>
        </div>
      </section>

      {/* Posts grid */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {blogs.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog/${blog.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/8 bg-slate-900 transition-all hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5"
              >
                <div className="aspect-[16/10] overflow-hidden bg-slate-800">
                  {blog.coverImageUrl ? (
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">SEO Audit</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap gap-1.5">
                    {blog.categories.slice(0, 2).map((category) => (
                      <span
                        key={category}
                        className="inline-flex rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-400"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-base font-semibold leading-snug text-white transition-colors group-hover:text-orange-400">
                    {blog.title}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{blog.excerpt}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3" />
                      {new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {blog.author?.name ?? 'SEO Team'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900 py-20 text-center">
            <p className="text-lg font-semibold">No posts published yet</p>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              Published admin posts will appear here automatically.
            </p>
            <Button
              asChild
              className="mt-6 gap-2 bg-orange-500 text-white hover:bg-orange-400"
            >
              <Link href="/">
                Run free audit
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
