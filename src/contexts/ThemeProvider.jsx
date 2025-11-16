import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Pega o tema salvo no localStorage ou usa 'light' como padrão
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("BLACKJACK_THEME");
    return savedTheme || "light";
  });

  // Aplica o tema no elemento raiz do documento
  useEffect(() => {
    const root = document.documentElement;

    // Remove todos os atributos de tema
    root.removeAttribute("data-theme");

    // Adiciona o tema atual se não for o padrão (light)
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
    }

    // Salva no localStorage
    localStorage.setItem("BLACKJACK_THEME", theme);
  }, [theme]);

  // Função para alternar entre temas
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Função para definir um tema específico
  const setSpecificTheme = (newTheme) => {
    if (newTheme === "light" || newTheme === "dark") {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === "dark",
    isLight: theme === "light",
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ThemeContext;
