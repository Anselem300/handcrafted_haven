"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function ProductCard({ product }: { product: Product }) {
  const [downloads, setDownloads] = useState<number>(0);

  // Fetch download count on mount
  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await fetch(`/api/downloads/count?productId=${product.id}`);
        const data = await res.json();
        setDownloads(data.count || 0);
      } catch (err) {
        console.error("Failed to fetch downloads:", err);
      }
    };

    fetchDownloads();
  }, [product.id]);

  const handleDownload = async () => {
    try {
      // Log the download
      await fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      // Update download count immediately
      setDownloads((prev) => prev + 1);

      // Download the image
      const res = await fetch(product.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = product.name || "product";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
      }}
    >
      {/* Download count badge */}
      <div
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          background: "#16a34a",
          color: "white",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: ".85rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          zIndex: 10,
        }}
        title={`${downloads} downloads`}
      >
        {downloads}
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "200px",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "0.5rem",
        }}
        className="product-image-wrapper"
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
          className="product-image"
        />
      </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem" }}>
        {product.name}
      </h3>
      <p style={{ fontSize: ".9rem", marginBottom: "0.25rem" }}>{product.description}</p>
      <p style={{ fontWeight: "bold", color: "#16a34a", marginBottom: ".5rem" }}>
        ${product.price}
      </p>

      <button
        onClick={handleDownload}
        style={{
          alignSelf: "flex-end",
          padding: ".4rem .8rem",
          borderRadius: "6px",
          background: "#111",
          color: "white",
          fontSize: ".85rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Download
      </button>
    </div>
  );
}
