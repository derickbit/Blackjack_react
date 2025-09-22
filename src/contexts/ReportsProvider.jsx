import { createContext, useContext, useState, useCallback } from "react";
import axiosClient from "../utils/axios_client"; // Seu cliente axios configurado
import { useAuthContext } from "./AuthProvider";
import { debugReportMessages } from "../utils/imageUtils";
import PropTypes from "prop-types";

const ReportsContext = createContext();

export default function ReportsProvider({ children }) {
  const { token } = useAuthContext();
  const [reports, setReports] = useState([]);

  // Buscar todos os reports do usuário
  const fetchReports = useCallback(async () => {
    if (!token) {
      // console.warn("fetchReports: Token não encontrado, não buscando reports.");
      setReports([]); // Limpa os reports se não há token
      return; // Importante retornar para não prosseguir sem token
    }
    try {
      const response = await axiosClient.get("/reports", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ajustado para ser mais flexível com a estrutura da resposta da API
      setReports(response.data.data || response.data || []);
    } catch (error) {
      console.error("Erro ao buscar reports:", error);
      setReports([]); // Limpa em caso de erro
    }
  }, [token]);

  const updateReportStatus = async (reportId, newStatus) => {
    if (!token)
      throw new Error("Autenticação necessária para atualizar status.");
    try {
      await axiosClient.patch(
        `/reports/${reportId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // O componente Reports.js chamará fetchReports ou loadReportsList após isso
    } catch (error) {
      console.error("Erro ao atualizar status do report:", error);
      throw error;
    }
  };

  // Criar novo report
  const createReport = async (formData) => {
    if (!token) throw new Error("Autenticação necessária para criar report.");
    try {
      await axiosClient.post("/reports", formData, {
        headers: { Authorization: `Bearer ${token}` }, // Content-Type será multipart/form-data automaticamente
      });
      await fetchReports(); // Atualiza a lista após criar (como no seu original)
    } catch (error) {
      console.error("Erro ao criar report:", error);
      throw error;
    }
  };

  // Buscar mensagens de um report
  const fetchReportMessages = async (reportId) => {
    if (!token || !reportId) {
      // Verifica se tem token e reportId
      // console.warn("fetchReportMessages: Token ou Report ID não fornecido.");
      return [];
    }
    try {
      const response = await axiosClient.get(`/reports/${reportId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ajustado para ser mais flexível e esperar 'imagem_url' do backend
      const messages = response.data.data || response.data || [];

      // Debug: Log apenas se encontrar problemas com imagens usando função especializada
      debugReportMessages(messages, reportId);

      return messages;
    } catch (error) {
      console.error(`Erro ao buscar mensagens do report ${reportId}:`, error);
      return [];
    }
  }; // Enviar mensagem em um report
  const sendReportMessage = async (reportId, formData) => {
    if (!token || !reportId)
      throw new Error("Autenticação ou ID do Report ausente.");
    try {
      await axiosClient.post(`/reports/${reportId}/messages`, formData, {
        headers: { Authorization: `Bearer ${token}` }, // Content-Type será multipart/form-data
      });
      // A atualização das mensagens no chat e da lista principal de reports
      // será tratada pelo componente Reports.js para melhor controle do estado.
      // Se você quiser que o provider também atualize a lista de reports aqui (para contadores futuros):
      // await fetchReports();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      throw error;
    }
  };

  return (
    <ReportsContext.Provider
      value={{
        reports,
        fetchReports,
        createReport,
        fetchReportMessages,
        sendReportMessage,
        updateReportStatus,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

ReportsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useReportsContext() {
  return useContext(ReportsContext);
}
