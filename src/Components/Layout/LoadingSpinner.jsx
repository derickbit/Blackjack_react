import styles from "./LoadingSpinner.module.css";
import PropTypes from "prop-types";

const LoadingSpinner = ({
  message = "Carregando...",
  size = "medium",
  className = "",
}) => {
  return (
    <div className={`${styles.loading} ${styles[size]} ${className}`}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
};

export default LoadingSpinner;
