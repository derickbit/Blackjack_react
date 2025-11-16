import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeProvider";
import backgroundClaro from "../assets/BackgroundClaro.png";
import backgroundEscuro from "../assets/BackgroundEscuro.png";

const ParallaxBackground = () => {
  const imgRef = useRef(null);
  const parallaxInstance = useRef(null);
  const location = useLocation();
  const { theme } = useTheme();

  // Usa BackgroundClaro no tema claro e BackgroundEscuro no tema escuro
  const backgroundImage =
    theme === "light" ? backgroundClaro : backgroundEscuro;

  useEffect(() => {
    const initParallax = () => {
      if (imgRef.current && window.simpleParallax) {
        if (parallaxInstance.current) {
          parallaxInstance.current.destroy();
        }

        // Configuração para funcionar com scroll no body/window
        parallaxInstance.current = new window.simpleParallax(imgRef.current, {
          scale: 1.02,
          delay: 0.02,
          transition: "cubic-bezier(0,0,0,1)",
          orientation: "up",
          overflow: true,
          // Não passa customContainer para usar o padrão (window)
        });
      }
    };

    // Delay maior para garantir que tudo está carregado
    const timer = setTimeout(() => {
      initParallax();
      // Força um refresh do parallax
      if (parallaxInstance.current) {
        window.dispatchEvent(new Event("resize"));
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (parallaxInstance.current) {
        parallaxInstance.current.destroy();
      }
    };
  }, [location, backgroundImage]);

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
          backgroundImage: `url(${backgroundImage})`,
          backgroundRepeat: "repeat",
          backgroundSize: "450px 450px",
          backgroundPosition: "0 0",
          transition: "background-image 0.3s ease-in-out",
        }}
        className="parallax-bg"
      />
    </div>
  );
};

export default ParallaxBackground;
