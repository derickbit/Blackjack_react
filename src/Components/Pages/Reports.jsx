import { useState, useEffect, useRef, useCallback } from "react";
import { useReportsContext } from "../../contexts/ReportsProvider";
import { getImageUrl } from "../../utils/imageUtils";
import styles from "./Reports.module.css";
import formStyles from "./forms.module.css";
import rankingStyles from "./Ranking.module.css";
import { useAuthContext } from "../../contexts/AuthProvider";
import imageCompression from "browser-image-compression";
import { useToast } from "../../utils/useToast";
import ToastContainer from "../Layout/ToastContainer";
import ImageModal from "../Layout/ImageModal";
import { useImageModal } from "../../utils/useImageModal";
import {
  FaPaperPlane,
  FaImage,
  FaSync,
  FaInbox,
  FaTimes,
} from "react-icons/fa";

const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  if (apiUrl && apiUrl.endsWith("/api")) {
    return apiUrl.slice(0, -"/api".length);
  }
  if (apiUrl && apiUrl.startsWith("https://")) {
    return apiUrl;
  }
  return "http://localhost:8000";
};
// eslint-disable-next-line no-unused-vars
const BACKEND_BASE_URL = getBackendBaseUrl();

const MAX_IMAGE_SIZE_MB = 10; // Limite máximo aceito pelo backend
const MAX_COMPRESSED_SIZE_MB = 0.5; // Tamanho alvo para compressão (ex: 0.5MB)
const MAX_WIDTH_OR_HEIGHT = 900; // Redimensiona se maior que isso

const Reports = () => {
  const {
    fetchReports,
    reports,
    createReport,
    fetchReportMessages,
    sendReportMessage,
    updateReportStatus,
  } = useReportsContext();

  const { toasts, showError, removeToast } = useToast();

  // Image modal hook
  const { modalImage, modalAlt, isModalOpen, openImageModal, closeImageModal } =
    useImageModal();

  const reportsPollingRef = useRef(null);
  const messagesPollingRef = useRef(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRefNewReport = useRef(null);
  const fileInputRefChatMessage = useRef(null);

  const [lastReportId, setLastReportId] = useState(null);
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const [newReport, setNewReport] = useState({
    titulo: "",
    mensagem: "",
    imagem: null,
  });
  const [newReportImagePreview, setNewReportImagePreview] = useState(null);
  const [newChatMessageImage, setNewChatMessageImage] = useState(null);
  const [newChatMessageImagePreview, setNewChatMessageImagePreview] =
    useState(null);

  const loadReportsList = useCallback(async () => {
    if (user) {
      await fetchReports();
    }
    setLoading(false);
  }, [fetchReports, user]);

  useEffect(() => {
    loadReportsList();
    clearInterval(reportsPollingRef.current);
    reportsPollingRef.current = setInterval(loadReportsList, 60000);
    return () => clearInterval(reportsPollingRef.current);
  }, [loadReportsList]);

  const loadChatMessages = useCallback(
    async (reportIdToLoad) => {
      if (user && reportIdToLoad) {
        const msgs = await fetchReportMessages(reportIdToLoad);
        setMessages(msgs || []);
      }
    },
    [fetchReportMessages, user]
  );

  useEffect(() => {
    if (showChat && selectedReport?.id) {
      loadChatMessages(selectedReport.id);
      clearInterval(messagesPollingRef.current);
      messagesPollingRef.current = setInterval(
        () => loadChatMessages(selectedReport.id),
        60000
      );
      return () => clearInterval(messagesPollingRef.current);
    } else {
      clearInterval(messagesPollingRef.current);
    }
  }, [showChat, selectedReport, loadChatMessages]);

  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat]);

  useEffect(() => {
    if (!loading && reports.length > 0 && !showChat) {
      const latest = [...reports].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];
      if (latest && latest.id !== lastReportId) {
        setLastReportId(latest.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports, loading, showChat]);

  useEffect(() => {
    const currentReportPreview = newReportImagePreview;
    const currentMessagePreview = newChatMessageImagePreview;
    return () => {
      if (currentReportPreview) URL.revokeObjectURL(currentReportPreview);
      if (currentMessagePreview) URL.revokeObjectURL(currentMessagePreview);
    };
  }, [newReportImagePreview, newChatMessageImagePreview]);

  const openChat = async (report) => {
    setSelectedReport(report);
    setShowChat(true);
    if (report.id) {
      const msgs = await fetchReportMessages(report.id);
      setMessages(msgs || []);
    }
  };

  const handleCloseChat = () => {
    setShowChat(false);
    setSelectedReport(null);
    setMessages([]);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await updateReportStatus(reportId, newStatus);
      await loadReportsList();
    } catch {
      showError(
        "Erro ao atualizar status. Verifique se você está autenticado como admin.",
        5000
      );
    }
  };

  // NOVO: Handler de imagem do novo report com compressão
  const handleNewReportImageChange = async (e) => {
    const file = e.target.files[0];
    if (newReportImagePreview) URL.revokeObjectURL(newReportImagePreview);
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        showError(`A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB}MB.`, 4000);
        return;
      }
      try {
        const options = {
          maxSizeMB: MAX_COMPRESSED_SIZE_MB,
          maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setNewReport({ ...newReport, imagem: compressedFile });
        setNewReportImagePreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        showError("Erro ao comprimir imagem.", 4000);
        setNewReport({ ...newReport, imagem: null });
        setNewReportImagePreview(null);
      }
    } else {
      setNewReport({ ...newReport, imagem: null });
      setNewReportImagePreview(null);
    }
  };

  // NOVO: Remover imagem do novo report
  const handleRemoveNewReportImage = () => {
    if (newReportImagePreview) URL.revokeObjectURL(newReportImagePreview);
    setNewReport({ ...newReport, imagem: null });
    setNewReportImagePreview(null);
    // Limpar o input de arquivo
    if (fileInputRefNewReport.current) {
      fileInputRefNewReport.current.value = "";
    }
  };

  // NOVO: Handler de imagem do chat com compressão
  const handleNewChatMessageImageChange = async (e) => {
    const file = e.target.files[0];
    if (newChatMessageImagePreview)
      URL.revokeObjectURL(newChatMessageImagePreview);
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        showError(`A imagem deve ter no máximo ${MAX_IMAGE_SIZE_MB}MB.`, 4000);
        return;
      }
      try {
        const options = {
          maxSizeMB: MAX_COMPRESSED_SIZE_MB,
          maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        setNewChatMessageImage(compressedFile);
        setNewChatMessageImagePreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        showError("Erro ao comprimir imagem.", 4000);
        setNewChatMessageImage(null);
        setNewChatMessageImagePreview(null);
      }
    } else {
      setNewChatMessageImage(null);
      setNewChatMessageImagePreview(null);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (sendingMessage) return; // Evita múltiplos envios

    // Validação: precisa ter texto ou imagem
    if ((!newMessage || !newMessage.trim()) && !newChatMessageImage) {
      showError("A mensagem deve ter um texto ou uma imagem", 4000);
      return;
    }

    if (!selectedReport?.id) return;

    setSendingMessage(true); // Bloqueia o botão imediatamente
    try {
      const formData = new FormData();
      formData.append("mensagem", newMessage.trim());
      if (newChatMessageImage) formData.append("imagem", newChatMessageImage);

      await sendReportMessage(selectedReport.id, formData);
      await loadChatMessages(selectedReport.id);
      setNewMessage("");
      setNewChatMessageImage(null);
      if (newChatMessageImagePreview)
        URL.revokeObjectURL(newChatMessageImagePreview);
      setNewChatMessageImagePreview(null);
      if (fileInputRefChatMessage.current) {
        fileInputRefChatMessage.current.value = "";
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;

        // Trata erros de validação do backend de forma mais amigável
        if (errorData.errors && errorData.errors.mensagem) {
          showError(errorData.errors.mensagem[0], 5000);
        } else if (errorData.message) {
          showError(errorData.message, 5000);
        } else {
          showError(
            "Erro ao enviar mensagem. Verifique os dados e tente novamente.",
            5000
          );
        }
      } else {
        showError("Erro ao enviar mensagem. Tente novamente.", 5000);
      }
    } finally {
      setSendingMessage(false); // Libera o botão após o envio (ou erro)
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("titulo", newReport.titulo);
    formData.append("mensagem", newReport.mensagem);
    if (newReport.imagem) formData.append("imagem", newReport.imagem);

    await createReport(formData);
    setNewReport({ titulo: "", mensagem: "", imagem: null });
    if (newReportImagePreview) URL.revokeObjectURL(newReportImagePreview);
    setNewReportImagePreview(null);
    if (fileInputRefNewReport.current) {
      fileInputRefNewReport.current.value = "";
    }
  };

  return (
    <div className={styles.project_container}>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className={rankingStyles.grand_title_container}>
        <h1 className={rankingStyles.grand_title}>Envie seu recado</h1>
      </div>
      <div className={styles.reports_flex}>
        {/* Formulário de novo report */}

        <div className={styles.reports_box}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Enviar novo relato</h2>
            <p className={styles.formSubtitle}>
              Compartilhe suas sugestões, dúvidas ou relate problemas
            </p>
          </div>
          <form className={styles.reportForm} onSubmit={handleCreateReport}>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="titulo">
                Título do relato
              </label>
              <input
                className={styles.fieldInput}
                type="text"
                id="titulo"
                placeholder="Ex: Problema no carregamento do jogo"
                value={newReport.titulo}
                onChange={(e) =>
                  setNewReport({ ...newReport, titulo: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="mensagem">
                Descrição detalhada
              </label>
              <textarea
                className={styles.fieldTextarea}
                id="mensagem"
                placeholder="Descreva detalhadamente seu relato para que possamos te ajudar melhor..."
                value={newReport.mensagem}
                onChange={(e) =>
                  setNewReport({ ...newReport, mensagem: e.target.value })
                }
                required
                rows={5}
              />
            </div>

            {/* Preview da imagem */}
            {newReportImagePreview && (
              <div className={styles.formField}>
                <div className={styles.imagePreviewContainer}>
                  <img
                    src={newReportImagePreview}
                    alt="Preview"
                    className={styles.imagePreview}
                  />
                  <button
                    type="button"
                    className={styles.removeImageButton}
                    onClick={handleRemoveNewReportImage}
                    title="Remover imagem"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}

            <div className={styles.submitButtonWrapper}>
              <label className={styles.fileUploadButton}>
                <FaImage className={styles.uploadIcon} />
                <input
                  ref={fileInputRefNewReport}
                  type="file"
                  accept="image/*"
                  onChange={handleNewReportImageChange}
                  className={styles.fileInput}
                />
                <span className={styles.uploadText}>
                  {newReport.imagem ? "Alterar" : "Escolher imagem"}
                </span>
              </label>
              <button type="submit" className={formStyles.button}>
                <FaPaperPlane style={{ marginRight: "8px" }} />
                Enviar Relato
              </button>
            </div>
          </form>
        </div>

        {/* Lista de relatos enviados */}
        <div className={styles.reports_box}>
          <div className={styles.listHeader}>
            <div>
              <h2 className={styles.listTitle}>Seus relatos</h2>
              <p className={styles.listSubtitle}>
                Acompanhe o status dos seus relatos enviados
              </p>
            </div>
            {!loading && user && (
              <button
                className={styles.refreshButton}
                onClick={loadReportsList}
                title="Atualizar lista"
              >
                <FaSync />
              </button>
            )}
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Carregando relatos...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className={styles.emptyState}>
              <FaInbox className={styles.emptyIcon} />
              <h3>Nenhum relato encontrado</h3>
              <p>Você ainda não enviou nenhum relato.</p>
            </div>
          ) : (
            <div className={styles.reportsList}>
              {[...reports].reverse().map((report) => (
                <div key={report.id} className={styles.reportCard}>
                  {/* Top Bar */}
                  <div className={styles.cardTopBar}>
                    <div className={styles.cardIdBadge}>
                      <span className={styles.idHash}>#</span>
                      <span className={styles.idNumber}>{report.id}</span>
                    </div>
                    <div className={styles.cardStatusWrapper}>
                      {user?.role === "admin" ? (
                        <select
                          className={styles.statusSelect}
                          value={report.status}
                          onChange={(e) =>
                            handleStatusChange(report.id, e.target.value)
                          }
                        >
                          <option value="aberto">Aberto</option>
                          <option value="em_análise">Em análise</option>
                          <option value="concluído">Concluído</option>
                        </select>
                      ) : (
                        <span
                          className={`${styles.statusBadge} ${
                            styles["status_" + report.status]
                          }`}
                        >
                          <span className={styles.statusDot}>●</span>
                          {report.status?.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{report.titulo}</h3>
                    <p className={styles.cardMessage}>{report.mensagem}</p>
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <div className={styles.dateInfo}>
                        <span className={styles.dateIcon}>📅</span>
                        <span className={styles.dateText}>
                          {new Date(report.created_at).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                      <div className={styles.timeInfo}>
                        <span className={styles.timeIcon}>🕐</span>
                        <span className={styles.timeText}>
                          {new Date(report.created_at).toLocaleTimeString(
                            "pt-BR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      </div>
                    </div>

                    {(user?.role === "admin" ||
                      (user?.id === report.user_id &&
                        report.status !== "concluído")) && (
                      <div className={styles.cardActions}>
                        <button
                          className={formStyles.button}
                          onClick={() => openChat(report)}
                        >
                          Abrir Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showChat && selectedReport && (
        <div className={styles.chatModalOverlay}>
          <div className={styles.chatbox}>
            <div className={styles.chatHeader}>
              <span>Chat: {selectedReport.titulo}</span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <button
                  className={styles.refreshButton}
                  onClick={() => loadChatMessages(selectedReport.id)}
                  title="Atualizar mensagens"
                >
                  <FaSync />
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={handleCloseChat}
                  title="Fechar"
                >
                  ×
                </button>
              </div>
            </div>
            <div className={styles.chatMessagesArea}>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${styles.messageWrapper} ${
                    msg.user_id === user?.id
                      ? styles.messageWrapperUser
                      : styles.messageWrapperAdmin
                  }`}
                >
                  <div
                    className={`${styles.messageBubble} ${
                      msg.user_id === user?.id
                        ? styles.messageBubbleUser
                        : styles.messageBubbleAdmin
                    }`}
                  >
                    <div className={styles.messageSender}>
                      {msg.user?.name ||
                        (msg.user_id === user?.id ? "Você" : "Suporte")}
                    </div>
                    <div className={styles.messageContent}>{msg.mensagem}</div>
                    {msg.imagem && (
                      <div className={styles.messageImage}>
                        {getImageUrl(msg.imagem) ? (
                          <img
                            src={getImageUrl(msg.imagem)}
                            alt="Imagem da mensagem"
                            onClick={() =>
                              openImageModal(
                                getImageUrl(msg.imagem),
                                "Imagem da mensagem"
                              )
                            }
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              padding: "10px",
                              backgroundColor: "rgba(224, 225, 221, 0.1)",
                              borderRadius: "4px",
                              fontSize: "0.9em",
                              color: "#e0e1dd",
                            }}
                          >
                            ⚠️ Imagem não disponível (ID: {msg.imagem})
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className={`${styles.messageTimestamp} ${
                        msg.user_id === user?.id
                          ? styles.messageTimestampUser
                          : styles.messageTimestampAdmin
                      }`}
                    >
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form
              className={styles.form}
              onSubmit={handleSendMessage}
              style={{
                marginTop: 8,
                paddingTop: "10px",
                borderTop: "1px solid #eee",
              }}
            >
              {newChatMessageImagePreview && (
                <div style={{ marginBottom: "10px", textAlign: "center" }}>
                  <img
                    src={newChatMessageImagePreview}
                    alt="Preview da nova imagem do chat"
                    style={{
                      maxHeight: "80px",
                      maxWidth: "100%",
                      borderRadius: 4,
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div className={styles.chatInputRow}>
                <input
                  className={styles.chatInput}
                  type="text"
                  placeholder="Digite sua mensagem"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <label className={styles.attachmentLabel} title="Anexar imagem">
                  <input
                    ref={fileInputRefChatMessage}
                    className={styles.attachmentInput}
                    type="file"
                    accept="image/*"
                    onChange={handleNewChatMessageImageChange}
                  />
                  <span className={styles.attachmentIcon}>📎</span>
                </label>
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className={formStyles.button}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default Reports;
