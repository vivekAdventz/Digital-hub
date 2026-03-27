import { useEffect, useRef } from "react";

export default function CircuitCanvas({ powerUp = false }) {
  const canvasRef = useRef(null);
  const pulsesRef = useRef([]);
  const powerRef = useRef(powerUp);

  useEffect(() => { powerRef.current = powerUp; }, [powerUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const spacing = 65;
    let animId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw() {
      const w = canvas.width, h = canvas.height;
      const isPow = powerRef.current;
      ctx.clearRect(0, 0, w, h);

      ctx.beginPath();
      ctx.strokeStyle = isPow ? "rgba(27,58,139,0.15)" : "rgba(27,58,139,0.04)";
      ctx.lineWidth = isPow ? 2 : 1;
      for (let i = 0; i < w / spacing; i++) { ctx.moveTo(i * spacing, 0); ctx.lineTo(i * spacing, h); }
      for (let j = 0; j < h / spacing; j++) { ctx.moveTo(0, j * spacing); ctx.lineTo(w, j * spacing); }
      ctx.stroke();

      if (Math.random() < (isPow ? 0.4 : 0.08) && pulsesRef.current.length < 100) {
        pulsesRef.current.push({
          x: Math.floor(Math.random() * (w / spacing)) * spacing,
          y: Math.floor(Math.random() * (h / spacing)) * spacing,
          len: Math.random() * 3 + 1,
          speed: (Math.random() * 0.15 + 0.05) * (isPow ? 4 : 1),
          dir: Math.random() < 0.5 ? "h" : "v",
          progress: 0,
        });
      }

      const pulses = pulsesRef.current;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.progress += p.speed;
        if (p.progress > p.len + 1) { pulses.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.strokeStyle = "#ff7d20";
        ctx.lineWidth = isPow ? 3 : 2;
        ctx.lineCap = "round";
        const head = p.progress, tail = Math.max(0, p.progress - 0.5);
        if (p.dir === "h") { ctx.moveTo(p.x + tail * spacing, p.y); ctx.lineTo(p.x + head * spacing, p.y); }
        else { ctx.moveTo(p.x, p.y + tail * spacing); ctx.lineTo(p.x, p.y + head * spacing); }
        ctx.stroke();
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: powerUp ? 0.8 : 0.35, transition: "opacity 0.5s ease" }}
    />
  );
}
