import Toast from "./Toast";
import styles from "./ToastContainer.module.css";

function ToastContainer({ toasts, onRemoveToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer}>
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
          style={{ zIndex: 9999 - index }}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
