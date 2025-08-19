import { drawWave } from "../layout/WaveShape";
import { drawSpotLight } from "../layout/SpotLightShape";
import { useRef, useSyncExternalStore, type RefObject } from "hono/jsx";

const isClient = typeof window !== 'undefined';

function resizeSubscribe(callback: () => void) {
  if (!isClient) {
    return () => {};
  }
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function useResizeEffect() {
  const getSnapshot = () => {
    return {
      width: isClient ? window.innerWidth : 0,
      height: isClient ? window.innerHeight : 0,
    };
  };

  const getServerSnapshot = () => {
    return {
      width: 0,
      height: 0,
    };
  };

  return useSyncExternalStore(resizeSubscribe, getSnapshot, getServerSnapshot);
}

function canvasSpotligth(
  width: number,
  height: number,
  canvasWaveRef: RefObject<HTMLCanvasElement>,
  canvasOverlayRef: RefObject<HTMLCanvasElement>
) {
  const canvasWave = canvasWaveRef.current;
  const canvasOverlay = canvasOverlayRef.current;

  if (!canvasWave || !canvasOverlay) return;

  const contextWave = canvasWave.getContext("2d");
  const contextOverlay = canvasOverlay.getContext("2d");

  if (!contextWave || !contextOverlay) return;

  canvasWave.width = width;
  canvasWave.height = height;
  canvasOverlay.width = width;
  canvasOverlay.height = height;

  if (width === 0 || height === 0) {
    return;
  }

  let animationFrameId: number;
  const tick = () => {
    animationFrameId = requestAnimationFrame(tick);

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
    cancelAnimationFrame(animationFrameId);
  };
}

export default function SpotlightAndWave() {
  const canvasWaveRef = useRef<HTMLCanvasElement>(null);
  const canvasOverlayRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = useResizeEffect();

  canvasSpotligth(width, height, canvasWaveRef, canvasOverlayRef)
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
