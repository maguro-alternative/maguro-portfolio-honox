import { drawWave } from "../layout/WaveShape";
import { drawSpotLight } from "../layout/SpotLightShape";
import { useRef, useLayoutEffect } from "hono/jsx";

export default function SpotlightAndWave() {
  const canvasWaveRef = useRef<HTMLCanvasElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvasWave = canvasWaveRef.current;
    const canvasOverlay = canvasOverlayRef.current;

    if (!canvasWave || !canvasOverlay) return;

    const contextWave = canvasWave.getContext("2d");
    const contextOverlay = canvasOverlay.getContext("2d");

    if (!contextWave || !contextOverlay) return;

    const handleResize = () => {
      canvasWave.width = window.innerWidth;
      canvasWave.height = window.innerHeight;
      canvasOverlay.width = window.innerWidth;
      canvasOverlay.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const tick = () => {
      requestAnimationFrame(tick);

      contextWave.fillStyle = "rgba(0, 0, 0, 0.2)";
      contextWave.fillRect(0, 0, canvasWave.width, canvasWave.height);

      drawWave(contextWave, canvasWave.width, canvasWave.height);

      contextOverlay.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
      drawSpotLight(contextOverlay, canvasOverlay.width, canvasOverlay.height);

      contextOverlay.globalCompositeOperation = "lighter";
      contextOverlay.drawImage(canvasWave, 0, 0);
    };

    tick();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasWaveRef, canvasOverlayRef]);

  const canvasStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%" };

  return (
    <>
        <div id="bg" style={{ ...canvasStyle, zIndex: -2, background: "linear-gradient(to bottom, hsl(145, 33%, 48%),hsl(152, 21%, 54%),hsl(175, 20%, 53%))", animation: "AnimationName 10s ease infinite" }}></div>
        <canvas
            id="canvasWave"
            ref={canvasWaveRef}
            style={{ ...canvasStyle, zIndex: -3 }}
        />
        <canvas
            id="canvasOverlay"
            ref={canvasOverlayRef}
            style={{ ...canvasStyle, zIndex: -1, mixBlendMode: "hard-light" }}
        />
    </>
  );
};
