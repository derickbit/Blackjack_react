import SVGatorLogo from "/src/assets/MedalhãoCN.svg";
import PropTypes from "prop-types";
import styles from "./Logo.module.css"; // Importe os estilos como um objeto

const Logo = ({ className, size = 75 }) => (
  <div className={styles.logoContainer}>
    <img
      src={SVGatorLogo}
      alt="Logo Verde"
      className={`${styles.cropped} ${className || ""}`}
      style={{ width: size, height: size }}
    />
  </div>
);

Logo.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Logo;
