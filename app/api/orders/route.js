import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db-service';

export async function GET(request) {
  try {
    const orders = await dbService.orders.getAll();
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json();
    const newOrder = await dbService.orders.create(orderData);
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
