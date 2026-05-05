import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { createBlogPost, listAdminBlogs, parseBlogFormData } from '@/lib/blog';
import { logAppEvent } from '@/lib/monitoring';

export const runtime = 'nodejs';

async function requireAdmin(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.user.role !== 'admin') return null;
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const blogs = await listAdminBlogs();
  return NextResponse.json({ blogs });
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const parsed = await parseBlogFormData(formData);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.errors[0], errors: parsed.errors }, { status: 400 });
    }

    const blog = await createBlogPost({
      ...parsed.data,
      authorId: session.user.id,
    });

    await logAppEvent({
      level: 'info',
      type: 'blog.created',
      message: 'Admin created blog post',
      context: {
        blogId: blog.id,
        slug: blog.slug,
        status: blog.status,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/blogs] Error:', error);
    return NextResponse.json({ error: 'Unable to create blog post.' }, { status: 500 });
  }
}
