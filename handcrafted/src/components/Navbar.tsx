"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import {
  Menu,
  X,
  Home,
  ShoppingCart,
  User,
  UserPlus,
  LayoutDashboard,
  LogOut,
} from "lucide-react";

interface AuthUser {
  id: string;
  email: string;
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user || null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/"; // refresh to homepage
  }

  const navItems = [
    { name: "Home", href: "/", icon: <Home size={18} /> },
    { name: "Shop", href: "/shop", icon: <ShoppingCart size={18} /> },
    ...(user
      ? [
          { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={18} /> },
          {
            name: "Logout",
            href: null, // important — stops Link from attempting navigation
            icon: <LogOut size={18} />,
            onClick: handleLogout,
          },
        ]
      : [
          { name: "Login", href: "/login", icon: <User size={18} /> },
          { name: "Register", href: "/register", icon: <UserPlus size={18} /> },
        ]),
  ];

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        Handcrafted Haven
      </Link>

      <button
        className={styles.menuButton}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ""}`}>
        {navItems.map((item, index) => (
          <li key={index}>
            {item.onClick ? (
              <button onClick={item.onClick} className={styles.navLink}>
                {item.icon}
                <span className={styles.linkText}>{item.name}</span>
              </button>
            ) : (
              <Link href={item.href as string} className={styles.navLink}>
                {item.icon}
                <span className={styles.linkText}>{item.name}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
