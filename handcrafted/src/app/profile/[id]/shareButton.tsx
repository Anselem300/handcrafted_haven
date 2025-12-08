"use client"; // 👈 client component

import { FiShare2 } from "react-icons/fi";

interface Props {
  url: string;
  sellerName: string;
}

export default function ShareButton({ url, sellerName }: Props) {
  return (
    <button
      onClick={async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: `${sellerName}'s Profile`,
              url,
            });
          } catch (err) {
            console.error("Share failed:", err);
          }
        } else {
          navigator.clipboard.writeText(url);
          alert("Link copied to clipboard!");
        }
      }}
      style={{
        background: "#0c0c0cff",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      <FiShare2 size={20} />
    </button>
  );
}
