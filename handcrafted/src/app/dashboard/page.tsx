"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DailySales {
  date: string; 
  downloads: number;
  revenue: number;
}

export default function DashboardPage() {
  const [dailySales, setDailySales] = useState<DailySales[]>([]);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const userRes = await fetch("/api/auth/me");

        // If not authenticated → redirect to login
        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        if (!userData.user) {
          router.push("/login");
          return;
        }

        // User is authenticated
        setLoading(false);

        const userId = userData.user.id;

        const salesRes = await fetch(`/api/sales/daily?userId=${userId}`);
        if (!salesRes.ok) return console.error("Failed to fetch sales");

        const data: DailySales[] = await salesRes.json();
        setDailySales(data);

        setTotalDownloads(data.reduce((sum, d) => sum + d.downloads, 0));
        setTotalRevenue(data.reduce((sum, d) => sum + d.revenue, 0));
      } catch (err) {
        console.error(err);
        router.push("/login");
      }
    };

    fetchSales();

    const interval = setInterval(fetchSales, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [router]);

  // While verifying auth
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", fontSize: "1.3rem" }}>
        Checking authentication...
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Seller Dashboard</h1>
      <p className="dashboard-subtitle">Manage your profile and products with ease.</p>

      <div className="dashboard-grid">
        <Link href="/dashboard/profile" className="dashboard-card">
          <div className="card-icon" style={{ textAlign: "center"}}>👤</div>
          <h3>Edit Profile</h3>
          <p>Update your personal information and account settings.</p>
        </Link>

        <Link href="/dashboard/products" className="dashboard-card">
          <div className="card-icon" style={{ textAlign: "center"}}>🛍️</div>
          <h3>Manage Products</h3>
          <p>Add, edit, or remove the items you are selling.</p>
        </Link>

        <div className="dashboard-card" style={{ flexDirection: "column" }}>
          <div className="card-icon" style={{ textAlign: "center"}}>💰</div>
          <h3>Sales (Past 30 Days)</h3>

          <p style={{fontWeight: "bold"}}>Total Downloads: {totalDownloads}</p>
          <p style={{fontWeight: "bold"}}>Total Revenue: ${totalRevenue.toFixed(2)}</p>

          <div style={{ width: "110%", height: 220, marginTop: "1rem", marginLeft: "-5%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailySales}>
                <CartesianGrid stroke="#e3eeff" strokeDasharray="3 3" />

                <Legend
                  verticalAlign="top"
                  height={40}
                  wrapperStyle={{ color: "#1e3a8a", fontWeight: "bold" }}
                />

                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Sales") return [`$${value}`, "Sales"];
                    return [value, "Downloads"];
                  }}
                  contentStyle={{
                    background: "#f0f6ff",
                    border: "1px solid #c7ddff",
                    borderRadius: "8px",
                  }}
                  labelFormatter={() => "Last 30 Days"}
                />

                <Line
                  type="monotone"
                  dataKey="downloads"
                  stroke="#16a34a"
                  strokeWidth={3}
                  name="Downloads"
                  dot={false}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#facc15"
                  strokeWidth={3}
                  name="Sales"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
