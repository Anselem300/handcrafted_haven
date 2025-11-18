"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login"); // redirect if not logged in
        return;
      }

      const data = await res.json();
      if (!data.user) {
        router.push("/login"); // redirect if no user
      }
    }

    checkAuth();
  }, [router]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Seller Dashboard</h1>
      <p className="dashboard-subtitle">
        Manage your profile and products with ease.
      </p>

      <div className="dashboard-grid">
        <Link href="/dashboard/profile" className="dashboard-card">
          <div className="card-icon">👤</div>
          <h3>Edit Profile</h3>
          <p>Update your personal information and account settings.</p>
        </Link>

        <Link href="/dashboard/products" className="dashboard-card">
          <div className="card-icon">🛍️</div>
          <h3>Manage Products</h3>
          <p>Add, edit, or remove the items you are selling.</p>
        </Link>
      </div>
    </div>
  );
}
