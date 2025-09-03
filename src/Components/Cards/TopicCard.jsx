import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaEye,
  FaThumbtack,
  FaLock,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useForumContext } from "../../contexts/ForumContext";
import TextWithMentions from "../Form/TextWithMentions";
import ToastContainer from "../Layout/ToastContainer";
import { useToast } from "../../utils/useToast";
import styles from "./TopicCard.module.css";

const TopicCard = ({ topic, onEdit, onDelete, onClick }) => {
  const { user } = useAuthContext();
  const { toggleTopicLike } = useForumContext();
  const [isLiking, setIsLiking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Toast hook
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const handleLike = async (e) => {
    e.stopPropagation(); // Evitar trigger do onClick do card
    if (isLiking || !user) return;

    setIsLiking(true);
    try {
      await toggleTopicLike(topic.id);
    } catch (error) {
      console.error("Erro ao dar like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(topic);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  // Confirmar exclusão do tópico
  const confirmDeleteTopic = async (e) => {
    e.stopPropagation();
    try {
      await onDelete(topic.id);
      showSuccess("Tópico excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      showError("Erro ao excluir tópico. Tente novamente.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Cancelar exclusão
  const cancelDeleteTopic = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const canEdit = user && (user.id === topic.user_id || user.role === "admin");
  const canDelete =
    user && (user.id === topic.user_id || user.role === "admin");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`${styles.topicCard} ${topic.fixado ? styles.pinned : ""} ${
        topic.fechado ? styles.closed : ""
      }`}
      onClick={() => onClick(topic)}
    >
      {/* Header do tópico */}
      <div className={styles.topicHeader}>
        <div className={styles.topicInfo}>
          <div className={styles.topicTitle}>
            {topic.fixado && <FaThumbtack className={styles.pinnedIcon} />}
            {topic.fechado && <FaLock className={styles.closedIcon} />}
            <h3>{topic.titulo}</h3>
          </div>
          <div className={styles.topicMeta}>
            <span className={styles.author}>Por {topic.user?.name}</span>
            <span className={styles.date}>{formatDate(topic.created_at)}</span>
          </div>
        </div>

        {/* Ações do tópico */}
        {(canEdit || canDelete) && (
          <div className={styles.topicActions}>
            {canEdit && (
              <button
                className={styles.actionButton}
                onClick={handleEdit}
                title="Editar tópico"
              >
                <FaEdit />
              </button>
            )}
            {canDelete && (
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={handleDelete}
                title="Excluir tópico"
              >
                <FaTrash />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo do tópico */}
      <div className={styles.topicContent}>
        <TextWithMentions
          text={topic.conteudo}
          className={styles.contentText}
        />

        {topic.imagem_url && (
          <div className={styles.topicImage}>
            <img src={topic.imagem_url} alt="Imagem do tópico" />
          </div>
        )}
      </div>

      {/* Footer com estatísticas */}
      <div className={styles.topicFooter}>
        <div className={styles.topicStats}>
          <div className={styles.stat}>
            <FaEye className={styles.statIcon} />
            <span>{topic.visualizacoes || 0}</span>
          </div>

          <div className={styles.stat}>
            <FaComment className={styles.statIcon} />
            <span>{topic.total_comentarios || 0}</span>
          </div>

          <button
            className={`${styles.stat} ${styles.likeButton} ${
              topic.is_liked_by_user ? styles.liked : ""
            }`}
            onClick={handleLike}
            disabled={isLiking || !user}
            title={topic.is_liked_by_user ? "Remover like" : "Dar like"}
          >
            {topic.is_liked_by_user ? <FaHeart /> : <FaRegHeart />}
            <span>{topic.total_likes || 0}</span>
          </button>
        </div>

        {/* Último comentário */}
        {topic.ultimo_comentario && (
          <div className={styles.lastComment}>
            <span className={styles.lastCommentText}>
              Última resposta por{" "}
              <strong>{topic.ultimo_comentario.user?.name}</strong>
            </span>
            <span className={styles.lastCommentDate}>
              {formatDate(topic.ultimo_comentario.created_at)}
            </span>
          </div>
        )}
      </div>

      {/* Modal de confirmação para excluir tópico */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={cancelDeleteTopic}>
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir este tópico?</p>
            <div className={styles.confirmButtons}>
              <button
                onClick={cancelDeleteTopic}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteTopic}
                className={styles.confirmButton}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

TopicCard.propTypes = {
  topic: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default TopicCard;
