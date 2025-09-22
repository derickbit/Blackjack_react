import { useState, useCallback } from "react";
import axiosClient from "../utils/axios_client";
import { ForumContext } from "./ForumContext";
import PropTypes from "prop-types";

export default function ForumProvider({ children }) {
  const [topics, setTopics] = useState([]);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [unreadMentionsCount, setUnreadMentionsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [topicLoading, setTopicLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Cache para evitar requests desnecessários
  const [topicsCache, setTopicsCache] = useState(new Map());
  const [commentsCache, setCommentsCache] = useState(new Map());

  // ===== TOPICS =====

  // Buscar todos os tópicos
  const fetchTopics = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const url = `/forum/topics${params ? `?${params}` : ""}`;
      console.log("Fazendo requisição para:", url);

      const response = await axiosClient.get(url);
      console.log("Resposta recebida:", response.data);

      setTopics(response.data.data || response.data || []);
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
      console.error("Status do erro:", error.response?.status);
      console.error("Dados do erro:", error.response?.data);

      // Se for erro de autenticação ou servidor, não fazer mais requisições
      if (error.response?.status === 401 || error.response?.status === 500) {
        console.log(
          "Parando requisições devido ao erro:",
          error.response?.status
        );
        setTopics([]);
        return;
      }

      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, []); // Removendo dependências para evitar loops

  // Buscar um tópico específico
  const fetchTopic = useCallback(
    async (topicId) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken || !topicId) return null;

      // Verificar cache primeiro (válido por 5 minutos)
      const cacheKey = `topic-${topicId}`;
      const cached = topicsCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < 5 * 60 * 1000) {
        console.log("Usando tópico do cache:", topicId);
        setCurrentTopic(cached.data);
        return cached.data;
      }

      setTopicLoading(true);
      setCurrentTopic(null); // Limpar tópico anterior imediatamente
      try {
        const response = await axiosClient.get(`/forum/topics/${topicId}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const topic = response.data.data || response.data;

        // Salvar no cache
        setTopicsCache(
          (prev) =>
            new Map(
              prev.set(cacheKey, {
                data: topic,
                timestamp: now,
              })
            )
        );

        setCurrentTopic(topic);
        return topic;
      } catch (error) {
        console.error(`Erro ao buscar tópico ${topicId}:`, error);
        return null;
      } finally {
        setTopicLoading(false);
      }
    },
    [topicsCache]
  ); // Removendo token das dependências

  // Criar novo tópico
  const createTopic = useCallback(async (formData) => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken)
      throw new Error("Autenticação necessária para criar tópico.");

    try {
      const response = await axiosClient.post("/forum/topics", formData, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const newTopic = response.data.topic || response.data;

      // Adicionar o novo tópico ao início da lista sem refetch
      setTopics((prevTopics) => [newTopic, ...prevTopics]);

      return newTopic;
    } catch (error) {
      console.error("Erro ao criar tópico:", error);
      throw error;
    }
  }, []);

  // Editar tópico
  const updateTopic = useCallback(
    async (topicId, formData) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken)
        throw new Error("Autenticação necessária para editar tópico.");

      try {
        const response = await axiosClient.post(
          `/forum/topics/${topicId}`,
          formData,
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );
        const updatedTopic = response.data.topic || response.data;

        // Atualizar o tópico na lista sem refetch
        setTopics((prevTopics) =>
          prevTopics.map((topic) =>
            topic.id === topicId ? updatedTopic : topic
          )
        );

        // Atualizar tópico atual se for o mesmo
        if (currentTopic?.id === topicId) {
          setCurrentTopic(updatedTopic);
        }

        return updatedTopic;
      } catch (error) {
        console.error("Erro ao editar tópico:", error);
        throw error;
      }
    },
    [currentTopic]
  );

  // Deletar tópico
  const deleteTopic = useCallback(
    async (topicId) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken)
        throw new Error("Autenticação necessária para deletar tópico.");

      try {
        await axiosClient.delete(`/forum/topics/${topicId}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        // Remover tópico da lista sem refetch
        setTopics((prevTopics) =>
          prevTopics.filter((topic) => topic.id !== topicId)
        );

        if (currentTopic?.id === topicId) {
          setCurrentTopic(null);
        }
      } catch (error) {
        console.error("Erro ao deletar tópico:", error);
        throw error;
      }
    },
    [currentTopic]
  );

  // Toggle like em tópico
  const toggleTopicLike = useCallback(
    async (topicId) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken) throw new Error("Autenticação necessária.");

      try {
        const response = await axiosClient.post(
          "/forum/like/toggle",
          {
            likeable_type: "topic",
            likeable_id: topicId,
          },
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );

        // Atualiza o tópico atual se for o mesmo
        if (currentTopic?.id === topicId) {
          setCurrentTopic((prev) => ({
            ...prev,
            total_likes: response.data.total_likes,
            is_liked_by_user: response.data.liked,
          }));
        }

        // Atualiza na lista de tópicos
        setTopics((prev) =>
          prev.map((topic) =>
            topic.id === topicId
              ? {
                  ...topic,
                  total_likes: response.data.total_likes,
                  is_liked_by_user: response.data.liked,
                }
              : topic
          )
        );

        return response.data;
      } catch (error) {
        console.error("Erro ao dar like no tópico:", error);
        throw error;
      }
    },
    [currentTopic]
  );

  // ===== COMMENTS =====

  // Buscar comentários de um tópico
  const fetchComments = useCallback(
    async (topicId) => {
      if (!topicId) return [];

      // Verificar cache primeiro (válido por 2 minutos)
      const cacheKey = `comments-${topicId}`;
      const cached = commentsCache.get(cacheKey);
      const now = Date.now();

      if (cached && now - cached.timestamp < 2 * 60 * 1000) {
        console.log("Usando comentários do cache:", topicId);
        setComments(cached.data);
        return cached.data;
      }

      setCommentsLoading(true);
      setComments([]); // Limpar comentários anteriores imediatamente
      try {
        // Buscar comentários do tópico específico
        const response = await axiosClient.get(
          `/forum/comments?topic_id=${topicId}`
        );
        const allComments = response.data.data || response.data || [];

        // Organizar comentários hierarquicamente
        const organizeComments = (comments) => {
          const mainComments = comments.filter((comment) => !comment.parent_id);
          const replies = comments.filter((comment) => comment.parent_id);

          const organizedComments = mainComments.map((comment) => {
            const commentReplies = replies.filter(
              (reply) => reply.parent_id === comment.id
            );
            return {
              ...comment,
              replies: commentReplies,
            };
          });

          return organizedComments;
        };

        const organizedComments = organizeComments(allComments);

        // Salvar no cache
        setCommentsCache(
          (prev) =>
            new Map(
              prev.set(cacheKey, {
                data: organizedComments,
                timestamp: now,
              })
            )
        );

        setComments(organizedComments);
        return organizedComments;
      } catch (error) {
        console.error("Erro ao buscar comentários:", error);
        setComments([]);
        return [];
      } finally {
        setCommentsLoading(false);
      }
    },
    [commentsCache]
  );

  // Criar comentário
  const createComment = useCallback(
    async (formData) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken)
        throw new Error("Autenticação necessária para comentar.");

      try {
        const response = await axiosClient.post("/forum/comments", formData, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        const newComment = response.data.comment || response.data;
        const topicId = formData.get("forum_topic_id");

        if (topicId) {
          // Invalidar cache de comentários
          const cacheKey = `comments-${topicId}`;
          setCommentsCache((prev) => {
            const newCache = new Map(prev);
            newCache.delete(cacheKey);
            return newCache;
          });

          // Adicionar o novo comentário à lista sem refetch
          setComments((prevComments) => [
            ...prevComments,
            {
              ...newComment,
              replies: [],
            },
          ]);

          // Atualizar contador de comentários no tópico atual
          if (currentTopic?.id === parseInt(topicId)) {
            setCurrentTopic((prev) => ({
              ...prev,
              total_comentarios: (prev.total_comentarios || 0) + 1,
            }));
          }

          // Atualizar contador na lista de tópicos
          setTopics((prevTopics) =>
            prevTopics.map((topic) =>
              topic.id === parseInt(topicId)
                ? {
                    ...topic,
                    total_comentarios: (topic.total_comentarios || 0) + 1,
                  }
                : topic
            )
          );
        }

        return newComment;
      } catch (error) {
        console.error("Erro ao criar comentário:", error);
        throw error;
      }
    },
    [currentTopic]
  );

  // Editar comentário
  const updateComment = useCallback(async (commentId, formData) => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken)
      throw new Error("Autenticação necessária para editar comentário.");

    try {
      const response = await axiosClient.post(
        `/forum/comments/${commentId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      const updatedComment = response.data.comment || response.data;

      // Atualiza na lista de comentários hierárquicos
      setComments((prev) =>
        prev.map((comment) => {
          // Se for um comentário principal
          if (comment.id === commentId) {
            return { ...comment, ...updatedComment };
          }
          // Se for uma resposta dentro de um comentário principal
          if (comment.replies) {
            const updatedReplies = comment.replies.map((reply) =>
              reply.id === commentId ? { ...reply, ...updatedComment } : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );

      return updatedComment;
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      throw error;
    }
  }, []);

  // Deletar comentário
  const deleteComment = useCallback(
    async (commentId, topicId) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken)
        throw new Error("Autenticação necessária para deletar comentário.");

      try {
        await axiosClient.delete(`/forum/comments/${commentId}`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });

        if (topicId) {
          await fetchComments(topicId); // Recarrega comentários
          await fetchTopics(); // Atualiza contadores
        }
      } catch (error) {
        console.error("Erro ao deletar comentário:", error);
        throw error;
      }
    },
    [fetchComments, fetchTopics]
  );

  // Toggle like em comentário
  const toggleCommentLike = useCallback(async (commentId) => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken) throw new Error("Autenticação necessária.");

    try {
      const response = await axiosClient.post(
        "/forum/like/toggle",
        {
          likeable_type: "comment",
          likeable_id: commentId,
        },
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      // Atualiza na lista de comentários hierárquicos
      setComments((prev) =>
        prev.map((comment) => {
          // Se for um comentário principal
          if (comment.id === commentId) {
            return {
              ...comment,
              total_likes: response.data.total_likes,
              is_liked_by_user: response.data.liked,
            };
          }
          // Se for uma resposta dentro de um comentário principal
          if (comment.replies) {
            const updatedReplies = comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    total_likes: response.data.total_likes,
                    is_liked_by_user: response.data.liked,
                  }
                : reply
            );
            return { ...comment, replies: updatedReplies };
          }
          return comment;
        })
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao dar like no comentário:", error);
      throw error;
    }
  }, []);

  // Buscar respostas de um comentário
  const fetchReplies = useCallback(async (commentId) => {
    try {
      const response = await axiosClient.get(
        `/forum/comments/${commentId}/replies`
      );
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Erro ao buscar respostas:", error);
      return [];
    }
  }, []);

  // ===== MENTIONS =====

  // Buscar menções do usuário
  const fetchMentions = useCallback(async (unreadOnly = false) => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken) return [];

    try {
      const params = unreadOnly ? "?unread=true" : "";
      const response = await axiosClient.get(`/forum/mentions${params}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const mentions = response.data.data || response.data || [];
      setMentions(mentions);
      return mentions;
    } catch (error) {
      console.error("Erro ao buscar menções:", error);
      setMentions([]);
      return [];
    }
  }, []);

  // Contar menções não lidas
  const fetchUnreadMentionsCount = useCallback(async () => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken) return;

    try {
      const response = await axiosClient.get("/forum/mentions/unread-count", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setUnreadMentionsCount(response.data.count || 0);
    } catch (error) {
      console.error("Erro ao buscar contagem de menções:", error);
      setUnreadMentionsCount(0);
    }
  }, []); // Removendo token das dependências

  // Marcar menção como lida
  const markMentionAsRead = useCallback(
    async (mentionId) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken) return;

      try {
        await axiosClient.patch(
          `/forum/mentions/${mentionId}/read`,
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        );
        await fetchUnreadMentionsCount();
      } catch (error) {
        console.error("Erro ao marcar menção como lida:", error);
      }
    },
    [fetchUnreadMentionsCount]
  );

  // Marcar todas as menções como lidas
  const markAllMentionsAsRead = useCallback(async () => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken) return;

    try {
      await axiosClient.patch(
        "/forum/mentions/read-all",
        {},
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );
      await fetchUnreadMentionsCount();
      await fetchMentions();
    } catch (error) {
      console.error("Erro ao marcar todas as menções como lidas:", error);
    }
  }, [fetchUnreadMentionsCount, fetchMentions]);

  // Limpar estados
  const clearForumData = useCallback(() => {
    setTopics([]);
    setCurrentTopic(null);
    setComments([]);
    setMentions([]);
    setUnreadMentionsCount(0);
    setTopicsCache(new Map());
    setCommentsCache(new Map());
  }, []);

  return (
    <ForumContext.Provider
      value={{
        // Estados
        topics,
        currentTopic,
        comments,
        mentions,
        unreadMentionsCount,
        loading,
        topicLoading,
        commentsLoading,

        // Tópicos
        fetchTopics,
        fetchTopic,
        createTopic,
        updateTopic,
        deleteTopic,
        toggleTopicLike,

        // Comentários
        fetchComments,
        createComment,
        updateComment,
        deleteComment,
        toggleCommentLike,
        fetchReplies,

        // Menções
        fetchMentions,
        fetchUnreadMentionsCount,
        markMentionAsRead,
        markAllMentionsAsRead,

        // Utilitários
        setCurrentTopic,
        clearForumData,
      }}
    >
      {children}
    </ForumContext.Provider>
  );
}

ForumProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
