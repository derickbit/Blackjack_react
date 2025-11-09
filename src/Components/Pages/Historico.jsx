import { useState, useEffect } from "react";
import styles from "./Historico.module.css";
import rankingStyles from "./Ranking.module.css";
import { useAuthContext } from "../../contexts/AuthProvider";
import axiosClient from "../../utils/axios_client";

const PAGE_SIZE = 10;

const HistoricoPartidas = () => {
  const { user } = useAuthContext();
  const [hilo, setHilo] = useState([]);
  const [blackjack, setBlackjack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [pageHiLo, setPageHiLo] = useState(1);
  const [pageBlackjack, setPageBlackjack] = useState(1);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setErro("");
    const fetchAll = async () => {
      try {
        const [hiloRes, bjRes] = await Promise.all([
          axiosClient.get("/partidas/user/jogo/HiLo"),
          axiosClient.get("/partidas/user/jogo/BlackJack"),
        ]);
        setHilo(hiloRes.data.data || []);
        setBlackjack(bjRes.data.data || []);
      } catch (err) {
        setErro(
          "Erro ao buscar histórico de partidas: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const renderCards = (partidas, page, setPage) => {
    const totalPages = Math.ceil(partidas.length / PAGE_SIZE);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const partidasPagina = partidas.slice().reverse().slice(start, end);

    return (
      <>
        {partidasPagina.length > 0 ? (
          <div className={styles.cardsContainer}>
            {partidasPagina.map((partida, index) => (
              <div key={partida.codpartida} className={styles.matchCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.matchNumber}>
                    <span className={styles.hashIcon}>#</span>
                    {partida.codpartida}
                  </div>
                  <div className={styles.scoreContainer}>
                    <span className={styles.scoreLabel}>Pontuação</span>
                    <span className={styles.scoreValue}>
                      {partida.pontuacao}
                    </span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.dateInfo}>
                    <span className={styles.dateIcon}>📅</span>
                    <span className={styles.dateText}>
                      {new Date(partida.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className={styles.timeInfo}>
                    <span className={styles.timeIcon}>🕐</span>
                    <span className={styles.timeText}>
                      {new Date(partida.created_at).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>
                {index === 0 && (
                  <div className={styles.recentBadge}>Mais recente</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.message}>Nenhuma partida encontrada.</p>
        )}
        {totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={styles.paginationButton}
            >
              Anterior
            </button>
            <span className={styles.paginationText}>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={styles.paginationButton}
            >
              Próxima
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={rankingStyles.project_container}>
      <div className={rankingStyles.grand_title_container}>
        <h1 className={rankingStyles.grand_title}>Histórico de Partidas</h1>
      </div>
      {loading ? (
        <p className={styles.message}>Carregando...</p>
      ) : erro ? (
        <p className={styles.message}>{erro}</p>
      ) : (
        <div className={rankingStyles.ranking_flex}>
          <div className={rankingStyles.ranking_box}>
            <div className={rankingStyles.tittle_container}>
              <h2>HiLo</h2>
            </div>
            <div className={rankingStyles.ranking_list}>
              {renderCards(hilo, pageHiLo, setPageHiLo)}
            </div>
          </div>
          <div className={rankingStyles.ranking_box}>
            <div className={rankingStyles.tittle_container}>
              <h2>BlackJack</h2>
            </div>
            <div className={rankingStyles.ranking_list}>
              {renderCards(blackjack, pageBlackjack, setPageBlackjack)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoricoPartidas;
