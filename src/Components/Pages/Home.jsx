// ALTERADO: Removi 'Link' pois o jogo vai carregar aqui.
import styles from "./Home.module.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthProvider";
import HiLo from "./hiLo";
import Blackjack from "./Blackjack";

function Home() {
  const { user } = useAuthContext();
  const [showHiLo, setShowHiLo] = useState(false);
  const [showBlackjack, setShowBlackjack] = useState(false);

  const handleShowHiLo = () => setShowHiLo((v) => !v);
  const handleShowBlackjack = () => setShowBlackjack((v) => !v);

  return (
    <section className={styles.home_container}>
      <h1>Bem vindo(a) ao CardNest, {user ?.name ?.split(" ")[0] || "Jogador"}!</h1>
      <h2>Escolha um jogo para começar!</h2>
      <p>
        Se preferir, leia os tutoriais na nossa{" "}
        <Link to="/sobre" className={styles.link}>
          página sobre
        </Link>
      </p>
      <div style={{ display: "flex", gap: "1em", margin: "2em 0" }}>
        <button className={styles.nav_button} onClick={handleShowHiLo}>
          {showHiLo ? "Fechar HiLo" : "Jogar HiLo"}
        </button>
        <button className={styles.nav_button} onClick={handleShowBlackjack}>
          {showBlackjack ? "Fechar Blackjack" : "Jogar Blackjack"}
        </button>
      </div>
      {/* Modais dos jogos */}
      {showHiLo && (
        <div className={`${styles.game_modal} ${styles.left}`}>
          <button
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1200,
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Fechar HiLo"
            onClick={() => setShowHiLo(false)}
          >
            ×
          </button>
          <HiLo />
        </div>
      )}
      {showBlackjack && (
        <div className={`${styles.game_modal} ${styles.right}`}>
          <button
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 1200,
              background: "#333",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Fechar Blackjack"
            onClick={() => setShowBlackjack(false)}
          >
            ×
          </button>
          <Blackjack />
        </div>
      )}
    </section>
  );
}

export default Home;
