import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../contexts/AuthProvider";
import { useToast } from "../../utils/useToast";
import axiosClient from "../../utils/axios_client";
import { getImageUrl } from "../../utils/imageUtils";
import ToastContainer from "../Layout/ToastContainer";
import styles from "./Atualizacoes.module.css";
import formStyles from "./forms.module.css";

const Atualizacoes = () => {
  const { user } = useAuthContext();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [atualizacoes, setAtualizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalImage, setModalImage] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    conteudo: "",
    versao: "",
    tipo: "feature",
    imagem: null,
    ativo: true,
  });

  const isAdmin = user?.role === "admin";

  const tiposUpdate = {
    feature: { label: "Nova Funcionalidade", color: "#4CAF50", icon: "✨" },
    bugfix: { label: "Correção de Bug", color: "#f44336", icon: "🐛" },
    improvement: { label: "Melhoria", color: "#2196F3", icon: "⚡" },
    breaking: { label: "Mudança Significativa", color: "#FF9800", icon: "⚠️" },
  };

  const fetchAtualizacoes = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/atualizacoes?page=${page}`);
        if (response.data.success) {
          setAtualizacoes(response.data.data.data);
          setCurrentPage(response.data.data.current_page);
          setTotalPages(response.data.data.last_page);
        }
      } catch (error) {
        console.error("Erro ao carregar atualizações:", error);
        showError("Erro ao carregar atualizações");
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  useEffect(() => {
    fetchAtualizacoes();
  }, [fetchAtualizacoes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("titulo", formData.titulo);
      formDataToSend.append("conteudo", formData.conteudo);
      formDataToSend.append("versao", formData.versao);
      formDataToSend.append("tipo", formData.tipo);
      formDataToSend.append("ativo", formData.ativo ? "1" : "0");

      if (formData.imagem) {
        formDataToSend.append("imagem", formData.imagem);
      }

      let response;
      if (editingId) {
        response = await axiosClient.post(
          `/atualizacoes/${editingId}`,
          formDataToSend
          // Não define Content-Type - deixa o navegador adicionar automaticamente com boundary
        );
        showSuccess("Atualização editada com sucesso!");
      } else {
        response = await axiosClient.post("/atualizacoes", formDataToSend);
        // Não define Content-Type - deixa o navegador adicionar automaticamente com boundary
        showSuccess("Atualização criada com sucesso!");
      }

      if (response.data.success) {
        resetForm();
        fetchAtualizacoes();
      }
    } catch (error) {
      console.error("Erro ao salvar atualização:", error);
      showError(error.response?.data?.message || "Erro ao salvar atualização");
    }
  };

  const handleEdit = (atualizacao) => {
    setFormData({
      titulo: atualizacao.titulo,
      conteudo: atualizacao.conteudo,
      versao: atualizacao.versao || "",
      tipo: atualizacao.tipo,
      imagem: null,
      ativo: atualizacao.ativo,
    });
    setEditingId(atualizacao.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta atualização?"))
      return;

    try {
      await axiosClient.delete(`/atualizacoes/${id}`);
      showSuccess("Atualização excluída com sucesso!");
      fetchAtualizacoes();
    } catch (error) {
      console.error("Erro ao excluir atualização:", error);
      showError("Erro ao excluir atualização");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await axiosClient.patch(`/atualizacoes/${id}/toggle-status`);
      showSuccess(
        `Atualização ${currentStatus ? "desativada" : "ativada"} com sucesso!`
      );
      fetchAtualizacoes();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showError("Erro ao alterar status da atualização");
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: "",
      conteudo: "",
      versao: "",
      tipo: "feature",
      imagem: null,
      ativo: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className={formStyles.project_container}>
        <div className={styles.loading}>Carregando atualizações...</div>
      </div>
    );
  }

  return (
    <div className={formStyles.project_container}>
      <div className={formStyles.reports_title_container}>
        <h1 className={formStyles.reports_grand_title}>Atualizações</h1>
      </div>

      {isAdmin && (
        <div className={styles.adminControls}>
          <button
            className={styles.addButton}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancelar" : "Nova Atualização"}
          </button>
        </div>
      )}

      {isAdmin && showForm && (
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.updateForm}>
            <h3>{editingId ? "Editar Atualização" : "Nova Atualização"}</h3>

            <div className={styles.formGroup}>
              <label>Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Versão</label>
                <input
                  type="text"
                  value={formData.versao}
                  onChange={(e) =>
                    setFormData({ ...formData, versao: e.target.value })
                  }
                  placeholder="v1.0.0"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  required
                >
                  {Object.entries(tiposUpdate).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Conteúdo *</label>
              <textarea
                value={formData.conteudo}
                onChange={(e) =>
                  setFormData({ ...formData, conteudo: e.target.value })
                }
                required
                rows={6}
                placeholder="Descreva as mudanças desta atualização..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Imagem</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({ ...formData, imagem: e.target.files[0] })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) =>
                    setFormData({ ...formData, ativo: e.target.checked })
                  }
                  className={styles.checkbox}
                />
                Ativo (visível para os usuários)
              </label>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                {editingId ? "Atualizar" : "Criar"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className={styles.cancelButton}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.updatesContainer}>
        {atualizacoes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhuma atualização encontrada</p>
          </div>
        ) : (
          atualizacoes.map((update) => (
            <div key={update.id} className={styles.updateCard}>
              <div className={styles.updateHeader}>
                <div className={styles.updateTitle}>
                  <span
                    className={styles.typeIcon}
                    style={{ backgroundColor: tiposUpdate[update.tipo]?.color }}
                  >
                    {tiposUpdate[update.tipo]?.icon}
                  </span>
                  <div>
                    <h2>{update.titulo}</h2>
                    {update.versao && (
                      <span className={styles.version}>{update.versao}</span>
                    )}
                  </div>
                </div>

                <div className={styles.updateMeta}>
                  <span className={styles.updateDate}>
                    {formatDate(update.created_at)}
                  </span>
                  <span
                    className={styles.updateType}
                    style={{ backgroundColor: tiposUpdate[update.tipo]?.color }}
                  >
                    {tiposUpdate[update.tipo]?.label}
                  </span>
                </div>
              </div>

              {update.imagem && (
                <div
                  className={styles.updateImage}
                  onClick={() => setModalImage(getImageUrl(update.imagem))}
                  title="Clique para ver a imagem em tamanho completo"
                >
                  <img src={getImageUrl(update.imagem)} alt={update.titulo} />
                </div>
              )}

              <div className={styles.updateContent}>
                <p>{update.conteudo}</p>
              </div>

              <div className={styles.updateFooter}>
                <div className={styles.updateAuthor}>
                  Por: {update.autor?.name || "Administrador"}
                </div>

                {isAdmin && (
                  <div className={styles.adminActions}>
                    <button
                      onClick={() => toggleStatus(update.id, update.ativo)}
                      className={`${styles.statusButton} ${
                        update.ativo ? styles.active : styles.inactive
                      }`}
                    >
                      {update.ativo ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => handleEdit(update)}
                      className={styles.editButton}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className={styles.deleteButton}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchAtualizacoes(page)}
              className={`${styles.pageButton} ${
                page === currentPage ? styles.activePage : ""
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal de imagem */}
      {modalImage && (
        <div className={styles.imageModal} onClick={() => setModalImage(null)}>
          <div className={styles.modalContent}>
            <img src={modalImage} alt="Imagem ampliada" />
            <button
              className={styles.closeModal}
              onClick={() => setModalImage(null)}
            >
              ✕
            </button>
            <button
              className={styles.openInNewTab}
              onClick={(e) => {
                e.stopPropagation();
                window.open(modalImage, "_blank");
              }}
            >
              Abrir em nova aba
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default Atualizacoes;
