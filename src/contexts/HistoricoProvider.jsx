import React, { createContext, useContext, useState, useCallback } from "react";
import axiosClient from "../utils/axios_client";
import { useAuthContext } from "./AuthProvider";
import { RankingContext } from "./RankingProvider";

const HistoricoContext = createContext();

export const useHistorico = () => {
  return useContext(HistoricoContext);
};

export const HistoricoProvider = ({ children }) => {
  const { user } = useAuthContext(); // Obtém o usuário autenticado
  const { fetchRanking } = useContext(RankingContext);
  const [mensagem, setMensagem] = useState("");
  const [historico, setHistorico] = useState([]); // Estado para armazenar o histórico de partidas

  // Simular uma partida
  const sortearPartida = async () => {
    if (!user || !user.id) {
      setMensagem("Erro: Usuário autenticado não encontrado.");
      return;
    }

    try {
      // Faz a requisição para simular a partida
      const response = await axiosClient.post(
        "/partidas/simular",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMensagem(response.data.message || "Partida registrada com sucesso!");

      // Atualiza o histórico após a nova partida ser criada
      await fetchHistoricoPartidas();
      // Atualiza o ranking após a nova partida ser criada
      await fetchRanking();
    } catch (error) {
      console.error("Erro ao sortear partida:", error);
      setMensagem(
        error.response?.data?.message || "Erro ao sortear a partida."
      );
    }
  };

  // Buscar histórico de partidas do usuário autenticado
  const fetchHistoricoPartidas = useCallback(async () => {
    if (!user || !user.id) {
      console.warn("Erro: Usuário autenticado não encontrado.");
      return;
    }

    try {
      const response = await axiosClient.get("/partidas/user"); //request da função showByUser criada em PartidaController

      console.log("Resposta do servidor:", response.data);

      // Formata o histórico de partidas
      const partidasFormatadas = response.data.data.map((partida) => ({
        id: partida.id,
        jogador: partida.jogador.name,
        jogo: partida.jogo || "Desconhecido",
        pontuacao: partida.pontuacao,
        created_at: partida.created_at,
      }));

      setHistorico(partidasFormatadas);
    } catch (error) {
      console.error("Erro ao buscar histórico de partidas:", error);
    }
  }, [user]);

  return (
    <HistoricoContext.Provider
      value={{ mensagem, sortearPartida, fetchHistoricoPartidas, historico }}
    >
      {children}
    </HistoricoContext.Provider>
  );
};
