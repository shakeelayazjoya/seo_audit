'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  createdAt: string | Date;
  publishedAt?: string | Date | null;
}

export function BlogListClient({ blogs }: { blogs: BlogRow[] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState(blogs);

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return items.filter((blog) => {
      const matchesQuery = !lower || blog.title.toLowerCase().includes(lower) || blog.slug.toLowerCase().includes(lower);
      const matchesStatus = status === 'all' || blog.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [items, query, status]);

  const deleteBlog = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    const response = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setItems((current) => current.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search blogs..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'published', 'draft'].map((value) => (
            <Button key={value} type="button" size="sm" variant={status === value ? 'default' : 'outline'} onClick={() => setStatus(value)}>
              {value[0].toUpperCase() + value.slice(1)}
            </Button>
          ))}
          <Button asChild size="sm" className="gap-2">
            <Link href="/admin/blogs/new">
              <Plus className="size-4" />
              Add Blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((blog) => (
          <article key={blog.id} className="rounded-xl border bg-card p-4 shadow-sm transition hover:border-primary/40">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>{blog.status}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(blog.publishedAt ?? blog.createdAt).toLocaleDateString()}</span>
                </div>
                <h2 className="text-lg font-semibold">{blog.title}</h2>
                <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{blog.excerpt}</p>
                <p className="mt-2 text-xs text-muted-foreground">/{blog.slug}</p>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline" className="gap-2">
                  <Link href={`/admin/blogs/${blog.id}/edit`}>
                    <Edit3 className="size-4" />
                    Edit
                  </Link>
                </Button>
                <Button size="sm" variant="destructive" className="gap-2" onClick={() => void deleteBlog(blog.id)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            No blogs match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
