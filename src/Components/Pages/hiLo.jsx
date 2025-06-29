import { useState, useEffect, useRef } from "react";
import styles from "./hiLo.module.css";

function HiLo() {
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const canvasRef = useRef(null);
  const unityInstanceRef = useRef(null);

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

    const loaderUrl = "/game/Build/build HILO 2.loader.js";
    const config = {
      dataUrl: "/game/Build/build HILO 2.data",
      frameworkUrl: "/game/Build/build HILO 2.framework.js",
      codeUrl: "/game/Build/build HILO 2.wasm",
      companyName: "Blackjack 2025",
      productName: "HiLo Game",
      productVersion: "2.0",
    };

    const script = document.createElement("script");
    script.src = loaderUrl;
    script.onload = () => {
      window
        .createUnityInstance(canvasRef.current, config, (progress) => {
          setLoadingProgress(Math.round(progress * 100));
        })
        .then((unityInstance) => {
          setLoading(false);
          unityInstanceRef.current = unityInstance;
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
      if (
        unityInstanceRef.current &&
        typeof unityInstanceRef.current.quit === "function"
      ) {
        unityInstanceRef.current.quit();
      }
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className={styles.game_container}>
      {loading && (
        <div className={styles.loading_overlay}>
          <div className={styles.loading_box}>
            <p>Carregando o jogo...</p>
            <div className={styles.progress_bar_container}>
              <div
                className={styles.progress_bar_fill}
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p>{loadingProgress}%</p>
          </div>
        </div>
      )}
      <canvas
        id="canvas"
        ref={canvasRef}
        className={styles.unity_canvas}
        width={395}
        height={618}
        style={{ display: loading ? "none" : "block" }}
        tabIndex="1"
      />
    </div>
  );
}

export default HiLo;
