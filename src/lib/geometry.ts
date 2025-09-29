export type Pt = { x: number; y: number };

const EPS = 1e-9;

export const geom = {
  sub: (a: Pt, b: Pt): Pt => ({ x: a.x - b.x, y: a.y - b.y }),
  len2: (p: Pt) => p.x * p.x + p.y * p.y,
  dist2: (a: Pt, b: Pt) => {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
  },
  onSeg: (p: Pt, a: Pt, b: Pt) => {
    const cross = (p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y);
    if (Math.abs(cross) > EPS) return false;
    const dot = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
    if (dot < -EPS) return false;
    return dot <= geom.len2(geom.sub(b, a)) + EPS;
  },
  inPoly: (poly: Pt[], p: Pt) => {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      if (geom.onSeg(p, a, b)) return true;
    }
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = [poly[i].x, poly[i].y];
      const [xj, yj] = [poly[j].x, poly[j].y];
      const hit = (yi > p.y) !== (yj > p.y) &&
                  p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi;
      if (hit) inside = !inside;
    }
    return inside;
  },
  closestOnSeg: (a: Pt, b: Pt, p: Pt) => {
    const ab = geom.sub(b, a);
    const t = ((p.x - a.x) * ab.x + (p.y - a.y) * ab.y) / geom.len2(ab);
    const tClamped = Math.max(0, Math.min(1, t));
    return { x: a.x + ab.x * tClamped, y: a.y + ab.y * tClamped };
  },
  closestInPoly: (poly: Pt[], p: Pt) => {
    if (!poly.length) return p;
    if (geom.inPoly(poly, p)) return p;
    let best = poly[0], bestD = Infinity;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const q = geom.closestOnSeg(a, b, p);
      const d = geom.dist2(q, p);
      if (d < bestD) { bestD = d; best = q; }
    }
    return best;
  }
};
