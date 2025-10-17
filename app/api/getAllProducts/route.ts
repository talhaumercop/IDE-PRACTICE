import { getAllProducts } from '@/modules/products/actions';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const products = await getAllProducts()
        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}