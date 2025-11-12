'use client'
import { ArrowRight } from 'lucide-react';
import styles from '../styles/Hero.module.css';
import Link from 'next/link';

export default function Hero() {
    return (
        <section className={styles.hero}>
            <div className={styles.content}>
                <h1>Discover the Art of Handcrafted Excellence</h1>
                <h2>Celebrate creativity, support artisans, and find treasures made with passion and purpose.</h2>
                <Link href="#Featured" className={styles.cta}>Explore Now <ArrowRight size={20} className={styles.arrowIcon} /></Link>
            </div>
        </section>
    )
}

