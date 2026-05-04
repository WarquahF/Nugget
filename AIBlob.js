import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AIBlob = ({ emotionColor = '#00d2ff', isListening = false }) => {
  const mountRef = useRef(null);
  
  // Audio Refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  
  // WebGL Refs
  const animationFrameIdRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const materialsRef = useRef({});

  // 1. Setup Audio (Depends on isListening)
  useEffect(() => {
    const setupAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStreamRef.current = stream;
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;
            
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyserRef.current = analyser;
            
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    if (isListening) {
        setupAudio();
    } else {
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
            microphoneStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }

    return () => {
        if (microphoneStreamRef.current) {
            microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };
  }, [isListening]);

  // 2. Setup WebGL (Runs once)
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Responsive sizing - use container dimensions or fallback
    const updateSize = () => {
      const rect = currentMount.getBoundingClientRect();
      const width = Math.min(rect.width || 280, 280);
      const height = Math.min(rect.height || 280, 280);
      return { width, height };
    };
    
    let { width, height } = updateSize();
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.z = 2.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    rendererRef.current = renderer;
    
    currentMount.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    const noiseFunctions = `
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
            const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy) );
            vec3 x0 = v - i + dot(i, C.xxx) ;
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min( g.xyz, l.zxy );
            vec3 i2 = max( g.xyz, l.zxy );
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod289(i);
            vec4 p = permute( permute( permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
            float n_ = 0.142857142857;
            vec3  ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_ );
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        float fbm(vec3 p) {
            float total = 0.0;
            float amplitude = 0.5;
            float frequency = 1.0;
            for (int i = 0; i < 3; i++) { 
                total += snoise(p * frequency) * amplitude;
                amplitude *= 0.5;
                frequency *= 2.0;
            }
            return total;
        }
    `;

    const pointLight = new THREE.PointLight(0x0088ff, 2.0, 10);
    mainGroup.add(pointLight);

    const shellGeo = new THREE.SphereGeometry(1.0, 64, 64);
    
    const shellShader = {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            uniform vec3 uColor;
            uniform float uOpacity;
            
            void main() {
                float fresnel = pow(1.0 - dot(normalize(vNormal), normalize(vViewPosition)), 2.5);
                gl_FragColor = vec4(uColor, fresnel * uOpacity);
            }
        `
    };

    const shellBackMat = new THREE.ShaderMaterial({
        vertexShader: shellShader.vertexShader,
        fragmentShader: shellShader.fragmentShader,
        uniforms: { 
            uColor: { value: new THREE.Color(0x000055) }, 
            uOpacity: { value: 0.3 } 
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false
    });

    const shellFrontMat = new THREE.ShaderMaterial({
        vertexShader: shellShader.vertexShader,
        fragmentShader: shellShader.fragmentShader,
        uniforms: { 
            uColor: { value: new THREE.Color('#00d2ff') }, // Will be updated
            uOpacity: { value: 0.41 } 
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false
    });

    materialsRef.current.shellFrontMat = shellFrontMat;

    mainGroup.add(new THREE.Mesh(shellGeo, shellBackMat));
    mainGroup.add(new THREE.Mesh(shellGeo, shellFrontMat));

    const plasmaGeo = new THREE.SphereGeometry(0.998, 128, 128); 
    const plasmaMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uScale: { value: 0.2 },
            uBrightness: { value: 1.31 },
            uThreshold: { value: 0.09 },
            uColorDeep: { value: new THREE.Color(0x001433) },
            uColorMid: { value: new THREE.Color('#00d2ff') }, // Will be updated
            uColorBright: { value: new THREE.Color(0x00ffe1) }
        },
        vertexShader: `
            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;

            void main() {
                vPosition = position;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz; 
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float uTime;
            uniform float uScale;
            uniform float uBrightness;
            uniform float uThreshold;
            uniform vec3 uColorDeep;
            uniform vec3 uColorMid;
            uniform vec3 uColorBright;

            varying vec3 vPosition;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            ${noiseFunctions}

            void main() {
                vec3 p = vPosition * uScale; 
                vec3 q = vec3(
                    fbm(p + vec3(0.0, uTime * 0.05, 0.0)),
                    fbm(p + vec3(5.2, 1.3, 2.8) + uTime * 0.05),
                    fbm(p + vec3(2.2, 8.4, 0.5) - uTime * 0.02)
                );
                
                float density = fbm(p + 2.0 * q);
                float t = (density + 0.4) * 0.8;
                float alpha = smoothstep(uThreshold, 0.7, t);

                vec3 cWhite = vec3(1.0, 1.0, 1.0);
                
                vec3 color = mix(uColorDeep, uColorMid, smoothstep(uThreshold, 0.5, t));
                color = mix(color, uColorBright, smoothstep(0.5, 0.8, t));
                color = mix(color, cWhite, smoothstep(0.8, 1.0, t));

                float facing = dot(normalize(vNormal), normalize(vViewPosition));
                float depthFactor = (facing + 1.0) * 0.5;
                float finalAlpha = alpha * (0.02 + 0.98 * depthFactor);
                
                gl_FragColor = vec4(color * uBrightness, finalAlpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    materialsRef.current.plasmaMat = plasmaMat;

    const plasmaMesh = new THREE.Mesh(plasmaGeo, plasmaMat);
    mainGroup.add(plasmaMesh);

    const pCount = 600; 
    const pPos = new Float32Array(pCount * 3);
    const pSizes = new Float32Array(pCount);
    const sphereRadius = 0.95;

    for(let i = 0; i < pCount; i++) {
        const r = sphereRadius * Math.cbrt(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pPos[i * 3 + 2] = r * Math.cos(phi);
        pSizes[i] = Math.random();
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('aSize', new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            uniform float uTime;
            attribute float aSize;
            varying float vAlpha;
            
            void main() {
                vec3 pos = position;
                pos.y += sin(uTime * 0.2 + pos.x) * 0.02;
                pos.x += cos(uTime * 0.15 + pos.z) * 0.02;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                float baseSize = 8.0 * aSize + 4.0;
                gl_PointSize = baseSize * (1.0 / -mvPosition.z);
                vAlpha = 0.8 + 0.2 * sin(uTime + aSize * 10.0);
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;
            void main() {
                vec2 uv = gl_PointCoord - vec2(0.5);
                float dist = length(uv);
                if(dist > 0.5) discard;
                float glow = 1.0 - (dist * 2.0);
                glow = pow(glow, 1.8);
                gl_FragColor = vec4(uColor, glow * vAlpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(pGeo, pMat);
    mainGroup.add(particles);

    const clock = new THREE.Clock();
    let currentScale = 1.0;
    let targetScale = 1.0;

    const animate = () => {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        plasmaMat.uniforms.uTime.value = t * 1.2; 
        pMat.uniforms.uTime.value = t;

        // Use ref for analyser
        if (analyserRef.current && dataArrayRef.current) {
            analyserRef.current.getByteFrequencyData(dataArrayRef.current);
            let sum = 0;
            for (let i = 0; i < dataArrayRef.current.length; i++) {
                sum += dataArrayRef.current[i];
            }
            const average = sum / dataArrayRef.current.length;
            const normalizedVol = average / 255;
            targetScale = 1.0 + (normalizedVol * 0.8);
            plasmaMat.uniforms.uBrightness.value = 1.31 + (normalizedVol * 1.5);
        } else {
            targetScale = 1.0;
            plasmaMat.uniforms.uBrightness.value = 1.31;
        }

        currentScale += (targetScale - currentScale) * 0.1;
        mainGroup.scale.set(currentScale, currentScale, currentScale);

        plasmaMesh.rotation.y = t * 0.08;
        mainGroup.rotation.x += 0.002;
        mainGroup.rotation.y += 0.005;

        renderer.render(scene, camera);
    };

    animate();

    return () => {
        if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
        if (currentMount && renderer.domElement) {
            try { currentMount.removeChild(renderer.domElement); } catch (e) {}
        }
        scene.clear();
        renderer.dispose();
    };
  }, []); // Run ONCE on mount

  // 3. Update Colors (Runs when emotionColor changes)
  useEffect(() => {
    if (materialsRef.current.shellFrontMat) {
        materialsRef.current.shellFrontMat.uniforms.uColor.value.set(emotionColor);
    }
    if (materialsRef.current.plasmaMat) {
        materialsRef.current.plasmaMat.uniforms.uColorMid.value.set(emotionColor);
    }
  }, [emotionColor]);

  return (
    <div 
        ref={mountRef} 
        style={{ 
            width: '100%', 
            height: '100%', 
            maxWidth: '280px',
            maxHeight: '280px',
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative',
            flexShrink: 0
        }} 
    />
  );
};

export default AIBlob;
