import { NextRequest, NextResponse } from 'next/server';
import { createProduct } from '@/modules/products/actions';

export async function POST(req: NextRequest) {
    try {
        const { name, description, price, isFeatured,image } = await req.json();

        if (
            typeof name !== 'string' ||
            typeof description !== 'string' ||
            typeof price !== 'number' ||
            typeof isFeatured !== 'boolean' ||
            typeof image !== 'string'
        ) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const product = await createProduct(name, description, price, isFeatured,image);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}