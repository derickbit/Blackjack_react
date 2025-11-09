import { useState, useEffect } from "react";
import styles from "./RankingCard.module.css";
import PropTypes from "prop-types";
import axiosClient from "../../utils/axios_client";

function RankingCard({ name, pontuacao, position, userId, gameType }) {
  const [expanded, setExpanded] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Define a classe adicional baseada na posição
  const positionClass =
    position === 1
      ? styles.gold
      : position === 2
      ? styles.silver
      : position === 3
      ? styles.bronze
      : styles.default;

  const fetchHistorico = async () => {
    setLoading(true);
    setError("");
    try {
      // Busca todas as partidas e filtra pelo usuário e jogo
      const response = await axiosClient.get("/partidas");
      const todasPartidas = response.data.data || [];

      // Filtra as partidas do usuário específico e do jogo específico
      // O campo é 'jogador', não 'user_id'
      const partidasUsuario = todasPartidas.filter(
        (partida) => partida.jogador === userId && partida.jogo === gameType
      );

      // Pegar as 5 partidas mais recentes
      setHistorico(partidasUsuario.slice(-5).reverse());
    } catch (err) {
      setError("Erro ao carregar histórico");
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (expanded && historico.length === 0) {
      fetchHistorico();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  return (
    <div
      className={`${styles.ranking_card} ${positionClass} ${
        expanded ? styles.expanded : ""
      }`}
      onClick={handleClick}
    >
      <div>
        <h4>{name}</h4>
        <p>
          <span>Pontuação:</span> {pontuacao}
        </p>
      </div>

      {expanded && (
        <div
          className={styles.history_dropdown}
          onClick={(e) => e.stopPropagation()}
        >
          <h5 className={styles.history_title}>Últimas 5 partidas:</h5>
          {loading && <p className={styles.loading_text}>Carregando...</p>}
          {error && <p className={styles.error_text}>{error}</p>}
          {!loading && !error && historico.length === 0 && (
            <p className={styles.no_matches_text}>Nenhuma partida</p>
          )}
          {!loading && !error && historico.length > 0 && (
            <div className={styles.history_list}>
              {historico.map((partida) => (
                <div key={partida.codpartida} className={styles.history_item}>
                  <span className={styles.history_item_date}>
                    {new Date(partida.created_at).toLocaleDateString("pt-BR")} -{" "}
                    {new Date(partida.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className={styles.history_item_score}>
                    ⭐ {partida.pontuacao} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

RankingCard.propTypes = {
  name: PropTypes.string.isRequired,
  pontuacao: PropTypes.number.isRequired,
  position: PropTypes.number.isRequired,
  userId: PropTypes.number.isRequired,
  gameType: PropTypes.string.isRequired,
};

export default RankingCard;
