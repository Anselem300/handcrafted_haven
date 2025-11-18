"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "black" }}>
        Your Products
      </h2>
      <Link
        href="/dashboard/products/new"
        className="bg-green-400 px-4 py-2 rounded font-semibold mb-4 inline-block"
        style={{ color: "black" }}
      >
        Add New Product
      </Link>
      <ul className="flex flex-col gap-4">
        {products.map((p) => (
          <li
            key={p.id}
            className="border p-4 rounded flex gap-4 items-center"
            style={{ color: "black" }}
          >
            <Image
              src={p.imageUrl}
              alt={p.name}
              width={96}
              height={96}
              className="object-cover rounded"
            />
            <div>
              <h3 className="font-bold" style={{ color: "black" }}>{p.name}</h3>
              <p style={{ color: "black" }}>{p.description}</p>
              <p className="font-semibold" style={{ color: "black" }}>
                ${p.price.toFixed(2)}
              </p>
              <Link
                href={`/dashboard/products/${p.id}/edit`}
                style={{ color: "black", textDecoration: "underline" }}
              >
                Edit
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
