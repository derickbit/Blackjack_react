import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useTheme } from "../../contexts/ThemeProvider";
import styles from "./Navbar.module.css";
import logo from "../../assets/blackjack_logo.jpg";
import "animate.css";
import Logo from "./Logo";
import Hamburger from "../Cards/Hamburger";
import { useState, useRef, useEffect } from "react";
import { useToast } from "../../utils/useToast";
import ToastContainer from "./ToastContainer";
import UserProfileDropdown from "./UserProfileDropdown";

function Navbar() {
  const { setToken, setUser, user } = useAuthContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuContainerRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const { toasts, showSuccess, removeToast } = useToast();

  const handleLogout = () => {
    // Mostra toast de sucesso para logout ANTES de limpar os dados
    showSuccess("Logout realizado com sucesso! Até logo!", 3000);

    // Aguarda um pouco para o usuário ver o toast antes de fazer logout
    setTimeout(() => {
      setToken(null);
      setUser(null);
      localStorage.removeItem("ACCESS_TOKEN");
      localStorage.removeItem("CURRENT_USER");

      // Navega diretamente para login
      navigate("/login");
    }, 1500);
  };

  const handleHamburgerClick = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen((prev) => !prev);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
  };

  // Fecha o dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <nav className={styles.navbar}>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
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
      <div className={styles.navRight}>
        {/* Botão de alternância de tema */}
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label={
            theme === "dark"
              ? "Mudar para tema claro"
              : "Mudar para tema escuro"
          }
          title={
            theme === "dark"
              ? "Mudar para tema claro"
              : "Mudar para tema escuro"
          }
        >
          {theme === "dark" ? (
            // Ícone de Sol (tema claro)
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 2V4M12 20V22M4 12H2M22 12H20M19.071 4.929L17.657 6.343M6.343 17.657L4.929 19.071M19.071 19.071L17.657 17.657M6.343 6.343L4.929 4.929"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            // Ícone de Lua (tema escuro)
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
              />
            </svg>
          )}
        </button>

        <div className={styles.userProfile} ref={profileDropdownRef}>
          <button
            className={styles.userButton}
            onClick={toggleProfileDropdown}
            aria-label="Menu de perfil"
          >
            <svg
              className={styles.userIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="8"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.userName}>
              Olá, {user?.name?.split(" ")[0] || "Usuário"}
            </span>
          </button>

          {isProfileDropdownOpen && (
            <UserProfileDropdown onClose={closeProfileDropdown} />
          )}
        </div>

        <button className={styles.logout} onClick={handleLogout}>
          Sair
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
