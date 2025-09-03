import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaThumbtack, FaComment } from "react-icons/fa";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useForumContext } from "../../contexts/ForumContext";
import { useUsersContext } from "../../contexts/UsersContext";
import TopicCard from "../Cards/TopicCard";
import TopicModal from "./TopicModal";
import Input from "../Form/Input";
import Select from "../Form/Select";
import SubmitButton from "../Form/SubmitButton";
import styles from "./Comunidade.module.css";

const Comunidade = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const {
    topics,
    loading,
    fetchTopics,
    deleteTopic,
    fetchUnreadMentionsCount,
    unreadMentionsCount,
  } = useForumContext();
  const { users, fetchUsers } = useUsersContext();

  const [showTopicModal, setShowTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    fixados: false,
    fechados: false,
    orderBy: "recent",
  });

  // Buscar dados iniciais
  useEffect(() => {
    if (!initialLoadDone) {
      console.log("Fazendo carregamento inicial...");
      fetchTopics();
      fetchUsers();
      if (user) {
        fetchUnreadMentionsCount();
      }
      setInitialLoadDone(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, initialLoadDone]); // Removendo as funções das dependências para evitar loop infinito

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

  // Aplicar filtros
  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);

    // Aplicar filtros na busca
    const searchParams = {};
    if (newFilters.search) searchParams.search = newFilters.search;
    if (newFilters.fixados) searchParams.fixados = "1";
    if (newFilters.fechados) searchParams.fechados = "1";

    // Ordenação
    switch (newFilters.orderBy) {
      case "oldest":
        searchParams.sort = "created_at";
        searchParams.order = "asc";
        break;
      case "most_comments":
        searchParams.sort = "comments_count";
        searchParams.order = "desc";
        break;
      case "most_likes":
        searchParams.sort = "likes_count";
        searchParams.order = "desc";
        break;
      default: // recent
        searchParams.sort = "created_at";
        searchParams.order = "desc";
    }

    fetchTopics(searchParams);
  };

  // Criar novo tópico
  const handleCreateTopic = () => {
    if (!user) {
      alert("Você precisa estar logado para criar um tópico.");
      return;
    }
    setEditingTopic(null);
    setShowTopicModal(true);
  };

  // Editar tópico
  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setShowTopicModal(true);
  };

  // Excluir tópico
  const handleDeleteTopic = async (topicId) => {
    try {
      await deleteTopic(topicId);
    } catch (error) {
      console.error("Erro ao excluir tópico:", error);
      alert("Erro ao excluir tópico. Tente novamente.");
    }
  };

  // Abrir tópico para visualização
  const handleOpenTopic = (topic) => {
    navigate(`/comunidade/topico/${topic.id}`);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowTopicModal(false);
    setEditingTopic(null);
  };

  const orderByOptions = [
    { value: "recent", label: "Mais recentes" },
    { value: "oldest", label: "Mais antigos" },
    { value: "most_comments", label: "Mais comentados" },
    { value: "most_likes", label: "Mais curtidos" },
  ];

  return (
    <div className={styles.comunidadeContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>
            <FaComment className={styles.headerIcon} />
            Comunidade
          </h1>
          <p>
            Participe das discussões e compartilhe suas experiências com outros
            jogadores
          </p>
        </div>

        {/* Notificação de menções */}
        {user && unreadMentionsCount > 0 && (
          <div className={styles.mentionsNotification}>
            <span>Você tem {unreadMentionsCount} menção(ões) não lida(s)</span>
            <button
              onClick={() => navigate("/comunidade/mencoes")}
              className={styles.viewMentionsButton}
            >
              Ver menções
            </button>
          </div>
        )}

        {/* Botão criar tópico */}
        <SubmitButton
          text="Novo Tópico"
          onClick={handleCreateTopic}
          className={styles.createTopicButton}
        />
      </div>

      {/* Filtros e busca */}
      <div className={styles.filtersSection}>
        <div className={styles.searchAndFilters}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <Input
              type="text"
              text=""
              name="search"
              placeholder="Buscar tópicos..."
              value={filters.search}
              handleOnChange={(e) =>
                handleFilterChange("search", e.target.value)
              }
            />
          </div>

          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterButton} ${
                filters.fixados ? styles.active : ""
              }`}
              onClick={() => handleFilterChange("fixados", !filters.fixados)}
            >
              <FaThumbtack />
              Fixados
            </button>

            <button
              className={`${styles.filterButton} ${
                filters.fechados ? styles.active : ""
              }`}
              onClick={() => handleFilterChange("fechados", !filters.fechados)}
            >
              <FaFilter />
              Fechados
            </button>
          </div>

          <div className={styles.sortSelect}>
            <Select
              text=""
              name="orderBy"
              options={orderByOptions}
              handleOnChange={(e) =>
                handleFilterChange("orderBy", e.target.value)
              }
              value={filters.orderBy}
            />
          </div>
        </div>
      </div>

      {/* Lista de tópicos */}
      <div className={styles.topicsSection}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Carregando tópicos...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className={styles.emptyState}>
            <FaComment className={styles.emptyIcon} />
            <h3>Nenhum tópico encontrado</h3>
            <p>
              {filters.search || filters.fixados || filters.fechados
                ? "Tente ajustar os filtros de busca."
                : "Seja o primeiro a iniciar uma discussão!"}
            </p>
            {!user && (
              <p className={styles.loginPrompt}>
                <a href="/login">Faça login</a> para participar das discussões.
              </p>
            )}
          </div>
        ) : (
          <div className={styles.topicsList}>
            {topics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onEdit={handleEditTopic}
                onDelete={handleDeleteTopic}
                onClick={handleOpenTopic}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para criar/editar tópico */}
      <TopicModal
        isOpen={showTopicModal}
        onClose={handleCloseModal}
        topic={editingTopic}
        users={users}
        onUserSearch={searchUsers}
      />
    </div>
  );
};

export default Comunidade;
