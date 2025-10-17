import { getProduct } from '@/modules/products/actions';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { id } = await req.json();

        if(!id){
            console.log('no id provided')
        }

        const product = await getProduct(id);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
    }
}