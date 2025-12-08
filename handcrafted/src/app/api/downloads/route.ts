import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { productId } = await req.json();
  const download = await prisma.download.create({
    data: { productId },
  });
  return new Response(JSON.stringify(download), { status: 201 });
}
