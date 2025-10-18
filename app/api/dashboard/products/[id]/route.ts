import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.products.findUnique({
      where: { id: params.id },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const isFeatured = formData.get("isFeatured") === "true";

    const file = formData.get("image") as File | null;
    let imageBase64: string | undefined;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageBase64 = `data:${file.type};base64,${buffer.toString("base64")}`;
    }

    const updated = await db.products.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        isFeatured,
        ...(imageBase64 ? { image: imageBase64 } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
