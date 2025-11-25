// src/app/api/products/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadResult {
  secure_url: string;
}

async function uploadImage(base64: string): Promise<UploadResult> {
  const result = await cloudinary.uploader.upload(base64, { folder: "products" });
  return { secure_url: result.secure_url };
}

interface UpdateBody {
  name?: string;
  description?: string;
  price?: number;
  imageBase64?: string;
}

interface UpdateData extends UpdateBody {
  imageUrl?: string;
}

// GET /api/products/:id
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    if (!params.id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const productId = parseInt(params.id, 10);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error("GET product error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/products/:id
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Must await params in Next.js 15+
    const { id } = await context.params;
    const productId = parseInt(id, 10);

    const body: UpdateBody = await req.json();

    // Remove imageBase64 from data
    const { imageBase64, ...rest } = body;
    const data: UpdateData = { ...rest };

    // Convert price field to float
    if (typeof data.price === "string") {
      data.price = parseFloat(data.price);
    }

    // Upload new image if provided
    if (imageBase64) {
      const uploadResult = await uploadImage(imageBase64);
      data.imageUrl = uploadResult.secure_url;
    }

    // Check ownership
    const existing = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update product in DB
    const product = await prisma.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json({ product });
  } catch (err) {
    console.error("PATCH product error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// DELETE /api/products/:id
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const productId = parseInt(params.id, 10);

    await prisma.product.deleteMany({
      where: { id: productId, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE product error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
