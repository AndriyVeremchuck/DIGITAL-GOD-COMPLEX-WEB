/**
 * DIGITAL GOD COMPLEX — Live WebGL / WebGPU Graphics Engine
 * Provides ambient reactive shaders, live GPU badge, and interactive 3D demos.
 * Zero external dependencies. High performance & progressive enhancement.
 */
(() => {
  "use strict";

  const prefersReduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 1. GPU Detection & Capabilities
  let gpuBackend = "WebGL 2.0";
  let isWebGPU = false;
  let activeFps = 60;
  let lastTime = performance.now();
  let frameCount = 0;

  async function checkCapabilities() {
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          isWebGPU = true;
          gpuBackend = "WebGPU";
        }
      } catch (_) {}
    }
    if (!isWebGPU) {
      const testCanvas = document.createElement("canvas");
      const gl2 = testCanvas.getContext("webgl2");
      if (gl2) {
        gpuBackend = "WebGL 2.0";
      } else {
        const gl1 = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
        gpuBackend = gl1 ? "WebGL 1.0" : "Canvas 2D";
      }
    }
  }

  // 2. Ambient Background Shader (Drifting Volumetric Dust / Particles)
  let bgCanvas, bgGL, bgProgram, bgAnimId = null;
  let mouseX = 0.5, mouseY = 0.5, targetMouseX = 0.5, targetMouseY = 0.5;

  const BG_VS = `#version 300 es
  in vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }`;

  const BG_FS = `#version 300 es
  precision highp float;
  out vec4 fragColor;
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_mouse;

  // Pseudo-random noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_res;
    vec2 p = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
    
    // Parallax motion from mouse
    vec2 m = (u_mouse - 0.5) * 0.4;
    p += m;

    // Subtle volumetric dark atmospheric glow
    float t = u_time * 0.12;
    float d1 = length(p - vec2(sin(t)*0.6, cos(t*0.7)*0.4));
    float d2 = length(p + vec2(cos(t*0.5)*0.5, sin(t*0.8)*0.5));
    
    float glow1 = 0.08 / (d1 * d1 + 0.5);
    float glow2 = 0.06 / (d2 * d2 + 0.5);

    vec3 col = vec3(0.02, 0.05, 0.12) * glow1;
    col += vec3(0.12, 0.06, 0.16) * glow2;

    // Floating subtle particle dust
    vec2 grid = floor(uv * 40.0);
    float r = hash(grid);
    if (r > 0.94) {
      vec2 f = fract(uv * 40.0) - 0.5;
      float spark = smoothstep(0.15, 0.01, length(f));
      col += vec3(0.45, 0.85, 1.0) * spark * 0.15 * (sin(u_time * 2.0 + r * 10.0) * 0.5 + 0.5);
    }

    fragColor = vec4(col, 0.35);
  }`;

  function initAmbientBackground() {
    if (prefersReduced()) return;
    bgCanvas = document.createElement("canvas");
    bgCanvas.id = "dgcAmbientGpuCanvas";
    bgCanvas.className = "dgc-ambient-canvas";
    document.body.prepend(bgCanvas);

    bgGL = bgCanvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power" });
    if (!bgGL) return;

    const vs = bgGL.createShader(bgGL.VERTEX_SHADER);
    bgGL.shaderSource(vs, BG_VS);
    bgGL.compileShader(vs);

    const fs = bgGL.createShader(bgGL.FRAGMENT_SHADER);
    bgGL.shaderSource(fs, BG_FS);
    bgGL.compileShader(fs);

    bgProgram = bgGL.createProgram();
    bgGL.attachShader(bgProgram, vs);
    bgGL.attachShader(bgProgram, fs);
    bgGL.linkProgram(bgProgram);

    const posBuffer = bgGL.createBuffer();
    bgGL.bindBuffer(bgGL.ARRAY_BUFFER, posBuffer);
    bgGL.bufferData(bgGL.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), bgGL.STATIC_DRAW);

    const posLoc = bgGL.getAttribLocation(bgProgram, "a_pos");
    bgGL.enableVertexAttribArray(posLoc);
    bgGL.vertexAttribPointer(posLoc, 2, bgGL.FLOAT, false, 0, 0);

    resizeAmbient();
    window.addEventListener("resize", resizeAmbient, { passive: true });
    window.addEventListener("pointermove", e => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = 1.0 - (e.clientY / window.innerHeight);
    }, { passive: true });

    renderAmbient(0);
  }

  function resizeAmbient() {
    if (!bgCanvas || !bgGL) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    bgCanvas.width = Math.floor(window.innerWidth * dpr * 0.5); // Downsampled for super low GPU usage
    bgCanvas.height = Math.floor(window.innerHeight * dpr * 0.5);
    bgGL.viewport(0, 0, bgCanvas.width, bgCanvas.height);
  }

  function renderAmbient(time) {
    if (document.hidden) {
      bgAnimId = requestAnimationFrame(renderAmbient);
      return;
    }
    // Smooth mouse lerp
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    bgGL.useProgram(bgProgram);
    const uRes = bgGL.getUniformLocation(bgProgram, "u_res");
    const uTime = bgGL.getUniformLocation(bgProgram, "u_time");
    const uMouse = bgGL.getUniformLocation(bgProgram, "u_mouse");

    bgGL.uniform2f(uRes, bgCanvas.width, bgCanvas.height);
    bgGL.uniform1f(uTime, time * 0.001);
    bgGL.uniform2f(uMouse, mouseX, mouseY);

    bgGL.drawArrays(bgGL.TRIANGLES, 0, 6);

    // FPS calculation
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      activeFps = Math.round((frameCount * 1000) / (now - lastTime));
      frameCount = 0;
      lastTime = now;
      updateFpsBadge();
    }

    bgAnimId = requestAnimationFrame(renderAmbient);
  }

  // 3. Topbar GPU Badge
  function mountGpuBadge() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    const badge = document.createElement("button");
    badge.id = "gpuBadge";
    badge.className = "gpu-badge";
    badge.type = "button";
    badge.title = "Апаратне прискорення DGC. Натисніть, щоб відкрити 3D GPU Студію";
    badge.setAttribute("aria-label", "Статус GPU та відкриття 3D демо");

    badge.innerHTML = `
      <span class="gpu-dot"></span>
      <span class="gpu-label">${gpuBackend}</span>
      <span class="gpu-fps">60 FPS</span>
    `;

    badge.addEventListener("click", () => openGpuModal("raymarching"));
    
    // Insert before language switcher or nav
    const lang = topbar.querySelector(".language");
    if (lang) {
      topbar.insertBefore(badge, lang);
    } else {
      topbar.append(badge);
    }
  }

  function updateFpsBadge() {
    const fpsEl = document.querySelector("#gpuBadge .gpu-fps");
    if (fpsEl) {
      fpsEl.textContent = `${activeFps} FPS`;
    }
  }

  // 4. Interactive 3D & Shader Viewport (Modal)
  let modal, demoCanvas, demoGL, demoProgram, demoAnimId = null;
  let currentDemo = "raymarching"; // 'raymarching' | 'pbr' | 'particles'
  let rotX = 0.2, rotY = 0.4, isDragging = false, lastDragX = 0, lastDragY = 0;
  let paramRoughness = 0.3, paramMetallic = 0.85, paramZoom = 1.0;
  let lastActiveElementBeforeModal = null;

  // Shader: Real-Time Raymarching SDF (Morphing Fractal / Polyhedron)
  const RAYMARCH_FS = `#version 300 es
  precision highp float;
  out vec4 fragColor;
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_rot;
  uniform float u_param1; // Roughness / Detail
  uniform float u_param2; // Metallic

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
  }

  // Smooth min
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float map(vec3 p) {
    p.yz *= rot(u_rot.x);
    p.xz *= rot(u_rot.y);
    
    // Morphing geometric sculpture
    float t = u_time * 0.4;
    vec3 p1 = p;
    p1.xz *= rot(t);
    p1.xy *= rot(t * 0.7);

    float d1 = length(p) - 1.25;
    float d2 = sdBox(p1, vec3(0.95)) - 0.1;
    
    // Cross boolean
    float dCross = min(length(p1.xy), min(length(p1.yz), length(p1.xz))) - 0.4;
    float dGeom = max(mix(d1, d2, sin(t)*0.5+0.5), -dCross);

    // Inner glowing crystal
    float dInner = length(p) - 0.45;
    return smin(dGeom, dInner, 0.15);
  }

  vec3 calcNormal(vec3 p) {
    const float h = 0.002;
    const vec2 k = vec2(1.0, -1.0);
    return normalize(k.xyy * map(p + k.xyy * h) +
                     k.yyx * map(p + k.yyx * h) +
                     k.yxy * map(p + k.yxy * h) +
                     k.xxx * map(p + k.xxx * h));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
    vec3 ro = vec3(0.0, 0.0, 3.6);
    vec3 rd = normalize(vec3(uv, -1.8));

    float t = 0.0;
    float d = 0.0;
    for (int i = 0; i < 80; i++) {
      vec3 p = ro + rd * t;
      d = map(p);
      if (d < 0.001 || t > 12.0) break;
      t += d;
    }

    vec3 col = vec3(0.04, 0.07, 0.14) * (1.0 - length(uv) * 0.35); // Vignette bg

    if (t < 12.0) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      vec3 lightPos = vec3(2.5, 3.5, 3.0);
      vec3 l = normalize(lightPos - p);
      vec3 v = -rd;
      vec3 h = normalize(l + v);

      float diff = max(dot(n, l), 0.0);
      float spec = pow(max(dot(n, h), 0.0), 32.0 * (1.0 - u_param1 * 0.8));
      float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.0);

      // Base PBR-styled material colours
      vec3 albedoGold = vec3(0.96, 0.81, 0.54);
      vec3 albedoCyan = vec3(0.38, 0.86, 0.98);
      vec3 baseColor = mix(albedoCyan, albedoGold, sin(p.y * 3.0 + u_time)*0.5+0.5);

      vec3 ambient = vec3(0.05, 0.09, 0.16) * baseColor;
      vec3 diffuse = diff * baseColor * (1.0 - u_param2 * 0.6);
      vec3 specular = (spec + fresnel * 0.5) * mix(vec3(1.0), baseColor, u_param2);

      col = ambient + diffuse + specular;

      // Soft rim glow
      col += vec3(0.4, 0.7, 1.0) * fresnel * 0.4;
    }

    // Gamma correction
    col = pow(col, vec3(1.0 / 2.2));
    fragColor = vec4(col, 1.0);
  }`;

  // Shader: PBR Sphere Inspector
  const PBR_FS = `#version 300 es
  precision highp float;
  out vec4 fragColor;
  uniform vec2 u_res;
  uniform float u_time;
  uniform vec2 u_rot;
  uniform float u_param1; // Roughness
  uniform float u_param2; // Metallic

  mat2 rot(float a) {
    float s = sin(a), c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_res) / min(u_res.x, u_res.y);
    float r = length(uv);
    vec3 col = vec3(0.03, 0.06, 0.11);

    if (r < 0.85) {
      float z = sqrt(0.85 * 0.85 - r * r);
      vec3 n = normalize(vec3(uv, z));
      n.yz *= rot(u_rot.x);
      n.xz *= rot(u_rot.y);

      vec3 light = normalize(vec3(cos(u_time * 0.7) * 2.0, 2.0, sin(u_time * 0.7) * 2.0 + 1.5));
      vec3 view = vec3(0.0, 0.0, 1.0);
      vec3 h = normalize(light + view);

      float NdotL = max(dot(n, light), 0.0);
      float NdotV = max(dot(n, view), 0.0);
      float NdotH = max(dot(n, h), 0.0);
      float VdotH = max(dot(view, h), 0.0);

      // Simple Cook-Torrance approximation
      float rough = clamp(u_param1, 0.04, 1.0);
      float alpha = rough * rough;
      float D = alpha * alpha / (3.14159 * pow(NdotH * NdotH * (alpha * alpha - 1.0) + 1.0, 2.0));
      float F = mix(0.04, 1.0, pow(1.0 - VdotH, 5.0));
      float spec = (D * F) / (4.0 * NdotL * NdotV + 0.001);

      vec3 base = mix(vec3(0.4, 0.85, 1.0), vec3(0.95, 0.78, 0.45), u_param2);
      col = (1.0 - u_param2) * base * NdotL + spec * mix(vec3(1.0), base, u_param2);
      col += vec3(0.05, 0.08, 0.12); // Ambient
    }

    col = pow(col, vec3(1.0 / 2.2));
    fragColor = vec4(col, 1.0);
  }`;

  function createShader(gl, type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("DGC Shader compile error:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function initDemoGL() {
    if (!demoCanvas) return;
    demoGL = demoCanvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!demoGL) return;

    compileCurrentDemo();

    const quadBuf = demoGL.createBuffer();
    demoGL.bindBuffer(demoGL.ARRAY_BUFFER, quadBuf);
    demoGL.bufferData(demoGL.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), demoGL.STATIC_DRAW);

    const pos = demoGL.getAttribLocation(demoProgram, "a_pos");
    demoGL.enableVertexAttribArray(pos);
    demoGL.vertexAttribPointer(pos, 2, demoGL.FLOAT, false, 0, 0);

    resizeDemo();
    startDemoLoop();
  }

  function compileCurrentDemo() {
    if (!demoGL) return;
    const fsSource = currentDemo === "pbr" ? PBR_FS : RAYMARCH_FS;
    const vs = createShader(demoGL, demoGL.VERTEX_SHADER, BG_VS);
    const fs = createShader(demoGL, demoGL.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    if (demoProgram) demoGL.deleteProgram(demoProgram);
    demoProgram = demoGL.createProgram();
    demoGL.attachShader(demoProgram, vs);
    demoGL.attachShader(demoProgram, fs);
    demoGL.linkProgram(demoProgram);
  }

  function resizeDemo() {
    if (!demoCanvas || !demoGL) return;
    const rect = demoCanvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    demoCanvas.width = Math.max(300, Math.floor(rect.width * dpr));
    demoCanvas.height = Math.max(300, Math.floor(rect.height * dpr));
    demoGL.viewport(0, 0, demoCanvas.width, demoCanvas.height);
  }

  function renderDemo(time) {
    if (!modal || !modal.classList.contains("open") || !demoGL || !demoProgram) return;

    demoGL.useProgram(demoProgram);
    const uRes = demoGL.getUniformLocation(demoProgram, "u_res");
    const uTime = demoGL.getUniformLocation(demoProgram, "u_time");
    const uRot = demoGL.getUniformLocation(demoProgram, "u_rot");
    const uP1 = demoGL.getUniformLocation(demoProgram, "u_param1");
    const uP2 = demoGL.getUniformLocation(demoProgram, "u_param2");

    demoGL.uniform2f(uRes, demoCanvas.width, demoCanvas.height);
    demoGL.uniform1f(uTime, time * 0.001);
    demoGL.uniform2f(uRot, rotX, rotY);
    demoGL.uniform1f(uP1, paramRoughness);
    demoGL.uniform1f(uP2, paramMetallic);

    demoGL.drawArrays(demoGL.TRIANGLES, 0, 6);

    demoAnimId = requestAnimationFrame(renderDemo);
  }

  function startDemoLoop() {
    if (demoAnimId) cancelAnimationFrame(demoAnimId);
    demoAnimId = requestAnimationFrame(renderDemo);
  }

  function createModalDOM() {
    if (modal) return;
    modal = document.createElement("div");
    modal.id = "dgcGpuModal";
    modal.className = "dgc-gpu-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-label", "Інтерактивний 3D GPU В'юпорт");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="gpu-modal-backdrop"></div>
      <div class="gpu-modal-dialog">
        <header class="gpu-modal-header">
          <div class="gpu-title-group">
            <span class="gpu-modal-badge">${gpuBackend} 60 FPS</span>
            <h2>DGC · ІНТЕРАКТИВНИЙ 3D В'ЮПОРТ</h2>
          </div>
          <button id="dgcGpuClose" class="gpu-close-btn" type="button" aria-label="Закрити 3D переглядач">×</button>
        </header>
        <div class="gpu-modal-body">
          <div class="gpu-canvas-wrap">
            <canvas id="dgcDemoCanvas"></canvas>
            <div class="gpu-viewport-hint">Перетягуйте мишкою для обертання 3D ракурсу</div>
          </div>
          <aside class="gpu-modal-sidebar">
            <div class="gpu-tabs" role="tablist">
              <button type="button" class="gpu-tab active" data-mode="raymarching">01 · SDF Raymarching</button>
              <button type="button" class="gpu-tab" data-mode="pbr">02 · PBR Матеріали</button>
            </div>
            <div class="gpu-controls">
              <label>
                <span>Шорсткість (Roughness): <b id="valRough">0.30</b></span>
                <input id="sliderRough" type="range" min="0.05" max="1.0" step="0.05" value="0.30">
              </label>
              <label>
                <span>Металічність (Metallic): <b id="valMetal">0.85</b></span>
                <input id="sliderMetal" type="range" min="0.0" max="1.0" step="0.05" value="0.85">
              </label>
            </div>
            <div class="gpu-description" id="gpuDesc">
              <h3>SDF & Raymarching</h3>
              <p>Процедурне математичне поле відстаней (Signed Distance Field) обчислюється на GPU для кожного пікселя в реальному часі без полігональної сітки.</p>
            </div>
          </aside>
        </div>
      </div>
    `;

    document.body.append(modal);

    demoCanvas = modal.querySelector("#dgcDemoCanvas");

    // Close button & backdrop
    const closeBtn = modal.querySelector("#dgcGpuClose");
    const backdrop = modal.querySelector(".gpu-modal-backdrop");
    closeBtn.addEventListener("click", closeGpuModal);
    backdrop.addEventListener("click", closeGpuModal);

    // Escape listener
    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("open")) {
        closeGpuModal();
      }
    });

    // Mouse drag interaction
    demoCanvas.addEventListener("pointerdown", e => {
      isDragging = true;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      demoCanvas.setPointerCapture(e.pointerId);
    });
    demoCanvas.addEventListener("pointermove", e => {
      if (!isDragging) return;
      const dx = e.clientX - lastDragX;
      const dy = e.clientY - lastDragY;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      rotY += dx * 0.008;
      rotX += dy * 0.008;
    });
    demoCanvas.addEventListener("pointerup", e => {
      isDragging = false;
      try { demoCanvas.releasePointerCapture(e.pointerId); } catch (_) {}
    });

    // Sliders
    const rSlider = modal.querySelector("#sliderRough");
    const mSlider = modal.querySelector("#sliderMetal");
    const rVal = modal.querySelector("#valRough");
    const mVal = modal.querySelector("#valMetal");

    rSlider.addEventListener("input", e => {
      paramRoughness = parseFloat(e.target.value);
      rVal.textContent = paramRoughness.toFixed(2);
    });
    mSlider.addEventListener("input", e => {
      paramMetallic = parseFloat(e.target.value);
      mVal.textContent = paramMetallic.toFixed(2);
    });

    // Tabs
    const tabs = modal.querySelectorAll(".gpu-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        currentDemo = tab.dataset.mode;
        compileCurrentDemo();

        const desc = modal.querySelector("#gpuDesc");
        if (currentDemo === "pbr") {
          desc.innerHTML = `
            <h3>Cook-Torrance PBR</h3>
            <p>Фізично коректне розсіювання світла (BRDF), закон Френеля та моделювання мікрограней металів і діелектриків у реальному часі.</p>
          `;
        } else {
          desc.innerHTML = `
            <h3>SDF & Raymarching</h3>
            <p>Процедурне математичне поле відстаней (Signed Distance Field) обчислюється на GPU для кожного пікселя в реальному часі без полігональної сітки.</p>
          `;
        }
      });
    });

    initDemoGL();
  }

  function openGpuModal(mode = "raymarching") {
    createModalDOM();
    lastActiveElementBeforeModal = document.activeElement;
    currentDemo = mode;

    const tabs = modal.querySelectorAll(".gpu-tab");
    tabs.forEach(t => t.classList.toggle("active", t.dataset.mode === mode));
    compileCurrentDemo();

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    resizeDemo();
    startDemoLoop();
    modal.querySelector("#dgcGpuClose").focus();
  }

  function closeGpuModal() {
    if (!modal) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (demoAnimId) cancelAnimationFrame(demoAnimId);
    if (lastActiveElementBeforeModal && typeof lastActiveElementBeforeModal.focus === "function") {
      lastActiveElementBeforeModal.focus();
    }
  }

  // 5. Enhance Slide Cards with Interactive 3D Demo Triggers
  function attachCardTriggers() {
    const observer = new MutationObserver(() => {
      const cards = document.querySelectorAll(".slide .visual-card");
      cards.forEach(card => {
        if (card.dataset.gpuAttached) return;
        card.dataset.gpuAttached = "true";

        const text = card.textContent.toLowerCase();
        let triggerMode = null;
        if (text.includes("ray") || text.includes("sdf") || text.includes("marching") || text.includes("фрактал")) {
          triggerMode = "raymarching";
        } else if (text.includes("pbr") || text.includes("3d") || text.includes("матеріал")) {
          triggerMode = "pbr";
        }

        if (triggerMode) {
          const btn = document.createElement("span");
          btn.className = "card-gpu-pill";
          btn.innerHTML = "⚡ 3D LIVE";
          btn.title = "Відкрити інтерактивне 3D шейдер-демо";
          btn.addEventListener("click", e => {
            e.stopPropagation();
            openGpuModal(triggerMode);
          });
          const media = card.querySelector(".media");
          if (media) media.append(btn);
        }
      });
    });

    const slides = document.getElementById("slides");
    if (slides) {
      observer.observe(slides, { childList: true, subtree: true });
    }
  }

  // Lifecycle Initialization
  async function init() {
    await checkCapabilities();
    mountGpuBadge();
    initAmbientBackground();
    attachCardTriggers();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.DGCGPU = {
    openDemo: openGpuModal,
    getBackend: () => gpuBackend,
    getFps: () => activeFps
  };
})();
