'use server'

import { db } from "@/lib/db"

export const getProduct = async (id: string) => {
    try {
        const product = await db.products.findUnique({
            where: { id },
            include:{
                reviews:true
            }
        })
        return product
    } catch (error) {
        console.log(error)
    }
}

export const createProduct = async (name: string, desctiption : string, price: number , isFeatured: boolean,image:string) => {
    try {
        const product = await db.products.create({
            data:{
                name:name,
                image:image,
                description:desctiption,
                price:price,
                isFeatured:isFeatured
            }
        })
        return product
    } catch (error) {
        console.log(error)
    }
}

export const getAllProducts = async () => {
    try {
        const products = await db.products.findMany();
        return products;
    } catch (error) {
        console.log(error);
    }
}