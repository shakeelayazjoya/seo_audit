import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { deleteBlogPost, getBlogById, parseBlogFormData, updateBlogPost } from '@/lib/blog';
import { logAppEvent } from '@/lib/monitoring';

export const runtime = 'nodejs';

async function requireAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
  }

  return NextResponse.json({ blog });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const parsed = await parseBlogFormData(formData, id);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.errors[0], errors: parsed.errors }, { status: 400 });
    }

    const blog = await updateBlogPost(id, parsed.data);
    await logAppEvent({
      level: 'info',
      type: 'blog.updated',
      message: 'Admin updated blog post',
      context: {
        blogId: blog.id,
        slug: blog.slug,
        status: blog.status,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('[PUT /api/admin/blogs/[id]] Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update blog post.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deleteBlogPost(id);
    await logAppEvent({
      level: 'info',
      type: 'blog.deleted',
      message: 'Admin deleted blog post',
      context: { blogId: id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/blogs/[id]] Error:', error);
    return NextResponse.json({ error: 'Unable to delete blog post.' }, { status: 500 });
  }
}
