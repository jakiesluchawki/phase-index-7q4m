"use client";

import { useEffect, useRef } from "react";
import type {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

type FieldCanvasProps = {
  mode: number;
  xray: boolean;
};

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform float uTime;
  uniform float uMode;
  uniform float uScroll;
  uniform float uXray;
  uniform float uAspect;
  uniform vec2 uPointer;

  float stroke(float value, float width) {
    return 1.0 - smoothstep(0.0, width, abs(value));
  }

  float circle(vec2 p, float radius, float width) {
    return stroke(length(p) - radius, width);
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;

    vec2 pointer = uPointer - 0.5;
    pointer.x *= uAspect;
    float pointerPull = exp(-4.5 * length(p - pointer));
    float pointerDistance = length(p - pointer);
    float phase = uTime * 0.10 + uMode * 0.67;

    float field =
      sin(p.x * (3.2 + uMode * 0.32) + phase) * 0.105 +
      cos(p.y * (4.8 - uMode * 0.21) - phase * 0.7) * 0.075;

    vec2 q = p;
    q.y += field + pointerPull * (pointer.y - p.y) * 0.075;
    q.x += sin(p.y * 2.2 + phase) * 0.028;

    float flowA = stroke(sin((q.y + sin(q.x * 2.7 + phase) * 0.12) * 34.0), 0.075);
    float flowB = stroke(sin((q.x - cos(q.y * 3.1 - phase) * 0.08) * 27.0), 0.035);
    float signalA = stroke(q.y - sin(q.x * (4.2 + uMode * 0.35) + phase) * 0.12, 0.005);
    float signalB = stroke(q.y + 0.20 - sin(q.x * 5.7 - phase * 0.72) * 0.055, 0.003);
    float registration = circle(p - pointer * 0.16, 0.20 + uScroll * 0.10, 0.0035);
    registration += circle(p - pointer * 0.08, 0.37 + uMode * 0.025, 0.0020);
    float echo = stroke(sin(pointerDistance * 58.0 - uTime * 1.4), 0.075);
    echo *= exp(-2.6 * pointerDistance) * (0.34 + uXray * 0.46);
    float liquid = sin(q.x * 7.0 + sin(q.y * 4.0 - phase) * 1.8 + phase);
    liquid += cos(q.y * 8.0 - cos(q.x * 3.2 + phase) * 1.4 - phase * 0.75);
    float ribbon = smoothstep(0.34, 0.02, abs(liquid * 0.5));
    ribbon *= 0.18 + pointerPull * 0.52 + uXray * 0.2;

    float crossX = stroke(p.x - pointer.x * 0.06, 0.0015) * step(abs(p.y), 0.12);
    float crossY = stroke(p.y - pointer.y * 0.06, 0.0015) * step(abs(p.x), 0.12);

    float linework = flowA * 0.20 + flowB * 0.10 + signalA * 0.55 + signalB * 0.34 + registration * 0.38 + echo * 0.66 + ribbon * 0.58 + (crossX + crossY) * 0.22;
    linework *= 0.50 + pointerPull * 0.62;

    vec3 zgrywaGreen = vec3(0.365, 0.439, 0.357);
    vec3 zgrywaRed = vec3(0.725, 0.275, 0.275);
    vec3 zgrywaViolet = vec3(0.400, 0.400, 0.600);
    vec3 zgrywaMint = vec3(0.922, 1.000, 0.922);
    vec3 color = mix(zgrywaGreen, zgrywaRed, clamp(pointerPull * 1.15 + uScroll * 0.22, 0.0, 1.0));
    color = mix(color, zgrywaViolet, clamp(uMode / 4.0, 0.0, 0.72));
    color = mix(color, zgrywaMint, uXray * 0.76);

    float edgeFade = smoothstep(0.78, 0.14, length(p * vec2(0.72, 1.0)));
    float alpha = linework * edgeFade * mix(0.58, 0.82, uXray);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function FieldCanvas({ mode, xray }: FieldCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef(mode);
  const xrayRef = useRef(xray);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    xrayRef.current = xray;
  }, [xray]);

  useEffect(() => {
    const mount = mountRef.current;
    if (
      !mount
      || window.matchMedia("(prefers-reduced-motion: reduce)").matches
      || window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let disposed = false;
    let frame = 0;
    let renderer: WebGLRenderer | null = null;
    let scene: Scene | null = null;
    let camera: OrthographicCamera | null = null;
    let geometry: PlaneGeometry | null = null;
    let material: ShaderMaterial | null = null;
    let mesh: Mesh | null = null;
    let visible = !document.hidden;

    const pointer = { x: 0.5, y: 0.46 };
    const smoothPointer = { x: 0.5, y: 0.46 };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer.x = event.clientX / window.innerWidth;
      pointer.y = 1 - event.clientY / window.innerHeight;
    };

    const onVisibility = () => {
      visible = !document.hidden;
    };

    const setup = async () => {
      try {
        const THREE = await import("three");
        if (disposed) return;

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.1 : 1.4));
        renderer.setClearColor(0x000000, 0);
        renderer.domElement.setAttribute("aria-hidden", "true");

        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
        camera.position.z = 1;
        geometry = new THREE.PlaneGeometry(2, 2);
        material = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          vertexShader,
          fragmentShader,
          uniforms: {
            uTime: { value: 0 },
            uMode: { value: modeRef.current },
            uScroll: { value: 0 },
            uXray: { value: xrayRef.current ? 1 : 0 },
            uAspect: { value: window.innerWidth / window.innerHeight },
            uPointer: { value: new THREE.Vector2(0.5, 0.46) },
          },
        });
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        mount.appendChild(renderer.domElement);

        const resize = () => {
          if (!renderer || !material) return;
          renderer.setSize(window.innerWidth, window.innerHeight, false);
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.1 : 1.4));
          material.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
        };

        const onContextLost = () => {
          mount.dataset.webgl = "unavailable";
        };

        renderer.domElement.addEventListener("webglcontextlost", onContextLost, { once: true });
        window.addEventListener("resize", resize);
        resize();

        const started = performance.now();
        const render = (now: number) => {
          if (disposed) return;
          frame = window.requestAnimationFrame(render);
          if (!visible || !renderer || !scene || !camera || !material) return;

          smoothPointer.x += (pointer.x - smoothPointer.x) * 0.055;
          smoothPointer.y += (pointer.y - smoothPointer.y) * 0.055;

          const documentHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
          const scroll = window.scrollY / documentHeight;
          material.uniforms.uTime.value = (now - started) / 1000;
          material.uniforms.uMode.value += (modeRef.current - material.uniforms.uMode.value) * 0.035;
          material.uniforms.uScroll.value += (scroll - material.uniforms.uScroll.value) * 0.04;
          material.uniforms.uXray.value += ((xrayRef.current ? 1 : 0) - material.uniforms.uXray.value) * 0.08;
          material.uniforms.uPointer.value.set(smoothPointer.x, smoothPointer.y);
          renderer.render(scene, camera);
        };

        frame = window.requestAnimationFrame(render);
        return () => {
          window.removeEventListener("resize", resize);
          renderer?.domElement.removeEventListener("webglcontextlost", onContextLost);
        };
      } catch {
        mount.dataset.webgl = "unavailable";
      }
    };

    let detachResize: (() => void) | undefined;
    setup().then((detach) => {
      detachResize = detach;
    });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      detachResize?.();
      if (mesh && scene) scene.remove(mesh);
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return (
    <div className="field-canvas" ref={mountRef} aria-hidden="true">
      <div className="field-fallback" />
    </div>
  );
}
