"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    isFeatured: false,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ✅ Fetch product by ID from backend
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/dashboard/products/${id}`, {
          method: "GET",
        });
        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Failed to fetch product");
          return;
        }

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price?.toString() || "",
          isFeatured: data.isFeatured || false,
        });

        setImagePreview(data.image || null);
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchProduct();
  }, [id]);

  // 🟦 Handle text field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🟧 Handle image upload preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  // 🟨 Handle update (PATCH)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("isFeatured", String(formData.isFeatured));
      if (file) form.append("image", file);

      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "PATCH",
        body: form,
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Product updated successfully!");
        router.push("/dashboard/products");
      } else {
        alert(data.message || "Failed to update product.");
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
        />

        <Input
          name="price"
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          required
        />

        <div className="flex items-center space-x-2">
          <Checkbox
            checked={formData.isFeatured}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isFeatured: !!checked }))
            }
          />
          <label>Featured</label>
        </div>

        {/* 🟩 Image Upload + Preview */}
        <div className="space-y-2">
          <label className="block font-medium">Product Image</label>
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Product Preview"
              className="w-32 h-32 object-cover rounded-md border"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <Button type="submit" disabled={updating} className="w-full">
          {updating ? "Updating..." : "Update Product"}
        </Button>
      </form>
    </div>
  );
}
