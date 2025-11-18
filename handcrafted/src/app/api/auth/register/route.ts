// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createToken } from "@/lib/auth";

interface RequestBody {
  name?: string | null;
  email?: string | null;
  password?: string | null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const email = body.email?.trim();
    const password = body.password;
    const name = body.name?.trim() ?? null;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use." }, { status: 409 });
    }

    const hashed = await hashPassword(password);

    // create user and an empty SellerProfile in one transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        profile: {
          create: {}, // create empty SellerProfile (userId will be set automatically)
        },
      },
      select: { id: true, name: true, email: true },
    });

    const token = createToken({ id: user.id, email: user.email });

    const res = NextResponse.json({ user });
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
