// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(fileBase64: string, folder = "products") {
  const result = await cloudinary.uploader.upload(fileBase64, {
    folder,
    resource_type: "image",
  });
  return result.secure_url;
}
