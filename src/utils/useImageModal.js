import { useState } from "react";

export const useImageModal = () => {
  const [modalImage, setModalImage] = useState(null);
  const [modalAlt, setModalAlt] = useState("");

  const openImageModal = (imageUrl, imageAlt = "Imagem ampliada") => {
    setModalImage(imageUrl);
    setModalAlt(imageAlt);
  };

  const closeImageModal = () => {
    setModalImage(null);
    setModalAlt("");
  };

  return {
    modalImage,
    modalAlt,
    isModalOpen: !!modalImage,
    openImageModal,
    closeImageModal,
  };
};
