import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSellersWithProducts() {
  return await prisma.user.findMany({
  where: {
    profile: { isNot: null },
    products: { some: {} },
  },
  select: {
    id: true,
    name: true,
    profile: { select: { profilePic: true, bio: true } },
    products: {
      select: { id: true, description: true, name: true, price: true, imageUrl: true },
    },
  },
});
}


export default async function ShopPage() {
  const sellers = await getSellersWithProducts();

  return (
    <div className="shop-container">
      <h1 className="shop-title" style={{
        textAlign: "center",
        margin: ".9rem"
      }}>Marketplace</h1>

      <div className="seller-grid" style={{
        display: "grid",
        gap: "1rem"
      }}>
        {sellers.map((seller) => (
          <div key={seller.id} className="seller-card">
            
            {/* Seller Info */}
            <div className="seller-header">
              <Image
                src={seller.profile?.profilePic || "/images/default-avatar.jpg"}
                alt={seller.name || "Seller"}
                width={75}
                height={75}
                className="seller-avatar"
                style={{
                    borderRadius: "50px",
                    marginTop: ".9rem",
                    marginLeft: "1rem"
                }}
              />
              <h2 className="seller-name"
              style={{
                fontSize: "1.2rem",
                marginBottom: ".5rem",
                marginLeft: "1rem"
              }}>{seller.name}</h2>
              <p style={{
                marginLeft: "1rem",
                marginBottom: "1rem",
                fontSize: "1rem"
              }}><strong>About:</strong> {seller.profile?.bio}</p>
            </div>

            {/* Seller Products */}
            {seller.products.length === 0 ? (
              <p className="no-products">No products yet</p>
            ) : (
              <div className="product-grid" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem"
              }}>
                {seller.products.map((product) => (
                  <div
                   key={product.id}
                   className="product-card"
                   style={{
                    border: "1px solid #ddd",
                    gap: "1rem",
                    borderRadius: "12px",
                    padding: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
               >
             <div
              className="product-img-wrapper"
              style={{
              position: "relative",
              width: "100%",
              height: "200px", // fixed height for all product images
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "0.5rem",
             }}
           >
    <Image
      src={product.imageUrl}
      alt={product.name}
      fill
      style={{ objectFit: "cover" }}
    />
  </div>

      <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem" }}>
       {product.name}
       </h3>
       <p style={{ fontSize: ".9rem", fontWeight: "400", marginBottom: "0.25rem" }}>
       {product.description}
       </p>
         <p style={{ fontWeight: "bold", color: "#16a34a" }}>${product.price}</p>
         </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}