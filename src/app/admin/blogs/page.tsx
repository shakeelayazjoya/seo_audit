import { listAdminBlogs } from '@/lib/blog';
import { BlogListClient } from '@/components/admin/BlogListClient';

export default async function AdminBlogsPage() {
  const blogs = await listAdminBlogs();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Blog Management</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">All Blogs</h1>
        <p className="mt-2 text-sm text-muted-foreground">Search, edit, publish, draft, and delete blog posts.</p>
      </div>
      <BlogListClient blogs={blogs} />
    </div>
  );
}
