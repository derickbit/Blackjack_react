import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthProvider";
import styles from "./Navbar.module.css";
import logo from "../../assets/blackjack_logo.jpg";
import "animate.css";
import Logo from "./Logo";
import Hamburger from "../Cards/Hamburger";
import { useState, useRef, useEffect } from "react";
import { useToast } from "../../utils/useToast";
import ToastContainer from "./ToastContainer";
import UserProfileDropdown from "./UserProfileDropdown";
import ThemeToggleButton from "./ThemeToggleButton";

function Navbar() {
  const { setToken, setUser, user } = useAuthContext();
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
        <ul className={`${styles.list} ${isMobileMenuOpen ? styles.open : ""}`}>
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
        <ThemeToggleButton />

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
