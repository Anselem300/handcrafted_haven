import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "../components/productCard";
import { ArrowRight } from 'lucide-react';

export const dynamic = "force-dynamic";

// UPDATED: Now accepts an optional search term
async function getSellersWithProducts(search = "") {
  return await prisma.user.findMany({
    where: {
      profile: { isNot: null },
      products: { some: {} },

      // 🔍 Search logic
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { profile: { bio: { contains: search, mode: "insensitive" } } },
            {
              products: {
                some: { name: { contains: search, mode: "insensitive" } },
              },
            },
            {
              products: {
                some: { description: { contains: search, mode: "insensitive" } },
              },
            },
          ]
        : undefined,
    },
    select: {
      id: true,
      name: true,
      profile: { select: { profilePic: true, bio: true } },
      products: {
        select: {
          id: true,
          description: true,
          name: true,
          price: true,
          imageUrl: true,
        },
      },
    },
  });
}

export default async function ShopPage(
  props: { searchParams: Promise<{ search?: string; page?: string }> }
) {
  const { search = "", page = "1" } = await props.searchParams;

  const sellers = await getSellersWithProducts(search);

  // ➤ PAGINATION LOGIC (5 artisans per page)
  const ITEMS_PER_PAGE = 5;
  const currentPage = parseInt(page) || 1;
  const totalPages = Math.ceil(sellers.length / ITEMS_PER_PAGE);

  const paginatedSellers = sellers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="shop-container">
      <h1 className="shop-title" style={{ textAlign: "center", margin: ".9rem" }}>
        Marketplace
      </h1>

      {/* 🔍 Search Bar */}
      <form
        action="/shop"
        method="GET"
        style={{ maxWidth: "500px", margin: "1rem auto", display: "flex", gap: ".5rem" }}
      >
        <input
          type="text"
          name="search"
          placeholder="Search artisans..."
          defaultValue={search}
          style={{ flex: 1, padding: ".7rem 1rem", borderRadius: "8rem", marginBottom: "1rem", marginTop: "1rem", marginLeft: "1rem", border: "1px solid #ccc" }}
        />
        <button
          type="submit"
          style={{
            padding: ".7rem 1rem",
            marginRight: "1rem",
            marginTop: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
            background: "#111",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {/* If no results found */}
      {sellers.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "1.1rem" }}>
          No artisans found.
        </p>
      )}

      <div className="seller-grid" style={{ display: "grid", gap: "1rem" }}>
        {paginatedSellers.map((seller) => (
          <div key={seller.id} className="seller-card">
            {/* Seller Info */}
            <div className="seller-header">
              <Image
                src={seller.profile?.profilePic || "/images/default-avatar.jpg"}
                alt={seller.name || "Seller"}
                width={75}
                height={75}
                className="seller-avatar"
                style={{ borderRadius: "50px", marginTop: ".9rem", marginLeft: "1.1rem" }}
              />

              <h2
                className="seller-name"
                style={{
                fontSize: "1.2rem",
                marginBottom: ".5rem",
                marginLeft: "1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                }}
              >
               {seller.name}
               <span title="Verified" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px" }}>
                <svg viewBox="0 0 100 100" width="20" height="20">
                 <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="10" />
                 <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="50" fontWeight="bold" fill="black">✓</text>
                </svg>
               </span>
              </h2>

              <p style={{ marginLeft: "1.1rem", marginBottom: "1rem", fontSize: "1rem" }}>
                <strong>About:</strong> {seller.profile?.bio}
              </p>
            </div>

            {/* Seller Products */}
            {seller.products.length === 0 ? (
              <p className="no-products">No products yet</p>
            ) : (
              <>
                <div
                  className="product-grid"
                  style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "1rem" }}
                >
                  {seller.products.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* SEE MORE BUTTON */}
                {seller.products.length > 4 && (
                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
  <a
    href={`/profile/${seller.id}`}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: ".5rem 1rem",
      borderRadius: "8px",
      background: "#16a34a",
      color: "white",
      textDecoration: "none",
      fontWeight: "bold",
    }}
  >
    See More Products
    <ArrowRight
      size={20}
      style={{
        transition: "transform 0.2s ease",
      }}
    />
  </a>
</div>

                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* ➤ PAGINATION UI */}
      {totalPages > 1 && (
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* PREV BUTTON */}
          {currentPage > 1 ? (
            <a
              href={`/shop?search=${search}&page=${currentPage - 1}`}
              style={{
                padding: ".6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #555",
                background: "#ffffff22",
                color: "white",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
              }}
            >
              Previous
            </a>
          ) : (
            <span
              style={{
                padding: ".6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #555",
                background: "#333",
                color: "#777",
                cursor: "not-allowed",
              }}
            >
              Previous
            </span>
          )}

          {/* PAGE NUMBERS */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <a
              key={num}
              href={`/shop?search=${search}&page=${num}`}
              style={{
                padding: ".6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #555",
                background: num === currentPage ? "#16a34a" : "#ffffff22",
                color: "white",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                transition: "all 0.2s",
              }}
            >
              {num}
            </a>
          ))}

          {/* NEXT BUTTON */}
          {currentPage < totalPages ? (
            <a
              href={`/shop?search=${search}&page=${currentPage + 1}`}
              style={{
                padding: ".6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #555",
                background: "#ffffff22",
                color: "white",
                backdropFilter: "blur(4px)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Next
            </a>
          ) : (
            <span
              style={{
                padding: ".6rem 1rem",
                borderRadius: "8px",
                border: "1px solid #555",
                background: "#333",
                color: "#777",
                cursor: "not-allowed",
              }}
            >
              Next
            </span>
          )}
        </div>
      )}
    </div>
  );
}
