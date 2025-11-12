import styles from '../styles/Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer} id='contact'>
             <p>&copy; {new Date().getFullYear()} Handcrafted Haven. All rights reserved.</p>
        </footer>
    )
}