import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaHeart,
  FaRegHeart,
  FaEdit,
  FaTrash,
  FaReply,
} from "react-icons/fa";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useForumContext } from "../../contexts/ForumContext";
import { useUsersContext } from "../../contexts/UsersContext";
import CommentCard from "../Cards/CommentCard";
import TopicModal from "./TopicModal";
import MentionInput from "../Form/MentionInput";
import SubmitButton from "../Form/SubmitButton";
import TextWithMentions from "../Form/TextWithMentions";
import ToastContainer from "../Layout/ToastContainer";
import LoadingSpinner from "../Layout/LoadingSpinner";
import ImageModal from "../Layout/ImageModal";
import { useToast } from "../../utils/useToast";
import { useImageModal } from "../../utils/useImageModal";
import styles from "./TopicDetail.module.css";

const TopicDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    currentTopic,
    comments,
    loading,
    topicLoading,
    commentsLoading,
    fetchTopic,
    fetchComments,
    createComment,
    deleteTopic,
    toggleTopicLike,
  } = useForumContext();
  const { users, fetchUsers } = useUsersContext();

  // Toast hook
  const { toasts, showSuccess, showError, removeToast } = useToast();

  // Image modal hook
  const { modalImage, modalAlt, isModalOpen, openImageModal, closeImageModal } =
    useImageModal();

  const [showEditModal, setShowEditModal] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Buscar dados do tópico
  useEffect(() => {
    if (id && !initialLoadDone) {
      // Carregar tópico e comentários em paralelo, mas sem aguardar users
      Promise.all([fetchTopic(id), fetchComments(id)]);

      // Carregar usuários em background (não bloqueia o carregamento)
      fetchUsers();
      setInitialLoadDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, initialLoadDone]); // Removendo as funções das dependências para evitar loop infinito

  // Reset quando mudar de tópico
  useEffect(() => {
    setInitialLoadDone(false);
  }, [id]);

  // Buscar usuários para menções
  const searchUsers = useCallback(
    async (query) => {
      if (!query || query.length < 2) return users.slice(0, 5);

      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          (u.email && u.email.toLowerCase().includes(query.toLowerCase()))
      );
      return filtered.slice(0, 10);
    },
    [users]
  );

  // Voltar para lista de tópicos
  const handleGoBack = () => {
    navigate("/comunidade");
  };

  // Dar like no tópico
  const handleTopicLike = async () => {
    if (isLiking || !user || !currentTopic) return;

    setIsLiking(true);
    try {
      await toggleTopicLike(currentTopic.id);
    } catch (error) {
      console.error("Erro ao dar like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  // Editar tópico
  const handleEditTopic = () => {
    setShowEditModal(true);
  };

  // Excluir tópico - primeira etapa (mostrar confirmação)
  const handleDeleteTopic = () => {
    if (!currentTopic) return;
    setShowDeleteConfirm(true);
  };

  // Confirmar exclusão do tópico
  const confirmDeleteTopic = async () => {
    if (!currentTopic) return;

    try {
      await deleteTopic(currentTopic.id);
      showSuccess("Tópico excluído com sucesso!");
      navigate("/comunidade");
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      showError("Erro ao excluir tópico. Tente novamente.");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Cancelar exclusão
  const cancelDeleteTopic = () => {
    setShowDeleteConfirm(false);
  };

  // Enviar comentário
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || isCommenting || !user) return;

    setIsCommenting(true);
    try {
      const formData = new FormData();
      formData.append("forum_topic_id", id);
      formData.append("conteudo", commentContent);

      await createComment(formData);
      setCommentContent("");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      alert("Erro ao enviar comentário. Tente novamente.");
    } finally {
      setIsCommenting(false);
    }
  };

  // Recarregar comentários após resposta
  const handleCommentReply = () => {
    fetchComments(id);
  };

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

  if (topicLoading || (loading && !currentTopic)) {
    return (
      <div className={styles.topicDetailContainer}>
        <LoadingSpinner message="Carregando tópico..." size="large" />
      </div>
    );
  }

  if (!currentTopic && !loading) {
    return (
      <div className={styles.topicDetailContainer}>
        <div className={styles.notFound}>
          <h2>Tópico não encontrado</h2>
          <p>O tópico que você está procurando não existe ou foi removido.</p>
          <button onClick={handleGoBack} className={styles.backButton}>
            <FaArrowLeft /> Voltar para comunidade
          </button>
        </div>
      </div>
    );
  }

  const canEdit =
    user && (user.id === currentTopic?.user_id || user.role === "admin");
  const canDelete =
    user && (user.id === currentTopic?.user_id || user.role === "admin");

  return (
    <div className={styles.topicDetailContainer}>
      {/* Header com botão voltar */}
      <div className={styles.header}>
        <button onClick={handleGoBack} className={styles.backButton}>
          <FaArrowLeft /> Voltar para comunidade
        </button>
      </div>

      {currentTopic && (
        <>
          {/* Conteúdo do tópico */}
          <div className={styles.topicContent}>
            <div className={styles.topicHeader}>
              <div className={styles.topicInfo}>
                <h1 className={styles.topicTitle}>{currentTopic.titulo}</h1>
                <div className={styles.topicMeta}>
                  <span className={styles.author}>
                    Por {currentTopic.user?.name}
                  </span>
                  <span className={styles.date}>
                    {formatDate(currentTopic.created_at)}
                  </span>
                  <span className={styles.views}>
                    {currentTopic.visualizacoes || 0} visualizações
                  </span>
                </div>
              </div>

              {/* Ações do tópico */}
              {(canEdit || canDelete) && (
                <div className={styles.topicActions}>
                  {canEdit && (
                    <button
                      className={styles.actionButton}
                      onClick={handleEditTopic}
                      title="Editar tópico"
                    >
                      <FaEdit />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={handleDeleteTopic}
                      title="Excluir tópico"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className={styles.topicBody}>
              <TextWithMentions
                text={currentTopic.conteudo}
                className={styles.topicText}
              />

              {currentTopic.imagem_url && (
                <div className={styles.topicImage}>
                  <img
                    src={currentTopic.imagem_url}
                    alt="Imagem do tópico"
                    onClick={() =>
                      openImageModal(
                        currentTopic.imagem_url,
                        "Imagem do tópico"
                      )
                    }
                    style={{ cursor: "pointer" }}
                  />
                </div>
              )}
            </div>

            {/* Like button */}
            <div className={styles.topicStats}>
              <button
                className={`${styles.likeButton} ${
                  currentTopic.is_liked_by_user ? styles.liked : ""
                }`}
                onClick={handleTopicLike}
                disabled={isLiking || !user}
                title={
                  currentTopic.is_liked_by_user ? "Remover like" : "Dar like"
                }
              >
                {currentTopic.is_liked_by_user ? <FaHeart /> : <FaRegHeart />}
                <span>{currentTopic.total_likes || 0} curtida(s)</span>
              </button>
            </div>
          </div>

          {/* Seção de comentários */}
          <div className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>
              <FaReply className={styles.commentsIcon} />
              Comentários ({comments.length})
            </h2>

            {/* Formulário para novo comentário */}
            {user ? (
              <div className={styles.newCommentForm}>
                <h3>Deixe seu comentário</h3>
                <MentionInput
                  value={commentContent}
                  onChange={setCommentContent}
                  placeholder="Escreva seu comentário... Use @ para mencionar outros usuários."
                  rows={4}
                  users={users}
                  onUserSearch={searchUsers}
                />
                <div className={styles.commentActions}>
                  <SubmitButton
                    text={isCommenting ? "Enviando..." : "Enviar Comentário"}
                    onClick={handleSubmitComment}
                    disabled={isCommenting || !commentContent.trim()}
                    className={styles.submitCommentButton}
                  />
                </div>
              </div>
            ) : (
              <div className={styles.loginPrompt}>
                <p>
                  <a href="/login">Faça login</a> para participar da discussão.
                </p>
              </div>
            )}

            {/* Lista de comentários */}
            <div className={styles.commentsList}>
              {commentsLoading ? (
                <LoadingSpinner
                  message="Carregando comentários..."
                  size="medium"
                />
              ) : comments.length === 0 ? (
                <div className={styles.noComments}>
                  <p>Seja o primeiro a comentar neste tópico!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    topicId={id}
                    users={users}
                    onUserSearch={searchUsers}
                    onReply={handleCommentReply}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal para editar tópico */}
      <TopicModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        topic={currentTopic}
        users={users}
        onUserSearch={searchUsers}
      />

      {/* Modal de confirmação para excluir tópico */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
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

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={modalImage}
        imageAlt={modalAlt}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default TopicDetail;
