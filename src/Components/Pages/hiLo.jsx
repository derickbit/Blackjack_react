import { useState, useEffect, useRef } from "react";
import styles from "./hiLo.module.css";
import SubmitButton from "../Form/SubmitButton";
import { useAuthContext } from "../../contexts/AuthProvider";
import axiosClient from "../../utils/axios_client.js";

function getCanvasSize() {
  const maxW = Math.min(window.innerWidth, 392);
  const w = maxW;
  const h = Math.round((w * 592) / 392);
  return { width: w, height: h };
}

function HiLo() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState(getCanvasSize());
  const canvasRef = useRef(null);
  const unityInstanceRef = useRef(null);

  // --- NOVA FUNÇÃO PARA INICIAR O JOGO ---
  const handleStartGame = () => {
    if (unityInstanceRef.current) {
      // Chama o método "BeginIntro" no GameObject "Settings" (ou o nome que você usa) na Unity
      unityInstanceRef.current.SendMessage("Settings", "BeginIntro");
      // Esconde a tela de carregamento/iniciar
      setLoading(false);
    }
  };

  useEffect(() => {
    function handleResize() {
      setCanvasSize(getCanvasSize());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.handleHiLoScore = (score) => {
      if (!user || !user.id) {
        console.error(
          "React: Usuário não está logado. Não é possível salvar a pontuação."
        );
        return;
      }
      console.log(
        `React: Recebi a pontuação ${score} da Unity. Enviando para o backend...`
      );
      const payload = {
        jogador: user.id,
        jogo: "HiLo",
        pontuacao: score,
      };
      axiosClient
        .post("/partidas", payload)
        .then((response) => {
          console.log("React: Partida salva com sucesso!", response.data);
        })
        .catch((error) => {
          console.error("React: Erro ao salvar a partida.", error.response);
        });
    };
    return () => {
      delete window.handleHiLoScore;
    };
  }, [user]);

  useEffect(() => {
    const originalQuerySelector = document.querySelector;
    document.querySelector = function (selector) {
      if (selector === "#") {
        console.warn(
          "HACK: Interceptada chamada bugada querySelector('#'). Retornando o canvas do jogo."
        );
        return canvasRef.current;
      }
      return originalQuerySelector.apply(this, arguments);
    };

    let script = document.createElement("script");
    script.src = "/game/Build/build HILO.loader.js"; // Verifique se o nome do build está correto
    script.onload = () => {
      window
        .createUnityInstance(
          canvasRef.current,
          {
            dataUrl: "/game/Build/build HILO.data",
            frameworkUrl: "/game/Build/build HILO.framework.js",
            codeUrl: "/game/Build/build HILO.wasm",
            companyName: "Blackjack 2025",
            productName: "HiLo Game",
            productVersion: "2.0",
          },
          (progress) => {
            setLoadingProgress(Math.round(progress * 100));
          }
        )
        .then((instance) => {
          unityInstanceRef.current = instance;
          document.querySelector = originalQuerySelector;
        })
        .catch((message) => {
          alert(message);
          document.querySelector = originalQuerySelector;
        });
    };
    document.body.appendChild(script);

    return () => {
      document.querySelector = originalQuerySelector;
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit();
      }
      if (script && document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []); // Este useEffect de carregamento deve rodar apenas uma vez

  return (
    <div className={styles.game_container}>
      {loading && (
        <div className={styles.loading_overlay}>
          <div className={styles.loading_box}>
            {loadingProgress < 100 ? (
              <>
                <p>Carregando o jogo...</p>
                <div className={styles.progress_bar_container}>
                  <div
                    className={styles.progress_bar_fill}
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p>{loadingProgress}%</p>
              </>
            ) : (
              // Usando o botão padrão do site
              <SubmitButton
                text="Iniciar Jogo"
                onClick={handleStartGame}
                className={styles.start_button}
              />
            )}
          </div>
        </div>
      )}
      <canvas
        id="canvas"
        ref={canvasRef}
        className={styles.unity_canvas}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          display: loading ? "none" : "block",
          width: canvasSize.width,
          height: canvasSize.height,
          background: "#111",
        }}
        tabIndex="1"
      />
    </div>
  );
}

export default HiLo;
