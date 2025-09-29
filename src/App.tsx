import { useEffect, useRef } from "react";
import { geom, type Pt } from "./lib/geometry";

export default function App() {
  const cvs = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    pos: { x: 300, y: 200 } as Pt,
    vel: { x: 0, y: 0 },
    target: { x: 300, y: 200 } as Pt,
    drag: false
  });

  const polys: Pt[][] = [
    [ {x:80,y:60}, {x:260,y:60}, {x:260,y:220}, {x:80,y:220} ],
    [ {x:380,y:60}, {x:560,y:60}, {x:560,y:120}, {x:480,y:120},
      {x:480,y:220}, {x:380,y:220} ],
    [ {x:80,y:320}, {x:220,y:420}, {x:40,y:440} ],
    [ {x:380,y:320}, {x:520,y:300}, {x:600,y:380},
      {x:460,y:480}, {x:340,y:420} ]
  ];

  const colors = ["#8dc33c", "#ff8c42", "#6aa0f8", "#d57cbe"];

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const fit = () => {
      const w = Math.min(window.innerWidth - 40, 760);
      const h = 520;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const rectPos = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const down = (e: MouseEvent) => {
      const p = rectPos(e);
      if (geom.dist2(p, state.current.pos) < 200) state.current.drag = true;
      state.current.target = p;
    };
    const move = (e: MouseEvent) => { state.current.target = rectPos(e); };
    const up = () => { state.current.drag = false; };

    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);

    const tick = () => {
      const s = state.current;
      const k = 0.14, damp = 0.78;
      s.vel.x = (s.vel.x + (s.target.x - s.pos.x) * k) * damp;
      s.vel.y = (s.vel.y + (s.target.y - s.pos.y) * k) * damp;
      s.pos.x += s.vel.x;
      s.pos.y += s.vel.y;

      ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      polys.forEach((poly, i) => {
        const color = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        poly.slice(1).forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.closePath();
        ctx.fillStyle = rgba(color, 0.12);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();

        const cp = geom.closestInPoly(poly, s.pos);
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = geom.inPoly(poly, s.pos) ? color : "#222";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(s.pos.x, s.pos.y);
        ctx.lineTo(cp.x, cp.y);
        ctx.setLineDash([6, 6]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#111";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("resize", fit);
      canvas.removeEventListener("mousedown", down);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <canvas
      ref={cvs}
      style={{ display: "block", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.12)", background: "#fafafa" }}
    />
  );
}

function rgba(hex: string, a = 1) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
