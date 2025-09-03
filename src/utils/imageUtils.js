// utils/imageUtils.js

/**
 * Corrige URLs de imagens baseada no ambiente (desenvolvimento/produção)
 * @param {string} imagePath - caminho da imagem retornado pela API
 * @returns {string} - URL completa da imagem
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Se já é uma URL completa (S3 ou outro CDN), retorna como está
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Para desenvolvimento local, usa a URL do Laravel
  const isDevelopment =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (isDevelopment) {
    // Remove a barra inicial se existir para evitar URLs duplas
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.slice(1)
      : imagePath;
    return `http://localhost:8000/storage/${cleanPath}`;
  }

  // Para produção, assumindo que as imagens vêm com URL completa do S3
  return imagePath;
};
