import styles from '../styles/Featured.module.css';
import Image from 'next/image';

export default function Featured() {
    const artisans = [
        {name: "Aisha’s Pottery", product: "Hand-thrown Clay Mugs", image: "/artisans/aisha-pottery.jpg"},
        {name: "Crafted by Caleb", product: "Wooden Wall Art", image: "/artisans/caleb-craft.jpg" },
        {name: "Maya Textiles", product: "Handwoven Scarves", image: "/artisans/maya-textiles.jpg" }
    ]

    return (
    <section id="featured" className={styles.featured}>
      <h2>Featured Artisans</h2>
      <div className={styles.grid}>
        {artisans.map((a, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image
                src={a.image}
                alt={a.name}
                fill
                className={styles.image}
              />
            </div>
            <h3>{a.name}</h3>
            <p>{a.product}</p>
          </div>
        ))}
      </div>
    </section>
  );
}