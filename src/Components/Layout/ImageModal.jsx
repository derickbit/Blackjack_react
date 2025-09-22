import PropTypes from "prop-types";
import styles from "./ImageModal.module.css";

const ImageModal = ({
  isOpen,
  imageUrl,
  imageAlt = "Imagem ampliada",
  onClose,
}) => {
  if (!isOpen || !imageUrl) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleOpenInNewTab = (e) => {
    e.stopPropagation();
    window.open(imageUrl, "_blank");
  };

  return (
    <div className={styles.imageModal} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        <img src={imageUrl} alt={imageAlt} />
        <button className={styles.closeModal} onClick={onClose} title="Fechar">
          ✕
        </button>
        <button
          className={styles.openInNewTab}
          onClick={handleOpenInNewTab}
          title="Abrir em nova guia"
        >
          Abrir em nova aba
        </button>
      </div>
    </div>
  );
};

ImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  imageUrl: PropTypes.string,
  imageAlt: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ImageModal;
