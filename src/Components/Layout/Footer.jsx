import { DiReact, DiPhp, DiJsBadge, DiLaravel } from "react-icons/di";
import styles from "./Footer.module.css";
import CardSuitsMorph from "../Cards/toMorph"; // Importa o componente de animação de naipes

function Footer() {
  return (
    <footer className={styles.footer}>
      <ul className={styles.social_list}>
        <li>
          <DiReact />
        </li>
        <li>
          <DiPhp />
        </li>
        <li>
          <CardSuitsMorph width="30" height="30" />
        </li>
        <li>
          <DiJsBadge />
        </li>
        <li>
          <DiLaravel />
        </li>
      </ul>
      <p className={styles.copy_right}>
        <span>CardNest</span> &copy; 2025
      </p>
    </footer>
  );
}

export default Footer;
