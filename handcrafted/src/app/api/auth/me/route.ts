import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("cookie")
      ?.split("; ")
      ?.find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    return NextResponse.json({ user: decoded }, { status: 200 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

