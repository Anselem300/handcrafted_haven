import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userIdParam = req.nextUrl.searchParams.get("userId");
    if (!userIdParam) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Total downloads in last 30 days
    const downloadsCount = await prisma.download.count({
      where: {
        product: { userId },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Total price of all products
    const totalPrice = await prisma.product.aggregate({
      where: { userId },
      _sum: { price: true },
    });

    return NextResponse.json({
      downloadsCount,
      totalPrice: totalPrice._sum.price || 0,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}
