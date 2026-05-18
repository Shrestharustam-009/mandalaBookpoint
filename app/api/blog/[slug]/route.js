import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

function getValidSlug(params) {
  const slug = params?.slug;
  if (!slug || typeof slug !== 'string') {
    return null;
  }
  return slug;
}

export async function GET(_request, { params }) {
  try {
    const { slug: slugParam } = await params;
    const slug = getValidSlug(await params);
    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const post = await dbService.blog.getBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update blog post by slug (used by admin panel)
export async function PUT(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const slug = getValidSlug(await params);
    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const updates = await request.json();

    const existing = await dbService.blog.getBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updated = await dbService.blog.update(existing.id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete blog post by slug (used by admin panel)
export async function DELETE(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const slug = getValidSlug(await params);
    if (!slug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const existing = await dbService.blog.getBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    await dbService.blog.delete(existing.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
