import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthProvider";
import styles from "./Navbar.module.css";
import logo from "../../assets/blackjack_logo.jpg";
import "animate.css";
import Logo from "./Logo";
import Hamburger from "../Cards/Hamburger";
import { useState, useRef } from "react";

function Navbar() {
  const { setToken, setUser } = useAuthContext();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuContainerRef = useRef(null);

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("ACCESS_TOKEN");
    navigate("/");
    alert("Você foi deslogado!");
  };

  const handleHamburgerClick = () => {
    setIsMobileMenuOpen((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft} ref={menuContainerRef}>
        <div className={styles.logoContainer}>
          <Logo src={logo} alt="Logo" className={styles.logo} />
        </div>
        {/* Hamburger para mobile à direita do logo */}
        <div className={styles.hamburgerMobile} onClick={handleHamburgerClick}>
          <Hamburger border={false} active={isMobileMenuOpen} />
        </div>
        {/* Menu principal */}
        <ul
          className={`${styles.list} ${isMobileMenuOpen ? styles.open : ""}`}
          style={{
            ...(isMobileMenuOpen
              ? {
                  width: "auto",
                  minWidth: "unset",
                  maxWidth: "none",
                  left: 0,
                  right: "auto",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  background: "#222",
                  padding: "0.3em 0.7em",
                  borderRadius: "0 0 8px 8px",
                  marginTop: "0.5em",
                }
              : {}),
          }}
        >
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/">Home</Link>
          </li>
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/perfil">Editar Perfil</Link>
          </li>
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/ranking">Ranking</Link>
          </li>
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/historico">Historico</Link>
          </li>

          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/reports">Contato</Link>
          </li>
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/comunidade">Comunidade</Link>
          </li>
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/atualizacoes">Atualizações</Link>
          </li>
          <li className={styles.item} onClick={handleMobileLinkClick}>
            <Link to="/sobre">Sobre</Link>
          </li>
          {/* Sociais removido */}
        </ul>
      </div>
      <button className={styles.logout} onClick={handleLogout}>
        Sair
      </button>
    </nav>
  );
}

export default Navbar;
