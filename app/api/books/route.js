import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    let books;
    if (categoryId) {
      books = await dbService.books.getByCategoryId(parseInt(categoryId));
    } else {
      books = await dbService.books.getAll();
    }

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { requireAdmin } = require('@/lib/auth');
    const admin = await requireAdmin(request);
    if (!admin) return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });


    // Body can come from different admin UIs; normalise to the shape expected by dbService
    const raw = await request.json();

    const categoryIdsRaw = Array.isArray(raw.categoryIds)
      ? raw.categoryIds
      : (Array.isArray(raw.category_ids) ? raw.category_ids : undefined);

    const normalized = {
      title: raw.title,
      author: raw.author,
      // Accept both camelCase and snake_case from clients
      categoryId: raw.categoryId ?? raw.category_id,
      // Optional multiple categories
      categoryIds: categoryIdsRaw ? categoryIdsRaw.map(id => parseInt(id)).filter(Boolean) : undefined,
      description: raw.description ?? null,
      isbn: raw.isbn ?? raw.ISBN ?? null,
      price: raw.price,
      discount: raw.discount ?? 0,
      weight: raw.weight ?? null,
      stock: raw.stock ?? 0,
      availability: raw.availability !== undefined ? raw.availability : true,
      coverImage: raw.coverImage ?? raw.cover_image ?? '/placeholder.jpg',
      // Tags should always be an array; convert from comma‑separated string if needed
      tags: Array.isArray(raw.tags)
        ? raw.tags
        : (typeof raw.tags === 'string'
            ? raw.tags.split(',').map(tag => tag.trim()).filter(Boolean)
            : []),
    };

    // Derive primary category from categoryIds if not explicitly set
    if (!normalized.categoryId && normalized.categoryIds && normalized.categoryIds.length > 0) {
      normalized.categoryId = normalized.categoryIds[0];
    }

    // Validate required fields
    if (!normalized.title || !normalized.author || !normalized.categoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the book using the dbService (which expects camelCase keys)
    const newBook = await dbService.books.create(normalized);

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book', details: error.message },
      { status: 500 }
    );
  }
}
