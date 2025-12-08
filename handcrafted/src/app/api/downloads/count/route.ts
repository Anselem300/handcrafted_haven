import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = Number(url.searchParams.get("productId"));
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // Count downloads in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const count = await prisma.download.count({
      where: {
        productId,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    return NextResponse.json({ count });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch download count" }, { status: 500 });
  }
}
