'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    isFeatured: boolean;
    image?: string;
    createdAt?: string;
}

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/getAllProducts');
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={fetchProducts}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-[100vw] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                            Curated Products
                        </h1>
                        <p className="mt-2 text-slate-600">Hand-picked items just for you</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white transition-all duration-300 bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30"
                    >
                        <span className="absolute top-0 right-0 inline-block w-4 h-4 transition-all duration-500 ease-in-out bg-indigo-700 rounded group-hover:-mr-4 group-hover:-mt-4">
                            <span className="absolute top-0 right-0 w-5 h-5 rotate-45 translate-x-1/2 -translate-y-1/2 bg-white"></span>
                        </span>
                        <span className="relative">Add New Product</span>
                    </button>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-12 text-center border border-white/30">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full">
                            <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V8a2 2 0 00-2-2h-4.586a1 1 0 00-.707.293L9 8.293V6a2 2 0 012-2h2.586a1 1 0 01.707.293L16 6.586V8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">No products yet</h3>
                        <p className="text-slate-600 mb-6">Start building your collection today.</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                        >
                            Create your first product
                            <span className="transition-transform group-hover:translate-x-1">→</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="group relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/30"
                            >
                                {product.image ? (
                                    <div className="relative w-full h-56 bg-gray-200">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {product.isFeatured && (
                                            <span className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                ✨ Featured
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative w-full h-56 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                        <svg
                                            className="w-20 h-20 text-indigo-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        {product.isFeatured && (
                                            <span className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                ✨ Featured
                                            </span>
                                        )}
                                    </div>
                                )}
                                
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                        {product.name}
                                    </h2>
                                    <p className="text-slate-600 mb-5 line-clamp-3">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                            ${product.price.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => router.push(`/product/${product.id}`)}
                                            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-all group-hover:gap-3"
                                        >
                                            View Details
                                            <span className="transition-transform group-hover:translate-x-1">→</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}