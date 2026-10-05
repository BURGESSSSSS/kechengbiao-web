import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

varying vec2 vUv;

// Smooth cubic Simplex-style noise for silky organic motion
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Broad, low-frequency atmospheric noise (no ripple marbling)
float smoothAtmosphere(vec2 p) {
  float v = 0.0;
  v += 0.65 * snoise(p * 0.45);
  v += 0.35 * snoise(p * 0.9 + vec2(1.7, 3.2));
  return v;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  vec2 uv = st;
  uv.x *= aspect;

  // Ultra-slow, peaceful breathing time
  float t = uTime * 0.045;

  // Smooth lerped mouse influence (nudges atmospheric center gently)
  vec2 mouseOffset = (uMouse - 0.5) * 0.05;

  // Domain warp with very gentle broad strokes
  vec2 q = vec2(
    smoothAtmosphere(uv * 0.35 + vec2(0.0, 0.0) + t * 0.5 + mouseOffset),
    smoothAtmosphere(uv * 0.35 + vec2(4.3, 2.1) - t * 0.4)
  );

  vec2 r = vec2(
    smoothAtmosphere(uv * 0.3 + 0.8 * q + vec2(2.1, 5.8) + t * 0.3),
    smoothAtmosphere(uv * 0.3 + 0.8 * q + vec2(7.4, 1.9) - t * 0.25)
  );

  float f = smoothAtmosphere(uv * 0.25 + 0.7 * r + t * 0.2);

  // Exact OpenAI Codex Ambient Palette:
  // Pristine luminous white/ice base
  vec3 colBase = vec3(0.980, 0.985, 0.996);
  // Serene periwinkle cornflower (#778CF7)
  vec3 colBlue = vec3(0.467, 0.549, 0.969);
  // Gentle lavender violet (#979EFC)
  vec3 colLavender = vec3(0.592, 0.620, 0.988);
  // Ethereal airy mist lilac (#B4BFFD)
  vec3 colMist = vec3(0.706, 0.749, 0.992);
  // Pure glowing white
  vec3 colWhite = vec3(1.0, 1.0, 1.0);

  // Atmospheric falloff: rich light towards the top flanks, airy and calm in center
  float topSpread = smoothstep(-0.2, 1.0, st.y);
  float edgeDist = abs(st.x - 0.5);
  float flankSpread = smoothstep(0.1, 0.7, edgeDist);
  float aura = clamp(topSpread * 0.55 + flankSpread * 0.45, 0.0, 1.0);

  vec3 color = colBase;

  // Soft layer blending (silk-smooth transitions)
  float blend1 = smoothstep(-0.6, 0.8, f + q.x * 0.4);
  color = mix(color, colMist, blend1 * 0.48 * aura);

  float blend2 = smoothstep(-0.4, 0.9, r.x + q.y * 0.3);
  color = mix(color, colLavender, blend2 * 0.38 * aura);

  float blend3 = smoothstep(0.0, 1.0, f + r.y * 0.4);
  color = mix(color, colBlue, blend3 * 0.24 * aura);

  // High-key luminous center for pristine text contrast
  float centerDist = length(vec2((st.x - 0.5) * aspect, st.y - 0.55));
  float centerLuminance = 1.0 - smoothstep(0.0, 0.85, centerDist);
  color = mix(color, colWhite, centerLuminance * 0.5);

  // Ultra-fine photographic dithering noise to prevent 8-bit banding
  float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.012;
  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
`

export function AmbientBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const isVisibleRef = useRef<boolean>(true)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: false,
      alpha: true,
      stencil: false,
      depth: false,
    })
    rendererRef.current = renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 }

    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false,
    })
    materialRef.current = material

    const geometry = new THREE.PlaneGeometry(2, 2)
    const quad = new THREE.Mesh(geometry, material)
    scene.add(quad)

    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      uniforms.uResolution.value.set(width, height)
    }
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX / window.innerWidth
      mouse.targetY = 1.0 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting
        })
      },
      { threshold: 0.05 }
    )
    observer.observe(container)

    let animationFrameId: number
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisibleRef.current) return

      const delta = clock.getDelta()
      uniforms.uTime.value += delta

      mouse.x += (mouse.targetX - mouse.x) * 0.02
      mouse.y += (mouse.targetY - mouse.y) * 0.02
      uniforms.uMouse.value.set(mouse.x, mouse.y)

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      observer.disconnect()

      geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    />
  )
}
