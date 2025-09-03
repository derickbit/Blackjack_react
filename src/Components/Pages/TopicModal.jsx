import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaImage } from "react-icons/fa";
import { useForumContext } from "../../contexts/ForumContext";
import MentionInput from "../Form/MentionInput";
import Input from "../Form/Input";
import SubmitButton from "../Form/SubmitButton";
import styles from "./TopicModal.module.css";

const TopicModal = ({
  isOpen,
  onClose,
  topic = null,
  users = [],
  onUserSearch,
}) => {
  const { createTopic, updateTopic } = useForumContext();
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    imagem: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const isEditing = !!topic;

  useEffect(() => {
    if (isOpen) {
      if (topic) {
        setFormData({
          titulo: topic.titulo || "",
          conteudo: topic.conteudo || "",
          imagem: null,
        });
        setImagePreview(topic.imagem_url || null);
      } else {
        setFormData({
          titulo: "",
          conteudo: "",
          imagem: null,
        });
        setImagePreview(null);
      }
      setErrors({});
    }
  }, [isOpen, topic]);

  const handleInputChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          imagem: "Por favor, selecione apenas arquivos de imagem.",
        }));
        return;
      }

      // Validar tamanho (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          imagem: "A imagem deve ter no máximo 2MB.",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        imagem: file,
      }));

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpar erro da imagem
      if (errors.imagem) {
        setErrors((prev) => ({
          ...prev,
          imagem: null,
        }));
      }
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      imagem: null,
    }));
    setImagePreview(null);

    // Limpar o input de arquivo
    const fileInput = document.getElementById("topic-image");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "O título é obrigatório.";
    } else if (formData.titulo.length > 255) {
      newErrors.titulo = "O título deve ter no máximo 255 caracteres.";
    }

    if (!formData.conteudo.trim()) {
      newErrors.conteudo = "O conteúdo é obrigatório.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("titulo", formData.titulo.trim());
      submitData.append("conteudo", formData.conteudo.trim());

      if (formData.imagem) {
        submitData.append("imagem", formData.imagem);
      }

      if (isEditing) {
        submitData.append("_method", "PUT");
        await updateTopic(topic.id, submitData);
      } else {
        await createTopic(submitData);
      }

      onClose();
    } catch (error) {
      console.error("Erro ao salvar tópico:", error);

      // Tratar erros específicos do backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({
          general: "Erro ao salvar tópico. Tente novamente.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Header do modal */}
        <div className={styles.modalHeader}>
          <h2>{isEditing ? "Editar Tópico" : "Novo Tópico"}</h2>
          <button
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {errors.general && (
            <div className={styles.errorMessage}>{errors.general}</div>
          )}

          {/* Título */}
          <div className={styles.formGroup}>
            <Input
              type="text"
              text="Título"
              name="titulo"
              placeholder="Digite o título do tópico..."
              value={formData.titulo}
              handleOnChange={(e) =>
                handleInputChange("titulo")(e.target.value)
              }
            />
            {errors.titulo && (
              <span className={styles.fieldError}>{errors.titulo}</span>
            )}
          </div>

          {/* Conteúdo */}
          <div className={styles.formGroup}>
            <label htmlFor="conteudo">Conteúdo:</label>
            <MentionInput
              value={formData.conteudo}
              onChange={handleInputChange("conteudo")}
              placeholder="Escreva o conteúdo do seu tópico... Use @ para mencionar outros usuários."
              rows={6}
              users={users}
              onUserSearch={onUserSearch}
            />
            {errors.conteudo && (
              <span className={styles.fieldError}>{errors.conteudo}</span>
            )}
          </div>

          {/* Upload de imagem */}
          <div className={styles.formGroup}>
            <label>Imagem (opcional):</label>
            <div className={styles.imageUpload}>
              <input
                type="file"
                id="topic-image"
                accept="image/*"
                onChange={handleImageChange}
                className={styles.fileInput}
              />
              <label htmlFor="topic-image" className={styles.fileLabel}>
                <FaImage />
                <span>Selecionar imagem</span>
              </label>
              {errors.imagem && (
                <span className={styles.fieldError}>{errors.imagem}</span>
              )}
            </div>

            {/* Preview da imagem */}
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className={styles.removeImageButton}
                  onClick={removeImage}
                  title="Remover imagem"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <SubmitButton
              text={
                isSubmitting
                  ? "Salvando..."
                  : isEditing
                  ? "Salvar Alterações"
                  : "Criar Tópico"
              }
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

TopicModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  topic: PropTypes.object,
  users: PropTypes.array,
  onUserSearch: PropTypes.func,
};

export default TopicModal;
