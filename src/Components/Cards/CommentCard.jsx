import { useState } from "react";
import PropTypes from "prop-types";
import {
  FaHeart,
  FaRegHeart,
  FaReply,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useForumContext } from "../../contexts/ForumContext";
import TextWithMentions from "../Form/TextWithMentions";
import MentionInput from "../Form/MentionInput";
import SubmitButton from "../Form/SubmitButton";
import styles from "./CommentCard.module.css";

const CommentCard = ({
  comment,
  topicId,
  users = [],
  onUserSearch,
  isReply = false,
  onReply,
}) => {
  const { user } = useAuthContext();
  const { toggleCommentLike, updateComment, deleteComment, createComment } =
    useForumContext();

  const [isLiking, setIsLiking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.conteudo);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const handleLike = async () => {
    if (isLiking || !user) return;

    setIsLiking(true);
    try {
      await toggleCommentLike(comment.id);
    } catch (error) {
      console.error("Erro ao dar like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.conteudo);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.conteudo);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || isUpdating) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("conteudo", editContent);
      formData.append("_method", "PUT");

      await updateComment(comment.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este comentário?")) {
      try {
        await deleteComment(comment.id, topicId);
      } catch (error) {
        console.error("Erro ao excluir comentário:", error);
      }
    }
  };

  const handleReply = () => {
    setShowReplyForm(true);
    setReplyContent("");
  };

  const handleCancelReply = () => {
    setShowReplyForm(false);
    setReplyContent("");
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || isReplying) return;

    setIsReplying(true);
    try {
      const formData = new FormData();
      formData.append("forum_topic_id", topicId);
      formData.append("parent_id", comment.id);
      formData.append("conteudo", replyContent);

      await createComment(formData);
      setShowReplyForm(false);
      setReplyContent("");

      if (onReply) {
        onReply(comment.id);
      }
    } catch (error) {
      console.error("Erro ao responder comentário:", error);
    } finally {
      setIsReplying(false);
    }
  };

  const canEdit =
    user && (user.id === comment.user_id || user.role === "admin");
  const canDelete =
    user && (user.id === comment.user_id || user.role === "admin");

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
    <div className={`${styles.commentCard} ${isReply ? styles.reply : ""}`}>
      {/* Header do comentário */}
      <div className={styles.commentHeader}>
        <div className={styles.commentInfo}>
          <span className={styles.author}>{comment.user?.name}</span>
          <span className={styles.date}>{formatDate(comment.created_at)}</span>
          {comment.editado && <span className={styles.edited}>(editado)</span>}
        </div>

        {/* Ações do comentário */}
        {(canEdit || canDelete) && !isEditing && (
          <div className={styles.commentActions}>
            {canEdit && (
              <button
                className={styles.actionButton}
                onClick={handleEdit}
                title="Editar comentário"
              >
                <FaEdit />
              </button>
            )}
            {canDelete && (
              <button
                className={`${styles.actionButton} ${styles.deleteButton}`}
                onClick={handleDelete}
                title="Excluir comentário"
              >
                <FaTrash />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo do comentário */}
      <div className={styles.commentContent}>
        {isEditing ? (
          <div className={styles.editForm}>
            <MentionInput
              value={editContent}
              onChange={setEditContent}
              placeholder="Editar seu comentário..."
              rows={3}
              users={users}
              onUserSearch={onUserSearch}
            />
            <div className={styles.editActions}>
              <SubmitButton
                text="Salvar"
                onClick={handleSaveEdit}
                className={styles.saveButton}
                disabled={isUpdating || !editContent.trim()}
              />
              <button
                className={styles.cancelButton}
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <FaTimes /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <TextWithMentions
              text={comment.conteudo}
              className={styles.contentText}
            />

            {comment.imagem_url && (
              <div className={styles.commentImage}>
                <img src={comment.imagem_url} alt="Imagem do comentário" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer com ações */}
      {!isEditing && (
        <div className={styles.commentFooter}>
          <div className={styles.commentStats}>
            <button
              className={`${styles.stat} ${styles.likeButton} ${
                comment.is_liked_by_user ? styles.liked : ""
              }`}
              onClick={handleLike}
              disabled={isLiking || !user}
              title={comment.is_liked_by_user ? "Remover like" : "Dar like"}
            >
              {comment.is_liked_by_user ? <FaHeart /> : <FaRegHeart />}
              <span>{comment.total_likes || 0}</span>
            </button>

            {!isReply && user && (
              <button
                className={styles.replyButton}
                onClick={handleReply}
                title="Responder"
              >
                <FaReply />
                <span>Responder</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Formulário de resposta */}
      {showReplyForm && (
        <div className={styles.replyForm}>
          <h4>Respondendo para @{comment.user?.name}</h4>
          <MentionInput
            value={replyContent}
            onChange={setReplyContent}
            placeholder="Escreva sua resposta..."
            rows={3}
            users={users}
            onUserSearch={onUserSearch}
          />
          <div className={styles.replyActions}>
            <SubmitButton
              text="Enviar Resposta"
              onClick={handleSendReply}
              className={styles.replySubmitButton}
              disabled={isReplying || !replyContent.trim()}
            />
            <button
              className={styles.cancelButton}
              onClick={handleCancelReply}
              disabled={isReplying}
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Respostas (se houver) */}
      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              topicId={topicId}
              users={users}
              onUserSearch={onUserSearch}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

CommentCard.propTypes = {
  comment: PropTypes.object.isRequired,
  topicId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  users: PropTypes.array,
  onUserSearch: PropTypes.func,
  isReply: PropTypes.bool,
  onReply: PropTypes.func,
};

export default CommentCard;
