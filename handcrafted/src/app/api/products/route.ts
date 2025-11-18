// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { name, description, price, imageBase64 } = body;

    if (!name || !description || !price || !imageBase64) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(imageBase64, "products");

    // Create product in DB
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        userId: user.id,
      },
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Product creation error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}