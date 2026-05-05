import { notFound } from 'next/navigation';
import { getBlogById } from '@/lib/blog';
import { BlogForm } from '@/components/admin/BlogForm';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);
  if (!blog) notFound();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Blog Management</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit Blog</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update content, SEO metadata, publishing status, and cover image.</p>
      </div>
      <BlogForm
        initialData={{
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt,
          content: blog.content,
          coverImageUrl: blog.coverImageUrl,
          categories: blog.categories,
          tags: blog.tags,
          metaDescription: blog.metaDescription,
          status: blog.status,
        }}
      />
    </div>
  );
}
