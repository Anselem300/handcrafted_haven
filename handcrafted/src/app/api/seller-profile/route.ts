// src/app/api/seller-profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const profile = await prisma.sellerProfile.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUserFromRequest();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { bio, story, profilePicBase64 } = body;

    let profilePicUrl: string | undefined;
    if (profilePicBase64) {
      profilePicUrl = await uploadImage(profilePicBase64, "profile-pics");
    }

    const updatedProfile = await prisma.sellerProfile.update({
      where: { userId: user.id },
      data: {
        bio,
        story,
        ...(profilePicUrl && { profilePic: profilePicUrl }),
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (err) {
    console.error("Update profile error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
