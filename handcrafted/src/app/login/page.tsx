"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginResponse {
  user?: {
    id: number;
    email: string;
  };
  message?: string;
  error?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data: LoginResponse = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Invalid email or password");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Welcome Back</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="have-account">
          Don’t have an account? <a href="/register">Create one</a>
        </p>
      </div>
    </div>
  );
}
