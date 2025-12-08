import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const userIdParam = req.nextUrl.searchParams.get("userId");
    if (!userIdParam) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    const userId = Number(userIdParam);

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 29);

    // Array of past 30 dates
    const dates: string[] = [];
    for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }

    // Fetch downloads for this user
    const downloads = await prisma.download.findMany({
      where: { createdAt: { gte: thirtyDaysAgo }, product: { userId } },
      include: { product: true },
    });

    const dailySales = dates.map((date) => {
      const downloadsForDay = downloads.filter(
        (d) => d.createdAt.toISOString().split("T")[0] === date
      );
      const totalRevenue = downloadsForDay.reduce((sum, d) => sum + d.product.price, 0);
      return { date, downloads: downloadsForDay.length, revenue: totalRevenue };
    });

    return NextResponse.json(dailySales);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch daily sales" }, { status: 500 });
  }
}
