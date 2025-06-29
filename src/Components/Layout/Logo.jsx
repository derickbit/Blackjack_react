import SVGatorLogo from "/src/assets/logoVerde.svg";
import PropTypes from "prop-types";
import styles from "./Logo.module.css"; // Importe os estilos como um objeto

const Logo = ({ className, size = 50 }) => (
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
