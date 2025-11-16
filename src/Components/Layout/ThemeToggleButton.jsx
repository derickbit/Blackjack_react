import { useTheme } from "../../contexts/ThemeProvider";
import styles from "./Navbar.module.css";

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={
        theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"
      }
      title={
        theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"
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
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
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
  );
}

export default ThemeToggleButton;
