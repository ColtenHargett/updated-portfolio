"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

// Domain-warped fbm noise shaded into a slow, glowing aurora.
// The pointer gently bends the field and adds a warm bloom.
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
  float t = uTime * 0.045;

  vec2 m = (uMouse - 0.5) * vec2(uRes.x / uRes.y, 1.0);
  float md = length(p - m);
  p += (p - m) * 0.08 * exp(-md * 2.5);

  vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 - t + 5.2));
  vec2 r = vec2(fbm(p * 1.6 + 3.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p * 1.6 + 3.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.2 + 3.5 * r);

  vec3 ink = vec3(0.027, 0.027, 0.04);
  vec3 violet = vec3(0.42, 0.34, 1.0);
  vec3 iris = vec3(0.70, 0.64, 1.0);
  vec3 peach = vec3(1.0, 0.62, 0.45);
  vec3 ember = vec3(1.0, 0.40, 0.25);

  vec3 col = ink;
  col = mix(col, violet * 0.55, smoothstep(0.25, 0.85, f));
  col = mix(col, iris * 0.7, smoothstep(0.55, 0.95, length(q) * f));
  col = mix(col, peach * 0.75, smoothstep(0.62, 1.0, r.x * f * 1.6));
  col += ember * 0.18 * exp(-md * 3.2);

  // Ribbon highlight
  float band = smoothstep(0.02, 0.0, abs(f - 0.62 - 0.05 * sin(t * 6.0)));
  col += iris * band * 0.12;

  // Vignette + fade into the page at the bottom and as the user scrolls away
  float vig = smoothstep(1.25, 0.25, length((uv - vec2(0.5, 0.62)) * vec2(1.1, 1.4)));
  col *= vig;
  col = mix(ink, col, smoothstep(0.0, 0.45, uv.y));
  col = mix(col, ink, clamp(uScroll, 0.0, 1.0));

  // Dither to kill banding
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function ShaderBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    // Without a real GPU (software rasterizers, some VMs and low-end devices) animating a
    // full-screen shader would pin the CPU, so render one still frame instead.
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    const still = software || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Render below native resolution: the field is soft, so this is invisible and much cheaper.
    const scale = Math.min(window.devicePixelRatio || 1, 2) * (window.innerWidth < 768 ? 0.35 : 0.45);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = Math.max(1, Math.floor(w * scale));
      canvas.height = Math.max(1, Math.floor(h * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let mx = 0.62, my = 0.6, tmx = mx, tmy = my;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tmx = (e.clientX - r.left) / r.width;
      tmy = 1 - (e.clientY - r.top) / r.height;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(canvas);

    const start = performance.now() - 20000;
    let raf = 0;
    let lastDraw = 0;
    const draw = (now: number) => {
      const h = canvas.clientHeight || 1;
      gl.uniform1f(uTime, still ? 20 : (now - start) / 1000);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform1f(uScroll, Math.min(1, window.scrollY / h) * 0.85);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // ~30fps is plenty for a slow-moving field and halves GPU work.
      if (!visible || now - lastDraw < 32) return;
      lastDraw = now;
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      draw(now);
    };

    // Let the page finish loading before spinning up the shader.
    let cancelled = false;
    let cleanupStill = () => {};
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    idle(() => {
      if (cancelled) return;
      if (still) {
        draw(performance.now());
        // Still redraw on resize so the frame stays sharp.
        ro.disconnect();
        const ro2 = new ResizeObserver(() => {
          resize();
          draw(performance.now());
        });
        ro2.observe(canvas);
        cleanupStill = () => ro2.disconnect();
      } else {
        raf = requestAnimationFrame(frame);
      }
      canvas.dataset.ready = "true";
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanupStill();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* CSS fallback shown before (or instead of) WebGL */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_40%,rgba(139,123,255,0.28),transparent_70%),radial-gradient(40%_40%_at_30%_60%,rgba(255,154,110,0.16),transparent_70%)]" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1600ms] data-[ready=true]:opacity-100"
      />
    </div>
  );
}
