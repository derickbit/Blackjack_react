import { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { useReportsContext } from "../../contexts/ReportsProvider";
import { getImageUrl } from "../../utils/imageUtils";
import styles from "./forms.module.css";
import SubmitButton from "../Form/SubmitButton";
import { useAuthContext } from "../../contexts/AuthProvider";
import imageCompression from "browser-image-compression";
import { useToast } from "../../utils/useToast";
import ToastContainer from "../Layout/ToastContainer";
import ImageModal from "../Layout/ImageModal";
import { useImageModal } from "../../utils/useImageModal";

// Ícone de atualização simples (SVG)
const RefreshIcon = ({ onClick, style, title = "Atualizar" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 16 16"
    style={{
      cursor: "pointer",
      marginLeft: "10px",
      verticalAlign: "middle",
      ...style,
    }}
    onClick={onClick}
    title={title}
  >
    <path
      fillRule="evenodd"
      d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
    />
    <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
  </svg>
);

RefreshIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
  style: PropTypes.object,
  title: PropTypes.string,
};

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
      <div className={styles.reports_title_container}>
        <h1 className={styles.reports_grand_title}>Envie seu recado</h1>
      </div>
      <div className={styles.reports_flex}>
        {/* Formulário de novo report */}

        <div className={styles.reports_box}>
          <h2
            className={styles.title}
            style={{
              fontSize: "1.3rem",
              marginTop: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            Enviar novo relato
          </h2>
          <form
            className={styles.form}
            onSubmit={handleCreateReport}
            style={{ marginBottom: "20px", width: "100%" }}
          >
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="titulo">
                Título:
              </label>
              <input
                className={styles.input}
                type="text"
                id="titulo"
                placeholder="Título"
                value={newReport.titulo}
                onChange={(e) =>
                  setNewReport({ ...newReport, titulo: e.target.value })
                }
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="mensagem">
                Descreva seu relato:
              </label>
              <textarea
                className={styles.input}
                id="mensagem"
                placeholder="Descreva seu relato"
                value={newReport.mensagem}
                onChange={(e) =>
                  setNewReport({ ...newReport, mensagem: e.target.value })
                }
                required
                rows={3}
              />
            </div>
            <div
              className={styles.inputGroup}
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <label
                className={styles.customFileUploadButton}
                title="Anexar imagem"
              >
                <input
                  ref={fileInputRefNewReport}
                  type="file"
                  accept="image/*"
                  onChange={handleNewReportImageChange}
                  style={{ display: "none" }}
                />
                <span className={styles.attachmentIcon}>📎</span>
                <span className={styles.attachmentText}>
                  {newReport.imagem ? newReport.imagem.name : "Anexar imagem"}
                </span>
              </label>
              {newReportImagePreview && (
                <img
                  src={newReportImagePreview}
                  alt="preview novo report"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 4,
                    objectFit: "cover",
                    marginLeft: 8,
                  }}
                />
              )}
              <span style={{ color: "#e0e1dd", fontSize: "0.95em" }}>
                {newReport.imagem ? newReport.imagem.name : "Anexar imagem"}
              </span>
            </div>
            <SubmitButton text="Enviar Relato" type="submit" />
          </form>
        </div>

        {/* Lista de relatos enviados */}
        <div className={styles.reports_box}>
          <h2
            className={styles.title}
            style={{
              fontSize: "1.3rem",
              marginTop: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            Relatos enviados
            {!loading && user && (
              <RefreshIcon
                onClick={loadReportsList}
                title="Atualizar lista de relatos"
              />
            )}
          </h2>
          {loading ? (
            <p>Carregando...</p>
          ) : reports.length === 0 ? (
            <p>Nenhum relato encontrado.</p>
          ) : (
            <div className={styles.reportsTableWrapper}>
              <table className={styles.reportsTable}>
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {[...reports].reverse().map((report) => (
                    <tr key={report.id}>
                      <td>{report.titulo}</td>
                      <td>
                        {user?.role === "admin" ? (
                          <select
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
                          report.status?.replace("_", " ") || "N/A"
                        )}
                      </td>
                      <td>{new Date(report.created_at).toLocaleString()}</td>
                      <td>
                        {(user?.role === "admin" ||
                          (user?.id === report.user_id &&
                            report.status !== "concluído")) && (
                          <SubmitButton
                            text="Abrir Chat"
                            onClick={() => openChat(report)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showChat && selectedReport && (
        <div className={styles.chatModalOverlay} onClick={handleCloseChat}>
          <div className={styles.chatbox} onClick={(e) => e.stopPropagation()}>
            <div
              className={styles.chatHeader}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: "10px",
                borderBottom: "1px solid #eee",
              }}
            >
              <span>Chat: {selectedReport.titulo}</span>
              <div style={{ display: "flex", alignItems: "center" }}>
                <RefreshIcon
                  onClick={() => loadChatMessages(selectedReport.id)}
                  style={{ marginRight: "10px" }}
                  title="Atualizar mensagens"
                />
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
                  style={{
                    marginBottom: 12,
                    textAlign: msg.user_id === user?.id ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      backgroundColor:
                        msg.user_id === user?.id ? "#dcf8c6" : "#f1f0f0",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      display: "inline-block",
                      maxWidth: "70%",
                      textAlign: "left",
                      boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
                    }}
                  >
                    <strong>
                      {msg.user?.name ||
                        (msg.user_id === user?.id ? "Você" : "Suporte")}
                    </strong>
                    : <div>{msg.mensagem}</div>
                    {msg.imagem && (
                      <div style={{ marginTop: "5px" }}>
                        {getImageUrl(msg.imagem) ? (
                          <img
                            src={getImageUrl(msg.imagem)}
                            alt="Imagem da mensagem"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "200px",
                              borderRadius: 6,
                              cursor: "pointer",
                              display: "block",
                            }}
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
                      style={{
                        fontSize: "0.8em",
                        color: "#888",
                        marginTop: "4px",
                        textAlign: "right",
                      }}
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
                <SubmitButton
                  text="Enviar"
                  type="submit"
                  disabled={sendingMessage}
                />
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
