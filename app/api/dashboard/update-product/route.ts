import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, image, price, isFeatured } = body;

    // ✅ Validate
    if (!name || !description || !image || !price) {
      return NextResponse.json(
        { message: 'Missing required fields.' },
        { status: 400 }
      );
    }

    // ✅ Check if product exists
    const existing = await db.products.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: 'Product not found.' },
        { status: 404 }
      );
    }

    // ✅ Update
    const updated = await db.products.update({
      where: { id },
      data: { name, description, image, price, isFeatured },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Update failed:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
