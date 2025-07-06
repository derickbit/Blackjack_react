import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom"; // 1. Importe o useLocation
import toalhaVerde from "../assets/toalhaVerde.png";

const ParallaxBackground = () => {
  const imgRef = useRef(null);
  const parallaxInstance = useRef(null);
  const location = useLocation(); // 2. Obtenha o objeto de localização atual

  useEffect(() => {
    // Esta função será executada toda vez que a 'location' mudar
    const initParallax = () => {
      if (imgRef.current && window.simpleParallax) {
        // Destruímos a instância anterior ANTES de criar uma nova.
        // O React executa a limpeza do efeito anterior antes de executar o novo.
        if (parallaxInstance.current) {
          parallaxInstance.current.destroy();
        }

        // Criamos a nova instância com a opção 'overflow'
        parallaxInstance.current = new window.simpleParallax(imgRef.current, {
          scale: 1.2,
          delay: 0.4,
          transition: "cubic-bezier(0,0,0,1)",
          orientation: "up",
          overflow: true, // 3. FORÇA a ativação do efeito
        });
      }
    };

    initParallax();

    // A função de limpeza continua crucial
    return () => {
      if (parallaxInstance.current) {
        parallaxInstance.current.destroy();
      }
    };
  }, [location]); // 4. O segredo: O array de dependência com 'location'

  return (
    <img
      ref={imgRef}
      src={toalhaVerde}
      alt="Fundo Parallax"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        objectFit: "cover",
        zIndex: -1,
        pointerEvents: "none",
      }}
      className="parallax-bg"
    />
  );
};

export default ParallaxBackground;
