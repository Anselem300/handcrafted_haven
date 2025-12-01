"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FiTrash2, FiEdit, FiPlus } from "react-icons/fi"; // Trash & Pencil icons

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function ProductsPage() {
  const [mounted, setMounted] = useState(false); // Fix hydration mismatch
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(
    null
  );

  // Avoid SSR rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products (client-only)
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timeout = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [toast]);

  // Open modal
  const confirmDelete = (id: number) => {
    setSelectedId(id);
    setShowModal(true);
  };

  // Handle deletion
  const handleDelete = async () => {
    if (selectedId === null) return;
    setLoadingId(selectedId);

    try {
      const res = await fetch(`/api/products/${selectedId}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== selectedId));
        setToast({ message: "Product deleted successfully!", type: "success" });
      } else {
        setToast({ message: "Failed to delete product", type: "error" });
      }
    } catch {
      setToast({ message: "Server error", type: "error" });
    } finally {
      setLoadingId(null);
      setShowModal(false);
      setSelectedId(null);
    }
  };

  // Close modal on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Close modal when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  // Skip SSR rendering to fix hydration warning
  if (!mounted) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "black" }}>
        Your Products
      </h2>

      <Link
        href="/dashboard/products/new"
        className="bg-green-400 px-4 py-2 rounded font-semibold mb-4 inline-block"
        style={{ 
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1.5rem",
          borderRadius: "12px",
          backgroundColor: "#4ade80", // green-400
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontWeight: 600,
          textDecoration: "none",
          color: "black", // your inline style
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#22c55e"; // green-500 on hover
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#4ade80"; // back to original
          (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
        }}
      >
        <FiPlus size={23} />
        Add New Product
      </Link>

      {/* Loading animation */}
{products.length === 0 && (
  <div
    style={{
      marginTop: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "1.5rem",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        border: "4px solid #ccc",
        borderTop: "4px solid #22c55e",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "0.8rem",
      }}
    />
    <p
      style={{
        color: "black",
        fontWeight: 600,
        animation: "fade 1.5s infinite",
      }}
    >
      Please wait...
    </p>

    {/* Inline keyframes */}
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fade {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 1; }
      }
      `}</style>
   </div>
  )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded shadow text-white font-semibold transition-opacity duration-500 ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <ul className="flex flex-col gap-4"
      style={{
       display: "grid",
       gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
       gap: "1.2rem",
       textAlign: "center",
       marginTop: "1.5rem"
       }}>
        {products.map((p) => (
          <li
            key={p.id}
            className={`border p-4 rounded flex gap-4 items-center transition-all duration-500 ${
              loadingId === p.id ? "opacity-50" : "opacity-100"
            }`}
            style={{ color: "black" , listStyle: "none"}}
          >
            <Image
              src={p.imageUrl}
              alt={p.name}
              width={200}
              height={200}
              className="object-cover rounded"
              style={{
                borderRadius: "1rem",
                border: "6px solid white"
              }}
            />

            <div className="flex-1">
              <h3 className="font-bold">{p.name}</h3>
              <p>{p.description}</p>
              <p className="font-semibold" style={{
                marginBottom: ".8rem"
              }}>${p.price.toFixed(2)}</p>

              <div className="flex gap-4 mt-2">
                <Link
                  href={`/dashboard/products/${p.id}/edit`}
                  className="flex items-center gap-1 text-blue-600 underline"
                  style={{
                    fontSize: "1.3rem",
                  }}
                >
                  <FiEdit /> Edit
                </Link>

                <button
                  onClick={() => confirmDelete(p.id)}
                  className="flex items-center gap-1 text-red-600 underline"
                  disabled={loadingId === p.id}
                  style={{
                    marginTop: ".9rem"
                  }}
                >
                  <FiTrash2 /> {loadingId === p.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal Confirmation */}
      <div
        className={`modal-overlay ${showModal ? "show" : ""}`}
        onClick={handleOverlayClick}
      >
        <div className="modal-content">
          <p className="mb-4 font-semibold" style={{
            color: "black",
            marginBottom: ".5rem"
          }}>
            Are you sure you want to delete this product?
          </p>
          <div className="flex justify-center gap-4" >
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded font-semibold" style={{
                marginBottom: ".5rem"
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-300 px-4 py-2 rounded font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Vanilla CSS for modal */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .modal-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }
        .modal-content {
          background-color: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          width: 90%;
          text-align: center;
          transform: scale(0.9);
          transition: transform 0.3s ease;
        }
        .modal-overlay.show .modal-content {
          transform: scale(1);
        }
      `}</style>
    </div>
  );
}
