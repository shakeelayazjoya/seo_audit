import { BlogForm } from '@/components/admin/BlogForm';

export default function AddBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-wide text-muted-foreground">Blog Management</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Add Blog</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a new SEO article with image, metadata, categories, and tags.</p>
      </div>
      <BlogForm />
    </div>
  );
}
