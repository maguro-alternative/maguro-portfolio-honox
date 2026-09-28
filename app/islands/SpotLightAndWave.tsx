import { drawWave } from "../layout/WaveShape";
import { drawSpotLight } from "../layout/SpotLightShape";
import { useEffect, useRef } from "hono/jsx";

// 波は半透明の塗りを重ねて残像を作るので、静止描画でも数フレーム回さないと見た目が定常状態にならない
const STILL_WARMUP_FRAMES = 30;

export default function SpotlightAndWave() {
  const canvasWaveRef = useRef<HTMLCanvasElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasWave = canvasWaveRef.current;
    const canvasOverlay = canvasOverlayRef.current;
    const contextWave = canvasWave?.getContext("2d");
    const contextOverlay = canvasOverlay?.getContext("2d");
    if (!canvasWave || !canvasOverlay || !contextWave || !contextOverlay) return;

    const draw = () => {
      contextWave.fillStyle = "rgba(0, 0, 0, 0.2)";
      contextWave.fillRect(0, 0, canvasWave.width, canvasWave.height);
      drawWave(contextWave, canvasWave.width, canvasWave.height);

      contextOverlay.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
      drawSpotLight(contextOverlay, canvasOverlay.width, canvasOverlay.height);
      contextOverlay.globalCompositeOperation = "lighter";
      contextOverlay.drawImage(canvasWave, 0, 0);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frameId = 0;

    const drawStill = () => {
      for (let i = 0; i < STILL_WARMUP_FRAMES; i++) draw();
    };
    const loop = () => {
      draw();
      frameId = requestAnimationFrame(loop);
    };
    const sync = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (reducedMotion.matches) {
        drawStill();
      } else {
        frameId = requestAnimationFrame(loop);
      }
    };

    const resize = () => {
      canvasWave.width = canvasOverlay.width = window.innerWidth;
      canvasWave.height = canvasOverlay.height = window.innerHeight;
      // canvas はサイズ変更で消えるので、止まっている間も描き直す
      if (!frameId) drawStill();
    };

    resize();
    sync();
    window.addEventListener("resize", resize);
    reducedMotion.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      reducedMotion.removeEventListener("change", sync);
    };
  }, []);

  const canvasStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%" };

  return (
    <div>
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
    </div>
  );
};
