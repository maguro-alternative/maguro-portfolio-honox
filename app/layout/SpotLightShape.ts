export function drawSpotLight(
  context: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
    // 1個目の円
    const dx: number = w / 3 + (w / 10) * Math.sin(Date.now() / 4000);
    const dy1: number = h / 3;
    const size1: number = w / 2;
    drawCircle(context, dx, dy1, size1, "rgba(255, 255, 255, 0.3)");

    // 2個目の円
    const dx2: number = (w * 3) / 4 + (w / 15) * Math.cos(Date.now() / 10000);
    const dy2: number = (h * 2) / 3;
    const size2: number = w / 3;
    drawCircle(context, dx2, dy2, size2, "rgba(255, 255, 255, 0.1)");
}

function drawCircle(
    context: CanvasRenderingContext2D,
    dx: number,
    dy: number,
    size: number,
    color: string
): void {
    // グラデーションの指定
    const gradient: CanvasGradient = context.createRadialGradient(dx, dy, 0, dx, dy, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    // 円を描く
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(dx, dy, size, 0, Math.PI * 2);
    context.closePath();
    context.fill();
}
