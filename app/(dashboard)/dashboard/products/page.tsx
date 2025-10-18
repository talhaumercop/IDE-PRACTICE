"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2, MoreVertical, Plus, Search } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
  description?: string
  image?: string
}

const ProductsPage = () => {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filtered, setFiltered] = useState<Product[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 5

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/getAllProducts`)
      if (!res.ok) throw new Error("Failed to fetch products")

      const data = await res.json()
      setProducts(data)
      setFiltered(data)
      setTotalPages(Math.ceil(data.length / itemsPerPage))
    } catch (error) {
      toast.error("Fetch Failed", { description: "Failed to fetch the products" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // 🔍 Search filtering with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const query = search.toLowerCase().trim()
      if (!query) {
        setFiltered(products)
      } else {
        const results = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description?.toLowerCase().includes(query)
        )
        setFiltered(results)
      }
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(handler)
  }, [search, products])

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return filtered.slice(start, end)
  }, [filtered, currentPage])

  const handleDelete = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this product?")
    if (!confirmed) return

    try {
      const res = await fetch(`/api/dashboard/products/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete product")

      toast.success("Delete successful")
      fetchProducts()
    } catch {
      toast.error("Deletion Failed", { description: "Failed to delete the product" })
    }
  }

  return (
    <div className="p-6">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">Products</CardTitle>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or description"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <Button
              onClick={() => router.push("/dashboard/create-product")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No products found.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>${product.price}</TableCell>
                    <TableCell className="truncate max-w-xs">
                      {product.description || "—"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/update-product/${product.id}`)
                            }
                          >
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm flex items-center">
              Page {currentPage} of {Math.ceil(filtered.length / itemsPerPage)}
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(p + 1, Math.ceil(filtered.length / itemsPerPage))
                )
              }
              disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProductsPage
