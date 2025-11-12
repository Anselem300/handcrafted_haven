'use client';

import { useState } from 'react';
import styles from '../styles/Navbar.module.css';
import { Menu, X, Home, ShoppingCart, Info, Phone } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '#', icon: <Home size={18} /> },
    { name: 'Shop', href: '#', icon: <ShoppingCart size={18} /> },
    { name: 'About', href: '#', icon: <Info size={18} /> },
    { name: 'Contact', href: '#', icon: <Phone size={18} /> },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Handcrafted Haven</div>

      <button
        className={styles.menuButton}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <ul className={`${styles.navLinks} ${menuOpen ? styles.showMenu : ''}`}>
        {navItems.map((item, index) => (
          <li key={index}>
            <a href={item.href} className={styles.navLink}>
              {item.icon}
              <span className={styles.linkText}>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
