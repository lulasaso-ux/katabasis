// Painting in relief: a first attempt at showing an oil painting as a 3D object. After Luo, Lu et
// al., "Synthesizing Oil Painting Surface Geometry from a Single Photograph" (CVPR 2012): the
// relief of the brush strokes is estimated from the photograph alone and rendered so that it
// answers to light. This version does not use their learned model; it takes the fine detail of
// the image (a band-pass of its luminance, oriented along the strokes) as the paint's height.
// The canvas is drawn with WebGL on a stretcher that can be turned and relit.
(() => {
  const L = (es, en) => (lang === 'es' ? es : en);
  const AVAILABLE = new Set(['impressionism-vangogh-starry-night']);
  const available = p => !!p && AVAILABLE.has(p.id);
  const button = p => available(p) ? `<button type="button" class="secondary relief-open" data-relief-open="${p.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/></svg><span>${L('Ver en relieve 3D', 'View in 3D relief')}</span></button>` : '';

  // ---- relief estimation ---------------------------------------------------------------------
  function boxBlur(src, w, h, r) {
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h), n = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      let acc = 0, row = y * w;
      for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        tmp[row + x] = acc / n;
        acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        out[y * w + x] = acc / n;
        acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
      }
    }
    return out;
  }
  const gauss = (src, w, h, r) => boxBlur(boxBlur(boxBlur(src, w, h, r), w, h, r), w, h, r);
  // Height: fine band-pass of luminance (the ridges and troughs of the paint), smoothed along the
  // local stroke direction so that strokes read as continuous bands of paint, plus a faint broad
  // term so that thick, light passages stand a little prouder than thin dark ones.
  function heightMap(img, maxSide) {
    const s = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
    const px = g.getImageData(0, 0, w, h).data, lum = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) lum[i] = (0.299 * px[4 * i] + 0.587 * px[4 * i + 1] + 0.114 * px[4 * i + 2]) / 255;
    const fine = gauss(lum, w, h, 1), mid = gauss(lum, w, h, 4), broad = gauss(lum, w, h, 18);
    const band = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) band[i] = (fine[i] - mid[i]) + 0.25 * (mid[i] - broad[i]);
    // Structure tensor: smooth the band along the dominant local orientation.
    const gx = new Float32Array(w * h), gy = new Float32Array(w * h);
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      gx[i] = mid[i + 1] - mid[i - 1]; gy[i] = mid[i + w] - mid[i - w];
    }
    const jxx = new Float32Array(w * h), jxy = new Float32Array(w * h), jyy = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { jxx[i] = gx[i] * gx[i]; jxy[i] = gx[i] * gy[i]; jyy[i] = gy[i] * gy[i]; }
    const sxx = gauss(jxx, w, h, 3), sxy = gauss(jxy, w, h, 3), syy = gauss(jyy, w, h, 3);
    const height = new Float32Array(w * h), steps = [-3, -2, -1, 0, 1, 2, 3];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, th = 0.5 * Math.atan2(2 * sxy[i], sxx[i] - syy[i]) + Math.PI / 2;
      const dx = Math.cos(th), dy = Math.sin(th);
      let acc = 0, wsum = 0;
      for (const t of steps) {
        const xx = Math.min(w - 1, Math.max(0, Math.round(x + dx * t))), yy = Math.min(h - 1, Math.max(0, Math.round(y + dy * t)));
        const k = 1 - Math.abs(t) / 4; acc += band[yy * w + xx] * k; wsum += k;
      }
      height[i] = acc / wsum;
    }
    // Normalise to 0..255 around the 1st and 99th percentiles.
    const sorted = Float32Array.from(height).sort(), lo = sorted[Math.floor(sorted.length * 0.01)], hi = sorted[Math.floor(sorted.length * 0.99)];
    const bytes = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) bytes[i] = Math.max(0, Math.min(255, Math.round((height[i] - lo) / (hi - lo) * 255)));
    return { w, h, bytes, color: c };
  }

  // ---- WebGL -------------------------------------------------------------------------------------
  const VS = `attribute vec3 aPos;attribute vec3 aNor;attribute vec2 aUv;attribute float aFace;
    uniform mat4 uProj,uView,uModel;uniform sampler2D uHeight;uniform float uDepth,uUseVtf;
    varying vec2 vUv;varying vec3 vPos,vNor;varying float vFace;
    void main(){vec3 p=aPos;if(aFace<0.5&&uUseVtf>0.5)p.z+=texture2D(uHeight,aUv).r*uDepth;
      vec4 w=uModel*vec4(p,1.);vPos=w.xyz;vNor=mat3(uModel)*aNor;vUv=aUv;vFace=aFace;gl_Position=uProj*uView*w;}`;
  const FS = `precision highp float;uniform sampler2D uColor,uHeight;uniform vec2 uTexel;uniform float uStrength;
    uniform vec3 uLight,uEye;varying vec2 vUv;varying vec3 vPos,vNor;varying float vFace;uniform mat4 uModel;
    void main(){vec3 n=normalize(vNor);vec3 albedo;float spec=0.;
      if(vFace<0.5){float hl=texture2D(uHeight,vUv-vec2(uTexel.x,0.)).r,hr=texture2D(uHeight,vUv+vec2(uTexel.x,0.)).r,
        hd=texture2D(uHeight,vUv+vec2(0.,uTexel.y)).r,hu=texture2D(uHeight,vUv-vec2(0.,uTexel.y)).r;
        vec3 tn=normalize(vec3((hl-hr)*uStrength,(hd-hu)*uStrength,1.));n=normalize(mat3(uModel)*tn);
        albedo=texture2D(uColor,vUv).rgb;spec=.28;}
      else if(vFace<1.5){albedo=vec3(.80,.74,.63);float g=fract(sin(dot(floor(vUv*vec2(420.,340.)),vec2(12.9898,78.233)))*43758.5);albedo*=.92+.08*g;}
      else{albedo=vec3(.33,.24,.17);}
      vec3 l=normalize(uLight),v=normalize(uEye-vPos),h=normalize(l+v);
      float d=max(dot(n,l),0.),s=pow(max(dot(n,h),0.),48.)*spec*step(0.,dot(n,l));
      vec3 col=albedo*(.30+.85*d)+vec3(s);gl_FragColor=vec4(pow(col,vec3(.96)),1.);}`;

  function mat4Persp(f, a, n, fr) { const t = 1 / Math.tan(f / 2); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (fr + n) / (n - fr), -1, 0, 0, 2 * fr * n / (n - fr), 0]; }
  function mat4Mul(a, b) { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; }
  const rotX = t => [1, 0, 0, 0, 0, Math.cos(t), Math.sin(t), 0, 0, -Math.sin(t), Math.cos(t), 0, 0, 0, 0, 1];
  const rotY = t => [Math.cos(t), 0, -Math.sin(t), 0, 0, 1, 0, 0, Math.sin(t), 0, Math.cos(t), 0, 0, 0, 0, 1];

  // A canvas on its stretcher: a finely divided painted face (face 0) that can be displaced,
  // four linen edges (face 1) and the wooden back (face 2).
  function geometry(aspect, depth, seg) {
    const W = aspect >= 1 ? 1 : aspect, H = aspect >= 1 ? 1 / aspect : 1, pos = [], nor = [], uv = [], face = [], idx = [];
    const sx = seg, sy = Math.max(2, Math.round(seg * H / W));
    for (let j = 0; j <= sy; j++) for (let i = 0; i <= sx; i++) {
      const u = i / sx, v = j / sy;
      pos.push((u - 0.5) * W, (0.5 - v) * H, 0); nor.push(0, 0, 1); uv.push(u, v); face.push(0);
    }
    for (let j = 0; j < sy; j++) for (let i = 0; i < sx; i++) {
      const a = j * (sx + 1) + i, b = a + 1, c = a + sx + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const quad = (p, n, f, uvs) => {
      const base = pos.length / 3;
      p.forEach((q, k) => { pos.push(...q); nor.push(...n); uv.push(...uvs[k]); face.push(f); });
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3);
    };
    const x = W / 2, y = H / 2, z0 = -depth, z1 = 0;
    quad([[-x, y, z1], [-x, y, z0], [x, y, z0], [x, y, z1]], [0, 1, 0], 1, [[0, 0], [0, .05], [1, .05], [1, 0]]);
    quad([[x, -y, z1], [x, -y, z0], [-x, -y, z0], [-x, -y, z1]], [0, -1, 0], 1, [[1, 1], [1, .95], [0, .95], [0, 1]]);
    quad([[x, y, z1], [x, y, z0], [x, -y, z0], [x, -y, z1]], [1, 0, 0], 1, [[1, 0], [.95, 0], [.95, 1], [1, 1]]);
    quad([[-x, -y, z1], [-x, -y, z0], [-x, y, z0], [-x, y, z1]], [-1, 0, 0], 1, [[0, 1], [.05, 1], [.05, 0], [0, 0]]);
    quad([[-x, y, z0], [-x, -y, z0], [x, -y, z0], [x, y, z0]], [0, 0, -1], 2, [[0, 0], [0, 1], [1, 1], [1, 0]]);
    return { pos: new Float32Array(pos), nor: new Float32Array(nor), uv: new Float32Array(uv), face: new Float32Array(face), idx: new Uint32Array(idx) };
  }

  let viewer = null;
  function start(canvas, map) {
    const gl = canvas.getContext('webgl', { antialias: true, preserveDrawingBuffer: true });
    if (!gl || !gl.getExtension('OES_element_index_uint')) return null;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const useVtf = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) > 0;
    const ratio = map.w / map.h, objW = ratio >= 1 ? 1 : ratio, objH = ratio >= 1 ? 1 / ratio : 1;
    const geo = geometry(ratio, 0.035, 320);
    const attr = (name, data, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
    attr('aPos', geo.pos, 3); attr('aNor', geo.nor, 3); attr('aUv', geo.uv, 2); attr('aFace', geo.face, 1);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);
    const tex = (unit, fmt, w, h, data, src) => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      if (src) gl.texImage2D(gl.TEXTURE_2D, 0, fmt, fmt, gl.UNSIGNED_BYTE, src); else gl.texImage2D(gl.TEXTURE_2D, 0, fmt, w, h, 0, fmt, gl.UNSIGNED_BYTE, data);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    tex(0, gl.RGBA, 0, 0, null, map.color);
    tex(1, gl.LUMINANCE, map.w, map.h, map.bytes);
    const u = n => gl.getUniformLocation(prog, n);
    gl.uniform1i(u('uColor'), 0); gl.uniform1i(u('uHeight'), 1);
    gl.uniform2f(u('uTexel'), 1 / map.w, 1 / map.h); gl.uniform1f(u('uUseVtf'), useVtf ? 1 : 0);
    gl.enable(gl.DEPTH_TEST);
    const st = { yaw: -0.35, pitch: 0.18, zoom: 1, relief: 0.6, lightX: -0.55, lightY: 0.6, mode: 'turn' };
    function draw() {
      const r = Math.min(2, window.devicePixelRatio || 1), cw = Math.round(canvas.clientWidth * r), ch = Math.round(canvas.clientHeight * r);
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
      gl.viewport(0, 0, cw, ch); gl.clearColor(0.16, 0.12, 0.09, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      // The painting fits the view whatever its proportions; zoom is relative to that fit.
      const t = Math.tan(0.31), aspect = cw / ch, fit = Math.max(0.5 * objW * 1.25 / (t * aspect), 0.5 * objH * 1.8 / t), dist = fit * st.zoom;
      const model = mat4Mul(rotX(st.pitch), rotY(st.yaw)), eye = [0, 0, dist];
      gl.uniformMatrix4fv(u('uProj'), false, mat4Persp(0.62, aspect, 0.02, 40));
      gl.uniformMatrix4fv(u('uView'), false, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -dist, 1]);
      gl.uniformMatrix4fv(u('uModel'), false, model);
      gl.uniform1f(u('uDepth'), 0.006 * st.relief); gl.uniform1f(u('uStrength'), 9 * st.relief);
      gl.uniform3f(u('uLight'), st.lightX, st.lightY, 0.75); gl.uniform3fv(u('uEye'), eye);
      gl.drawElements(gl.TRIANGLES, geo.idx.length, gl.UNSIGNED_INT, 0);
    }
    let frame = 0; const redraw = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(draw); };
    // Dragging turns the painting or moves the light; the wheel or a pinch brings it closer.
    const pts = new Map(); let pinch = 0;
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); });
    canvas.addEventListener('pointermove', e => {
      if (!pts.has(e.pointerId)) return;
      const [px, py] = pts.get(e.pointerId), dx = e.clientX - px, dy = e.clientY - py; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2) { const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) st.zoom = Math.max(0.3, Math.min(2.2, st.zoom * pinch / d)); pinch = d; }
      else if (st.mode === 'light') { st.lightX = Math.max(-1.5, Math.min(1.5, st.lightX + dx * 0.006)); st.lightY = Math.max(-1.5, Math.min(1.5, st.lightY - dy * 0.006)); }
      else { st.yaw += dx * 0.008; st.pitch = Math.max(-1.45, Math.min(1.45, st.pitch + dy * 0.008)); }
      redraw();
    });
    const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', e => { e.preventDefault(); st.zoom = Math.max(0.3, Math.min(2.2, st.zoom * Math.exp(e.deltaY * 0.0012))); redraw(); }, { passive: false });
    canvas.addEventListener('dblclick', () => { Object.assign(st, { yaw: 0, pitch: 0, zoom: 1 }); redraw(); });
    canvas.addEventListener('keydown', e => {
      const k = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] }[e.key];
      if (!k) return; e.preventDefault(); st.yaw += k[0]; st.pitch = Math.max(-1.45, Math.min(1.45, st.pitch + k[1])); redraw();
    });
    const ro = new ResizeObserver(redraw); ro.observe(canvas);
    draw();
    return { st, redraw, stop: () => { ro.disconnect(); const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); }, vtf: useVtf };
  }

  // ---- the viewer ----------------------------------------------------------------------------------
  function dialog() {
    let d = document.getElementById('relief-dialog');
    if (d) return d;
    document.body.insertAdjacentHTML('beforeend', '<dialog id="relief-dialog" class="relief-dialog" aria-labelledby="relief-title"></dialog>');
    d = document.getElementById('relief-dialog');
    d.addEventListener('close', () => { if (viewer) viewer.stop(); viewer = null; d.innerHTML = ''; });
    d.addEventListener('click', e => {
      const t = e.target.closest('button');
      if (!t) return;
      if (t.matches('[data-relief-close]')) return d.close();
      if (!viewer) return;
      if (t.dataset.reliefMode) { viewer.st.mode = t.dataset.reliefMode; d.querySelectorAll('[data-relief-mode]').forEach(b => b.setAttribute('aria-pressed', String(b === t))); d.querySelector('#relief-hint').textContent = hint(); }
      if (t.matches('[data-relief-reset]')) { Object.assign(viewer.st, { yaw: 0, pitch: 0, zoom: 1, lightX: -0.55, lightY: 0.6 }); viewer.redraw(); }
      if (t.matches('[data-relief-graze]')) { Object.assign(viewer.st, { lightX: -1.5, lightY: 0.25 }); viewer.redraw(); }
    });
    d.addEventListener('input', e => { if (viewer && e.target.matches('[data-relief-amount]')) { viewer.st.relief = parseFloat(e.target.value); viewer.redraw(); } });
    return d;
  }
  const hint = () => viewer && viewer.st.mode === 'light'
    ? L('Arrastra para mover la luz sobre el relieve de la pintura.', 'Drag to move the light across the relief of the paint.')
    : L('Arrastra para girar el cuadro; rueda o pellizco para acercarte; doble clic para verlo de frente.', 'Drag to turn the painting; wheel or pinch to come closer; double-click to face it.');
  function open(id) {
    const p = paintings.find(x => x.id === id);
    if (!available(p)) return;
    const d = dialog();
    d.innerHTML = `<div class="relief-bar"><h2 id="relief-title">${paintField(p, 'title')} <span>· ${L('en relieve', 'in relief')}</span></h2><button class="close" type="button" data-relief-close aria-label="${L('Cerrar', 'Close')}">×</button></div>
      <div class="relief-stage"><canvas id="relief-canvas" tabindex="0" aria-label="${L('Pintura en relieve que se puede girar', 'Painting in relief that can be turned')}"></canvas><p class="relief-status" id="relief-status">${L('Calculando el relieve de las pinceladas…', 'Estimating the relief of the brush strokes…')}</p></div>
      <div class="relief-controls"><div class="share-seg" role="group"><button type="button" data-relief-mode="turn" aria-pressed="true">${L('Girar', 'Turn')}</button><button type="button" data-relief-mode="light" aria-pressed="false">${L('Mover la luz', 'Move the light')}</button></div>
        <label class="share-range">${L('Relieve', 'Relief')}<input type="range" min="0" max="2.5" step="0.05" value="0.6" data-relief-amount></label>
        <div class="relief-buttons"><button type="button" class="secondary" data-relief-graze>${L('Luz rasante', 'Raking light')}</button><button type="button" class="secondary" data-relief-reset>${L('De frente', 'Face on')}</button></div>
        <p class="relief-hint" id="relief-hint"></p>
        <p class="relief-note">${L('Relieve estimado a partir de la fotografía, no escaneado: una primera aproximación al método de Luo, Lu y otros (CVPR 2012).', 'Relief estimated from the photograph, not scanned: a first approximation to the method of Luo, Lu et al. (CVPR 2012).')}</p></div>`;
    d.showModal();
    d.querySelector('#relief-hint').textContent = hint();
    const img = new Image();
    if (!p.image.startsWith('data:')) img.crossOrigin = 'anonymous';
    img.onload = () => setTimeout(() => {
      try {
        const map = heightMap(img, 1024), canvas = d.querySelector('#relief-canvas');
        viewer = start(canvas, map);
        d.querySelector('#relief-status').textContent = viewer ? '' : L('Este navegador no puede mostrar gráficos 3D (WebGL).', 'This browser cannot show 3D graphics (WebGL).');
        d.querySelector('#relief-hint').textContent = hint();
        canvas.focus({ preventScroll: true });
      } catch (err) { d.querySelector('#relief-status').textContent = L('No se pudo preparar el relieve.', 'The relief could not be prepared.'); }
    }, 30);
    img.onerror = () => { d.querySelector('#relief-status').textContent = L('No se pudo cargar la imagen.', 'The image could not be loaded.'); };
    img.src = p.image;
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-relief-open]');
    if (b) return open(b.dataset.reliefOpen);
    // Clicking the painting itself in its detail view also takes it into relief.
    if (e.target.matches('#art-detail > img') && typeof artDetailIndex === 'number' && available(paintings[artDetailIndex])) open(paintings[artDetailIndex].id);
  });

  window.KatabasisRelief = { available, button, open, heightMap };
})();
