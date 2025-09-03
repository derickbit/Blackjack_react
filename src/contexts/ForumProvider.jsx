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
  const fetchTopic = useCallback(async (topicId) => {
    const currentToken = localStorage.getItem("ACCESS_TOKEN");
    if (!currentToken || !topicId) return null;

    setLoading(true);
    try {
      const response = await axiosClient.get(`/forum/topics/${topicId}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const topic = response.data.data || response.data;
      setCurrentTopic(topic);
      return topic;
    } catch (error) {
      console.error(`Erro ao buscar tópico ${topicId}:`, error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []); // Removendo token das dependências

  // Criar novo tópico
  const createTopic = useCallback(
    async (formData) => {
      const currentToken = localStorage.getItem("ACCESS_TOKEN");
      if (!currentToken)
        throw new Error("Autenticação necessária para criar tópico.");

      try {
        const response = await axiosClient.post("/forum/topics", formData, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        await fetchTopics(); // Atualiza a lista
        return response.data.topic || response.data;
      } catch (error) {
        console.error("Erro ao criar tópico:", error);
        throw error;
      }
    },
    [fetchTopics]
  );

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
        await fetchTopics(); // Atualiza a lista
        if (currentTopic?.id === topicId) {
          await fetchTopic(topicId); // Atualiza o tópico atual
        }
        return response.data.topic || response.data;
      } catch (error) {
        console.error("Erro ao editar tópico:", error);
        throw error;
      }
    },
    [fetchTopics, currentTopic, fetchTopic]
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
        await fetchTopics(); // Atualiza a lista
        if (currentTopic?.id === topicId) {
          setCurrentTopic(null);
        }
      } catch (error) {
        console.error("Erro ao deletar tópico:", error);
        throw error;
      }
    },
    [fetchTopics, currentTopic]
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
  const fetchComments = useCallback(async (topicId) => {
    if (!topicId) return [];

    try {
      let allComments = [];

      // Primeira tentativa: endpoint genérico (que sabemos que funciona)
      try {
        const response = await axiosClient.get(
          `/forum/comments?topic_id=${topicId}`
        );
        allComments = response.data.data || response.data || [];
      } catch (error) {
        console.log("Erro ao buscar comentários:", error.message);
        return [];
      }

      // Se não retornou respostas, buscar TODOS os comentários globalmente
      // (Isso é necessário porque o backend não está incluindo respostas na busca por tópico)
      if (!allComments.some((comment) => comment.parent_id)) {
        try {
          const globalResponse = await axiosClient.get(`/forum/comments`);
          const globalComments =
            globalResponse.data.data || globalResponse.data || [];

          // Filtrar para incluir TODOS os comentários deste tópico (principais + respostas)
          allComments = globalComments.filter(
            (comment) => comment.forum_topic_id == topicId
          );

          console.log(
            `📝 Busca global encontrou ${allComments.length} comentários para o tópico ${topicId}`
          );
        } catch (error) {
          console.log("Erro na busca global:", error.message);
        }
      }

      // Organizar comentários hierarquicamente
      const organizeComments = (comments) => {
        const mainComments = comments.filter((comment) => !comment.parent_id);
        const replies = comments.filter((comment) => comment.parent_id);

        console.log(
          `📝 Organizando: ${mainComments.length} principais + ${replies.length} respostas`
        );

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
      setComments(organizedComments);
      return organizedComments;
    } catch (error) {
      console.error("Erro geral ao buscar comentários:", error);
      setComments([]);
      return [];
    }
  }, []);

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

        const topicId = formData.get("forum_topic_id");
        if (topicId) {
          await fetchComments(topicId); // Recarrega comentários
          await fetchTopics(); // Atualiza contadores na lista de tópicos
        }

        return response.data.comment || response.data;
      } catch (error) {
        console.error("Erro ao criar comentário:", error);
        throw error;
      }
    },
    [fetchComments, fetchTopics]
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
