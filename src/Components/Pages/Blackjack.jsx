// Blackjack.js
import { useState, useEffect, useRef } from "react";
// Usando o styles do HiLo como placeholder
import styles from "./hiLo.module.css";
import SubmitButton from "../Form/SubmitButton";
import { useAuthContext } from "../../contexts/AuthProvider";
import axiosClient from "../../utils/axios_client.js";

// ========================================
// TRAVA GLOBAL - SOBREVIVE AO STRICT MODE
// ========================================
let globalUnityInstance = null;
let isCreatingInstance = false;
let globalScriptTag = null;
let mountCount = 0; // << NOVO: Conta quantas vezes o componente montou

function getCanvasSize() {
  const maxW = Math.min(window.innerWidth, 392);
  const w = maxW;
  const h = Math.round((w * 592) / 392);
  return { width: w, height: h };
}

function Blackjack() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [canvasSize, setCanvasSize] = useState(getCanvasSize());
  const canvasRef = useRef(null);
  const unityInstanceRef = useRef(null);
  const scriptRef = useRef(null); // Referência para o script

  // --- MANTIDO: LÓGICA DO BOTÃO INICIAR (do seu HiLo.js) ---
  const handleStartGame = () => {
    // << MODIFICADO: Usa a ref global >>
    const instance = globalUnityInstance || unityInstanceRef.current;
    if (instance) {
      // << MODIFICADO >>
      // Chama o método "BeginGame" no GameObject "GameManager" na Unity
      instance.SendMessage("GameManager", "BeginGame");

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

  // << Efeito da API (Recebimento de pontuação) >>
  useEffect(() => {
    window.handleBlackjackScore = (score) => {
      if (!user || !user.id) {
        console.error("React: Usuário não logado. Pontuação não será salva.");
        return;
      }
      console.log(`React: Recebi a pontuação ${score} da Unity. Enviando...`);
      const payload = {
        jogador: user.id,
        jogo: "BlackJack", // << NOME MUDADO
        pontuacao: parseInt(score), // Garantir que é inteiro
      };
      console.log("React: Payload completo:", payload);
      console.log("React: Tipo do user.id:", typeof user.id, "Valor:", user.id);
      console.log(
        "React: Tipo da pontuacao:",
        typeof payload.pontuacao,
        "Valor:",
        payload.pontuacao
      );

      axiosClient
        .post("/partidas", payload)
        .then((response) => {
          console.log("React: Partida salva com sucesso!", response.data);
        })
        .catch((error) => {
          console.error("React: Erro ao salvar a partida.", error);
          console.error("React: Detalhes do erro:", error.response?.data);
          console.error("React: Status do erro:", error.response?.status);
        });
    };

    return () => {
      delete window.handleBlackjackScore;
    };
  }, [user]);

  // << EFEITO ÚNICO DE CARREGAMENTO (À PROVA DE STRICT MODE) >>
  useEffect(() => {
    mountCount++; // Incrementa o contador
    const currentMount = mountCount;
    console.log(`REACT: useEffect INICIADO (montagem #${currentMount})`);

    // ========================================
    // TRAVA #1: JÁ EXISTE UMA INSTÂNCIA GLOBAL
    // ========================================
    if (globalUnityInstance) {
      console.log(
        `✅ REACT (#${currentMount}): Instância global JÁ EXISTE. Reutilizando e ABORTANDO criação.`
      );
      unityInstanceRef.current = globalUnityInstance;
      setLoadingProgress(100);
      return; // ABORTA (sem cleanup)
    }

    // ========================================
    // TRAVA #2: JÁ ESTÁ CRIANDO UMA INSTÂNCIA
    // ========================================
    if (isCreatingInstance) {
      console.log(
        `⏳ REACT (#${currentMount}): JÁ ESTÁ CRIANDO. ABORTANDO criação duplicada.`
      );
      return; // ABORTA (sem cleanup)
    }

    // ========================================
    // TRAVA #3: SÓ A PRIMEIRA MONTAGEM CRIA
    // ========================================
    if (currentMount > 1) {
      console.log(
        `🛑 REACT (#${currentMount}): NÃO É A PRIMEIRA MONTAGEM. ABORTANDO.`
      );
      return; // ABORTA (sem cleanup)
    }

    // Se chegou aqui, pode criar a instância!
    console.log(`🚀 REACT (#${currentMount}): CRIANDO instância Unity...`);
    isCreatingInstance = true;

    const originalQuerySelector = document.querySelector;
    document.querySelector = function (selector) {
      if (selector === "#") {
        console.warn("HACK: querySelector('#') interceptado.");
        return canvasRef.current;
      }
      return originalQuerySelector.apply(this, arguments);
    };

    let script = document.createElement("script");
    script.src = "/game_blackjack/Build/game_blackjack.loader.js";
    scriptRef.current = script;
    globalScriptTag = script;

    script.onload = () => {
      if (!canvasRef.current) {
        console.log(`⚠️ REACT (#${currentMount}): Canvas sumiu. Abortando.`);
        document.querySelector = originalQuerySelector;
        isCreatingInstance = false;
        return;
      }

      window
        .createUnityInstance(
          canvasRef.current,
          {
            dataUrl: "/game_blackjack/Build/game_blackjack.data",
            frameworkUrl: "/game_blackjack/Build/game_blackjack.framework.js",
            codeUrl: "/game_blackjack/Build/game_blackjack.wasm",
            companyName: "CardNest",
            productName: "Blackjack",
            productVersion: "1.0",
          },
          (progress) => {
            setLoadingProgress(Math.round(progress * 100));
          }
        )
        .then((instance) => {
          if (!canvasRef.current) {
            console.log(
              `⚠️ REACT (#${currentMount}): Canvas sumiu após criação. Encerrando.`
            );
            instance.Quit();
            document.querySelector = originalQuerySelector;
            isCreatingInstance = false;
            return;
          }

          console.log(`✅ REACT (#${currentMount}): Instância Unity CRIADA!`);
          unityInstanceRef.current = instance;
          globalUnityInstance = instance;
          isCreatingInstance = false;
          document.querySelector = originalQuerySelector;
        })
        .catch((message) => {
          console.error(`❌ REACT (#${currentMount}): Erro:`, message);
          alert(message);
          document.querySelector = originalQuerySelector;
          isCreatingInstance = false;
        });
    };

    document.body.appendChild(script);

    // << CLEANUP: NUNCA LIMPA AS VARIÁVEIS GLOBAIS AQUI >>
    return () => {
      console.log(
        `🗑️ REACT (#${currentMount}): CLEANUP chamado (Strict Mode ou desmontagem real).`
      );
      document.querySelector = originalQuerySelector;

      // NÃO limpa globalUnityInstance aqui!
      // NÃO limpa globalScriptTag aqui!
      // NÃO limpa mountCount aqui!
      // Tudo isso sobrevive ao Strict Mode.

      // Só limpamos quando o COMPONENTE PAI desmontar (ex: navegação para outra página)
    };
  }, []);

  // << USEEFFECT SEPARADO: Limpeza real quando o componente REALMENTE desmonta >>
  useEffect(() => {
    // Marca que o componente foi "realmente" montado (não é Strict Mode)
    const cleanupTimer = setTimeout(() => {
      console.log(
        "⏰ REACT: Componente REALMENTE montado (não é mais Strict Mode)."
      );
    }, 100);

    return () => {
      clearTimeout(cleanupTimer);

      // Só limpa se já passou tempo suficiente (não é Strict Mode)
      // No Strict Mode, o cleanup é instantâneo (< 10ms)
      // Na desmontagem real, já passou tempo
      const now = Date.now();
      const timeSinceMount = now - (window.__blackjackMountTime || now);

      if (timeSinceMount > 100) {
        // Desmontagem REAL (usuário saiu da página)
        console.log("🗑️ REACT: DESMONTAGEM REAL. Limpando tudo...");

        if (globalUnityInstance) {
          globalUnityInstance.Quit().then(() => {
            console.log("✅ REACT: Unity destruído.");
          });
          globalUnityInstance = null;
        }

        if (globalScriptTag && document.body.contains(globalScriptTag)) {
          document.body.removeChild(globalScriptTag);
          globalScriptTag = null;
        }

        if (window.handleBlackjackScore) {
          delete window.handleBlackjackScore;
        }

        isCreatingInstance = false;
        mountCount = 0;
        delete window.__blackjackMountTime;
      } else {
        // Strict Mode (cleanup rápido)
        console.log(
          "⚡ REACT: Cleanup rápido (Strict Mode). Não limpando variáveis globais."
        );
      }
    };
  }, []);

  // << Marca o tempo de montagem >>
  useEffect(() => {
    window.__blackjackMountTime = Date.now();
  }, []);
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
              // << BOTÃO INICIAR MANTIDO (A CHAVE DE TUDO) >>
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
        id="canvasBlackjack" // << ID Diferente
        ref={canvasRef}
        className={styles.unity_canvas}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{
          display: loading ? "none" : "block", // << Lógica mantida
          width: canvasSize.width,
          height: canvasSize.height,
          background: "#111",
        }}
        tabIndex="1"
      />
    </div>
  );
}

export default Blackjack;
