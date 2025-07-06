import { createContext, useState, useEffect, useCallback } from "react";
import axiosClient from "../utils/axios_client";

// eslint-disable-next-line react-refresh/only-export-components
export const RankingContext = createContext();

export const RankingProvider = ({ children }) => {
  const [ranking, setRanking] = useState({ HiLo: [], BlackJack: [] });
  const [loading, setLoading] = useState(true);

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/partidas/ranking");
      setRanking({
        HiLo: response.data.HiLo || [],
        BlackJack: response.data.BlackJack || [],
      });
    } catch (error) {
      console.error("Erro ao buscar o ranking:", error);
      setRanking({ HiLo: [], BlackJack: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  return (
    <RankingContext.Provider value={{ ranking, loading, fetchRanking }}>
      {children}
    </RankingContext.Provider>
  );
};
