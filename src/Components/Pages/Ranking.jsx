import { useContext, useEffect } from "react";
import { RankingContext } from "../../contexts/RankingProvider";
import RankingCard from "../Cards/RankingCard";
import styles from "./Ranking.module.css";

const RankingJogadores = () => {
  const { ranking, loading, fetchRanking } = useContext(RankingContext);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  if (loading) {
    return <p>Carregando ranking...</p>;
  }

  return (
    <div className={styles.project_container}>
      <div className={styles.grand_title_container}>
        <h1 className={styles.grand_title}>Ranking</h1>
      </div>
      <div className={styles.ranking_flex}>
        <div className={styles.ranking_box}>
          <div className={styles.tittle_container}>
            <h2>HiLo</h2>
          </div>
          <div className={styles.ranking_list}>
            {ranking.HiLo.slice(0, 10).map((user, index) => (
              <RankingCard
                key={`hilo-${user.id}`}
                name={user.name}
                pontuacao={Number(user.total_pontuacao)}
                position={index + 1}
              />
            ))}
          </div>
        </div>
        <div className={styles.ranking_box}>
          <div className={styles.tittle_container}>
            <h2>BlackJack</h2>
          </div>
          <div className={styles.ranking_list}>
            {ranking.BlackJack.slice(0, 10).map((user, index) => (
              <RankingCard
                key={`bj-${user.id}`}
                name={user.name}
                pontuacao={Number(user.total_pontuacao)}
                position={index + 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingJogadores;
