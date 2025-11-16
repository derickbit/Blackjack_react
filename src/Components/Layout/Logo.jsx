import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "../../contexts/ThemeProvider";
import FichaAzul from "/src/assets/Ficha_azul.png";
import FichaLaranja from "/src/assets/Ficha_laranja.png";
import styles from "./Logo.module.css";

const Logo = ({ className, size = 75 }) => {
  const { theme } = useTheme();
  const [isFlipping, setIsFlipping] = useState(false);
  const [displayedLogo, setDisplayedLogo] = useState(
    theme === "light" ? FichaAzul : FichaLaranja
  );

  // Quando o tema muda, ativa a animação e troca a imagem no meio do giro
  useEffect(() => {
    setIsFlipping(true);

    // Troca a imagem no meio da animação (300ms = metade de 600ms)
    const changeImageTimer = setTimeout(() => {
      setDisplayedLogo(theme === "light" ? FichaAzul : FichaLaranja);
    }, 300);

    // Finaliza a animação
    const endAnimationTimer = setTimeout(() => {
      setIsFlipping(false);
    }, 600);

    return () => {
      clearTimeout(changeImageTimer);
      clearTimeout(endAnimationTimer);
    };
  }, [theme]);

  return (
    <div className={styles.logoContainer}>
      <img
        src={displayedLogo}
        alt="Logo CasinoNobre"
        className={`${styles.logo} ${isFlipping ? styles.flipping : ""} ${
          className || ""
        }`}
        style={{
          width: size,
          height: size,
        }}
      />
    </div>
  );
};

Logo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Logo;
