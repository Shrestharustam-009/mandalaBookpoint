import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { dbService } from '@/lib/db-service';

export async function GET() {
  try {
    const posts = await dbService.blog.getAll();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {

    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const postData = await request.json();
    const newPost = await dbService.blog.create(postData);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

