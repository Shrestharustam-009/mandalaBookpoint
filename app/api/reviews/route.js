import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    
    let reviews;
    if (bookId) {
      reviews = await dbService.reviews.getByBookId(parseInt(bookId));
    } else {
      reviews = await dbService.reviews.getAll();
    }
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const reviewData = await request.json();
    
    // Validate required fields
    if (!reviewData.bookId || reviewData.bookId === undefined) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }
    if (!reviewData.userId || reviewData.userId === undefined) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    if (!reviewData.userName || reviewData.userName === undefined) {
      return NextResponse.json({ error: 'User name is required' }, { status: 400 });
    }
    if (!reviewData.rating || reviewData.rating === undefined || reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }
    if (!reviewData.comment || reviewData.comment === undefined || reviewData.comment.trim().length === 0) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }
    
    const newReview = await dbService.reviews.create(reviewData);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
