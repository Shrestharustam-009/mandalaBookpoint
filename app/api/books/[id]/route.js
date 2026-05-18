import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const book = await dbService.books.getById(parseInt(id));
    
    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    const raw = await request.json();

    const categoryIdsRaw = Array.isArray(raw.categoryIds)
      ? raw.categoryIds
      : (Array.isArray(raw.category_ids) ? raw.category_ids : undefined);

    const updates = {
      title: raw.title,
      author: raw.author,
      // Accept both camelCase and snake_case
      categoryId: raw.categoryId ?? raw.category_id,
      categoryIds: categoryIdsRaw ? categoryIdsRaw.map(v => parseInt(v)).filter(Boolean) : raw.categoryIds,
      description: raw.description,
      isbn: raw.isbn ?? raw.ISBN,
      price: raw.price,
      discount: raw.discount,
      weight: raw.weight,
      stock: raw.stock,
      availability: raw.availability,
      coverImage: raw.coverImage ?? raw.cover_image,
      cover_image: raw.cover_image,
      tags: raw.tags,
    };

    const updatedBook = await dbService.books.update(parseInt(id), updates);
    
    if (!updatedBook) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });

    const { id } = await params;
    await dbService.books.delete(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
