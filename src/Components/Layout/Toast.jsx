import { useState, useEffect } from "react";
import styles from "./Toast.module.css";

function Toast({ message, type = "success", duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300); // Aguarda animação
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.toast} ${styles[type]} ${
        isVisible ? styles.show : styles.hide
      }`}
    >
      <div className={styles.toastContent}>
        <div className={styles.icon}>
          {type === "success" && "✓"}
          {type === "error" && "✗"}
          {type === "warning" && "⚠"}
          {type === "info" && "ℹ"}
        </div>
        <span className={styles.message}>{message}</span>
        <button
          className={styles.closeButton}
          onClick={() => setIsVisible(false)}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;
