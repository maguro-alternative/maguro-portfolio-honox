import { noise } from "./lib/perlin";

noise.seed(Math.random());

export function drawWave(
  context: CanvasRenderingContext2D,
  w: number,
  h: number,
  vertexNum: number = 10,
  maxVertex: number = 5,
  debugMode: boolean = false
): void {
  // 曲線を描き直す
  for (let i = 0; i < vertexNum; i++) {
      // デバッグ機能が有効の場合は線を1pxで描く
      const strokeSize: number = debugMode ? 1.0 : 0.05 * i + 0.1; // ゼロ対策

      const timeOffset: number = i * 0.1;
      const time: number = Date.now() / 5000;

      // 線のスタイルを設定
      context.beginPath();
      context.strokeStyle = "white";
      context.lineWidth = strokeSize;

      const vertexArr: number[] = [];
      // 波の次の目標値を計算
      for (let j = 0; j <= vertexNum; j++) {
          const noiseNum: number = noise.perlin2(j * 0.2, time + timeOffset);
          // 目標座標を計算。画面の高さに比例
          vertexArr[j] = noiseNum * h * 0.5;
      }

      const BASE_Y: number = h / 2; // 画面中央のY座標
      const points: { x: number; y: number }[] = [];
      // 画面左端の座標
      points.push({ x: -200, y: BASE_Y });
      for (let j = 0; j <= vertexNum; j++) {
          points.push({
              x: (w * (j / vertexNum)) >> 0,
              y: vertexArr[j] + BASE_Y,
          });
      }
      // 画面右端の座標
      points.push({ x: w + 200, y: BASE_Y });

      // 直線情報を曲線にするテクニック
      for (let j = 0; j < points.length; j++) {
          if (j < 2) {
              continue;
          }
          const p0x: number = points[j].x;
          const p0y: number = points[j].y;
          const p1x: number = points[j - 1].x;
          const p1y: number = points[j - 1].y;
          const p2x: number = points[j - 2].x;
          const p2y: number = points[j - 2].y;

          const curveStartX: number = (p2x + p1x) / 2;
          const curveStartY: number = (p2y + p1y) / 2;
          const curveEndX: number = (p0x + p1x) / 2;
          const curveEndY: number = (p0y + p1y) / 2;

          // カーブは中間点を結び、p1を制御点として扱う
          context.moveTo(curveStartX, curveStartY);
          context.quadraticCurveTo(p1x, p1y, curveEndX, curveEndY);
      }
      context.stroke();

      // デバッグ機能：曲線の元になっている頂点を可視化
      if (debugMode) {
          drawDebugView(context, points);
      }
  }
}

function drawDebugView(
    context: CanvasRenderingContext2D,
    points: { x: number; y: number }[]
): void {
    for (let i = 0; i < points.length; i++) {
        const p0x: number = points[i].x;
        const p0y: number = points[i].y;
        if (i > 0) {
            const p1x: number = points[i - 1].x;
            const p1y: number = points[i - 1].y;
            context.beginPath();
            context.strokeStyle = "red";
            context.lineWidth = 0.5;
            context.moveTo(p1x, p1y);
            context.lineTo(p0x, p0y);
            context.stroke();
        }
        context.beginPath();
        context.fillStyle = "red";
        context.arc(p0x, p0y, 3, 0, 2 * Math.PI);
        context.fill();
    }
}
