import React, { useEffect, useRef } from "react";
import toalhaVerde from "../assets/toalhaVerde.png";

const ParallaxBackground = () => {
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && window.simpleParallax) {
      new window.simpleParallax(imgRef.current, {
        scale: 1.2,
        delay: 0.4,
        transition: "cubic-bezier(0,0,0,1)",
        orientation: "up",
      });
    }
  }, []);

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
