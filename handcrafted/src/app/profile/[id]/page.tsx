import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/app/components/profileCard";
import ShareButton from "./shareButton";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

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

  // Build profile URL for sharing
  const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ""}/profile/${seller.id}`;

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "1rem" }}>
      
      {/* Seller Info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Image
          src={profilePic}
          alt={seller.name || "Seller"}
          width={100}
          height={100}
          style={{ borderRadius: "50%" }}
        />

        <div style={{ width: "100%" }}>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            {seller.name}
            <span title="Verified" style={{ display: "inline-flex", alignItems: "center", width: "20px", height: "20px" }}>
              <svg viewBox="0 0 100 100" width="20" height="20">
                <circle cx="50" cy="50" r="45" fill="white" stroke="black" strokeWidth="10" />
                <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="50" fontWeight="bold" fill="black">
                  ✓
                </text>
              </svg>
            </span>
          </h1>

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
          {/* Products Heading + Share Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2>Products</h2>
            <ShareButton url={profileUrl} sellerName={seller.name || "Seller"} />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {seller.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
