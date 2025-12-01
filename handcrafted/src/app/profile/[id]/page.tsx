// src/app/profile/[id]/page.tsx
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

// Fetch seller by ID
async function getSellerById(id: string) {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return null;

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      profile: { select: { profilePic: true, bio: true } },
      products: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          imageUrl: true,
        },
      },
    },
  });
}

export default async function SellerProfilePage(props: Props) {
  // ✅ Unwrap params if it is a Promise
  const { params } = props;
  const { id } = params instanceof Promise ? await params : params;

  const seller = await getSellerById(id);

  if (!seller) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Seller not found</h2>
      </div>
    );
  }

  const profilePic = seller.profile?.profilePic || "/images/default-avatar.jpg";
  const bio = seller.profile?.bio || "No bio available.";

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      {/* Seller Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Image src={profilePic} alt={seller.name || "Seller"} width={100} height={100} style={{ borderRadius: "50%" }} />
        <div>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{seller.name}</h1>
          <p style={{ fontSize: "1rem" }}>
            <strong>About:</strong> {bio}
          </p>
        </div>
      </div>

      {/* Seller Products */}
      {seller.products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <>
          <h2 style={{ marginBottom: "1rem" }}>Products</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            {seller.products.map((product) => (
              <div key={product.id} style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "8px", overflow: "hidden", marginBottom: "0.5rem" }}>
                  <Image src={product.imageUrl} alt={product.name || "Product image"} fill style={{ objectFit: "cover" }} />
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.25rem" }}>{product.name}</h3>
                <p style={{ fontSize: ".9rem", marginBottom: "0.25rem" }}>{product.description}</p>
                <p style={{ fontWeight: "bold", color: "#16a34a" }}>${product.price}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
