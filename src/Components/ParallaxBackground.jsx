import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import backgroundClaro from "../assets/BackgroundClaro.png";

const ParallaxBackground = () => {
  const imgRef = useRef(null);
  const parallaxInstance = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const initParallax = () => {
      if (imgRef.current && window.simpleParallax) {
        if (parallaxInstance.current) {
          parallaxInstance.current.destroy();
        }

        // Configuração muito conservadora para evitar barra branca
        parallaxInstance.current = new window.simpleParallax(imgRef.current, {
          scale: 1.02, // Scale mínimo para quase nenhum movimento
          delay: 0.02, // Delay mínimo
          transition: "cubic-bezier(0,0,0,1)",
          orientation: "up",
          overflow: true,
        });
      }
    };

    initParallax();

    return () => {
      if (parallaxInstance.current) {
        parallaxInstance.current.destroy();
      }
    };
  }, [location]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        zIndex: -1,
        pointerEvents: "none",
      }}
    >
      <div
        ref={imgRef}
        style={{
          position: "absolute",
          top: "-30vh",
          left: "-15vw",
          width: "130vw",
          height: "180vh",
          backgroundImage: `url(${backgroundClaro})`,
          backgroundRepeat: "repeat",
          backgroundSize: "450px 450px", // Tamanho equilibrado para boa visibilidade mantendo proporção quadrada
          backgroundPosition: "0 0",
        }}
        className="parallax-bg"
      />
    </div>
  );
};

export default ParallaxBackground;
