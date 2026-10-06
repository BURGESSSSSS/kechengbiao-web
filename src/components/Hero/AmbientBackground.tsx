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

// High-grade 2D Simplex Noise with smooth cubic falloff
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
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
  m = m*m;
  m = m*m;
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

// Broad atmospheric octave blending
float fbm(vec2 p) {
  float v = 0.0;
  v += 0.55 * snoise(p * 0.5);
  v += 0.30 * snoise(p * 1.0 + vec2(2.1, 4.3));
  v += 0.15 * snoise(p * 2.0 + vec2(7.8, 1.2));
  return v;
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;

  vec2 uv = st;
  uv.x *= aspect;

  // Noticeable, continuous living flow (perceptible within 1-2s of observation)
  float t = uTime * 0.138;

  // Gentle, responsive mouse parallax
  vec2 mouseOffset = (uMouse - 0.5) * 0.085;

  // Enhanced domain warping for fluid, billowy silk-like atmospheric currents & masses
  vec2 q = vec2(
    fbm(uv * 0.44 + vec2(0.0, 0.0) + t * 0.68 + mouseOffset),
    fbm(uv * 0.44 + vec2(5.2, 1.7) - t * 0.58)
  );

  vec2 r = vec2(
    fbm(uv * 0.38 + 1.32 * q + vec2(1.8, 8.4) + t * 0.48),
    fbm(uv * 0.38 + 1.32 * q + vec2(8.3, 3.1) - t * 0.40)
  );

  float f = fbm(uv * 0.32 + 1.25 * r + t * 0.32);

  // OpenAI Codex Ambient Color Palette (Richer, deeper, ethereal yet dignified)
  // Luminous breathable white/ice base
  vec3 colBase = vec3(0.972, 0.978, 0.995);
  // Vibrant cornflower periwinkle azure
  vec3 colBlue = vec3(0.315, 0.450, 0.975);
  // Soft, deep ambient lavender violet
  vec3 colViolet = vec3(0.510, 0.440, 0.980);
  // Ethereal orchid purple mist
  vec3 colPurple = vec3(0.630, 0.480, 0.990);
  // Airy cyan sky mist
  vec3 colSky = vec3(0.640, 0.860, 0.995);
  // Pure luminous high-key center
  vec3 colWhite = vec3(1.0, 1.0, 1.0);

  // Atmospheric gradient weighting:
  // Distinct presence on upper flanks, corners, and ceiling, softly wrapping the page
  float topAura = smoothstep(-0.10, 0.98, st.y);
  float flankAura = smoothstep(0.04, 0.70, abs(st.x - 0.5));
  float cornerAura = smoothstep(0.18, 0.88, length(vec2(abs(st.x - 0.5) * 1.35, st.y - 0.55)));
  float atmosphere = clamp(topAura * 0.76 + flankAura * 0.68 + cornerAura * 0.38, 0.0, 1.0);

  vec3 color = colBase;

  // Harmonious multi-layered color blending with enhanced depth:
  // 1. Soft sky blue wash
  float blendSky = smoothstep(-0.45, 0.75, f + q.x * 0.55);
  color = mix(color, colSky, blendSky * 0.65 * atmosphere);

  // 2. Lavender violet current
  float blendViolet = smoothstep(-0.25, 0.88, r.x + q.y * 0.45);
  color = mix(color, colViolet, blendViolet * 0.62 * atmosphere);

  // 3. Ethereal purple edge wash & billowing clouds
  float blendPurple = smoothstep(-0.05, 0.92, f + r.y * 0.55);
  color = mix(color, colPurple, blendPurple * 0.55 * atmosphere);

  // 4. Periwinkle depth accent
  float blendBlue = smoothstep(0.15, 1.0, r.y + q.x * 0.45);
  color = mix(color, colBlue, blendBlue * 0.45 * atmosphere);

  // 5. Crisp, focused luminous high-key center ensuring text readability & crystalline hold
  float centerDist = length(vec2((st.x - 0.5) * aspect * 1.15, (st.y - 0.56) * 1.28));
  float centerLuminance = 1.0 - smoothstep(0.0, 0.72, centerDist);
  color = mix(color, colWhite, centerLuminance * 0.66);

  // Delicate micro-dithering noise to completely eradicate 8-bit color banding
  float grain = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * 0.016;
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

      mouse.x += (mouse.targetX - mouse.x) * 0.03
      mouse.y += (mouse.targetY - mouse.y) * 0.03
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
