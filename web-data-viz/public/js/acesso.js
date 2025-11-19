// acesso.js
// JavaScript para Dashboard de Acesso (Sucesso vs Falha, Tentativas por dia, Heatmap estilo "commits")
// Requer Chart.js (já incluído no HTML)

(() => {
  // -----------------------
  // Helpers
  // -----------------------
  const byId = id => document.getElementById(id);
  const safeNum = v => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    const n = Number(String(v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  async function fetchJson(url, opts = {}) {
    try {
      const r = await fetch(url, opts);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (err) {
      console.error(`fetchJson error ${url}:`, err);
      return null;
    }
  }

  // Destroy chart safely
  const charts = {};
  function destroyChart(key) {
    if (charts[key]) {
      try { charts[key].destroy(); } catch (e) {}
      delete charts[key];
    }
  }

  // Texto comparação KPI
  function textoComparacao(comparacao) {
    if (comparacao === "N" || isNaN(Number(comparacao))) return ["#FFFF", "Veja mais🔍︎"];
    const num = Number(comparacao);
    if (num > 0) return ["#E94F37", `${num} A mais que o período anterior▲`];
    if (num < 0) return ["#6EEB83", `${Math.abs(num)} A menos que o período anterior▼`];
    return ["#FFD447", "Número igual ao período anterior"];
  }

  // Color map para heatmap (tons de azul)
  function colorForIntensity(value, max) {
    // value between 0..max
    if (max <= 0) return 'rgba(230,240,255,0.5)'; // very light
    const ratio = Math.min(1, Math.max(0, value / max));
    // from very light to deep blue:
    // use rgba with alpha scaled so background remains visible
    const alpha = 0.25 + (0.7 * ratio); // 0.25..0.95
    const r = 15, g = 60, b = 220;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Format date yyyy-mm-dd
  function formatDateYMD(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  // Parse DB date (returned as ISO string or Date object)
  function parseDbDate(v) {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d)) return null;
    return d;
  }

  // -----------------------
  // Carregar KPIs
  // -----------------------
  async function carregarKPIs() {
    try {
      // total tentativas
      const totalResp = await fetchJson('/acesso/kpi/tentativas');
      const total = Array.isArray(totalResp) && totalResp[0] && totalResp[0].total !== undefined
        ? safeNum(totalResp[0].total) : 0;

      // taxa sucesso
      const taxaResp = await fetchJson('/acesso/kpi/taxa-sucesso');
      const taxaVal = Array.isArray(taxaResp) && taxaResp[0] && (taxaResp[0].taxa !== undefined)
        ? safeNum(taxaResp[0].taxa) : 0;

      // admins ativos
      const adminsResp = await fetchJson('/acesso/kpi/admins');
      const admins = Array.isArray(adminsResp) && adminsResp[0] && adminsResp[0].total !== undefined
        ? safeNum(adminsResp[0].total) : 0;

      // inativas vs ativas
      const inativasResp = await fetchJson('/acesso/kpi/inativas');
      const inativas = Array.isArray(inativasResp) && inativasResp[0] && inativasResp[0].inativas !== undefined
        ? safeNum(inativasResp[0].inativas) : (inativasResp && inativasResp.inativas ? safeNum(inativasResp.inativas) : 0);
      const ativas = Array.isArray(inativasResp) && inativasResp[0] && inativasResp[0].ativas !== undefined
        ? safeNum(inativasResp[0].ativas) : (inativasResp && inativasResp.ativas ? safeNum(inativasResp.ativas) : 0);

      // write into DOM if elements exist
      const elK1 = byId('kpi1'); if (elK1) elK1.textContent = total;
      const elK2 = byId('kpi2'); if (elK2) elK2.textContent = `${taxaVal.toFixed(2)}%`;
      const elK3 = byId('kpi3'); if (elK3) elK3.textContent = admins;
      const elK4 = byId('kpi4'); if (elK4) elK4.textContent = inativas;

      const r2 = byId('kpi2_result'); if (r2) { r2.style.color = '#FFD447'; r2.textContent = `Taxa atual: ${taxaVal.toFixed(2)}%`; }
      const r1 = byId('kpi1_result'); if (r1) { r1.style.color = '#FFFF'; r1.textContent = `Últimos 30 dias: ${total}`; }
      const r3 = byId('kpi3_result'); if (r3) { r3.style.color = '#FFFF'; r3.textContent = `Admins: ${admins}`; }
      const r4 = byId('kpi4_result'); if (r4) { r4.style.color = '#FFFF'; r4.textContent = `Inativas: ${inativas}`; }

    } catch (err) {
      console.error("Erro ao carregar KPIs:", err);
    }
  }

  // -----------------------
  // Gráfico: Sucesso vs Falha (pie or doughnut)
  // -----------------------
  async function carregarGraficoSucessoFalha() {
    const canvas = byId('grafico1');
    if (!canvas) { console.warn('canvas grafico1 não encontrado'); return; }
    try {
      const data = await fetchJson('/acesso/grafico/sucesso-vs-falha');
      if (!Array.isArray(data)) {
        console.warn('grafico/sucesso-vs-falha retornou formato inesperado', data);
      }
      // map success=1 and success=0 (DB returns rows for each sucesso value)
      let sucessoCount = 0, falhaCount = 0;
      (data || []).forEach(r => {
        const suc = safeNum(r.sucesso);
        const tot = safeNum(r.total);
        if (suc === 1) sucessoCount = tot;
        else falhaCount = tot;
      });

      destroyChart('grafico1');
      const ctx = canvas.getContext('2d');

      charts['grafico1'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Sucesso', 'Falha'],
          datasets: [{
            data: [sucessoCount, falhaCount],
            backgroundColor: ['rgba(75,108,240,0.85)', 'rgba(233,79,55,0.85)'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Distribuição: Sucesso vs Falha (últimos 30 dias)' },
            legend: { position: 'bottom' }
          }
        }
      });
    } catch (err) {
      console.error('Erro carregarGraficoSucessoFalha:', err);
    }
  }

  // -----------------------
  // Gráfico: Tentativas por dia (coluna)
  // -----------------------
  async function carregarGraficoTentativasDia() {
    const canvas = byId('graficoAba');
    if (!canvas) { console.warn('canvas graficoAba não encontrado'); return; }
    try {
      const rows = await fetchJson('/acesso/grafico/tentativas-dia');
      const labels = [];
      const dados = [];
      if (Array.isArray(rows)) {
        rows.forEach(r => {
          const d = parseDbDate(r.dia);
          labels.push(d ? formatDateYMD(d) : String(r.dia));
          dados.push(safeNum(r.total));
        });
      }

      destroyChart('graficoAba');
      const ctx = canvas.getContext('2d');
      charts['graficoAba'] = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Tentativas',
            data: dados,
            backgroundColor: 'rgba(75,108,240,0.8)',
            borderColor: '#4B6CF0',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Tentativas de Login por Dia (últimos 30 dias)' },
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            x: { title: { display: true, text: 'Data' } },
            y: { title: { display: true, text: 'Tentativas' }, beginAtZero: true }
          }
        }
      });
    } catch (err) {
      console.error('Erro carregarGraficoTentativasDia:', err);
    }
  }

  // -----------------------
  // Gráfico: Cargos (barra) - NOT USED as requested, but we can load in background (kept minimal)
  // -----------------------
  async function carregarGraficoCargos() {
    // Not plotted in the current layout (user asked only for 3 charts).
    // Keep function for future use if needed.
    try {
      const rows = await fetchJson('/acesso/grafico/cargos');
      return rows;
    } catch (err) {
      console.error('Erro carregarGraficoCargos:', err);
      return null;
    }
  }

  // -----------------------
  // Heatmap (canvas) - estilo "commits" do GitHub
  // - usa /acesso/grafico/heatmap que retorna [{ dia: date, total: n }, ...]
  // - desenha os últimos N dias em colunas por semana
  // -----------------------
  async function carregarHeatmap() {
    const canvas = byId('heatmapCanvas');
    if (!canvas) { console.warn('canvas heatmapCanvas não encontrado'); return; }
    try {
      const rows = await fetchJson('/acesso/grafico/heatmap');
      // Normalizar rows para um mapa dia->total (string yyyy-mm-dd)
      const map = {};
      (rows || []).forEach(r => {
        const d = parseDbDate(r.dia);
        if (!d) return;
        const key = formatDateYMD(d);
        map[key] = safeNum(r.total);
      });

      // We'll display last 90 days (13 weeks) — adjust as necessary
      const DAYS = 90;
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - (DAYS - 1)); // inclusive
      // Build an array of dates
      const dates = [];
      for (let i = 0; i < DAYS; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        dates.push(d);
      }

      // Group into weeks (columns of 7 days). We'll render vertical weeks
      const weeks = [];
      for (let i = 0; i < dates.length; i += 7) {
        weeks.push(dates.slice(i, i + 7));
      }

      // compute max value for color scaling
      const values = Object.values(map);
      const max = values.length ? Math.max(...values) : 0;

      // Draw on canvas
      // set sizes: columns = weeks.length, rows = up to 7
      const cols = weeks.length;
      const rowsCount = 7;
      const padding = 8;
      const cellGap = 4;

      // cell size compute based on canvas parent box for responsiveness
      const parent = canvas.parentElement;
      const parentRect = parent ? parent.getBoundingClientRect() : { width: 360, height: 200 };
      // We'll set canvas width/height explicitly
      const canvasWidth = Math.max(260, Math.floor(parentRect.width));
      const canvasHeight = Math.max(140, Math.floor(parentRect.height));
      canvas.width = canvasWidth * devicePixelRatio;
      canvas.height = canvasHeight * devicePixelRatio;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(devicePixelRatio, devicePixelRatio);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw title
      const title = 'Heatmap de Logins (últimos 90 dias)';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textBaseline = 'top';
      ctx.fillText(title, padding, padding);

      // compute area for grid below title
      const topArea = padding + 22;
      const gridHeight = canvasHeight - topArea - padding;
      const gridWidth = canvasWidth - padding * 2;

      // Determine cell size
      const usableCols = Math.max(1, cols);
      const usableRows = rowsCount;
      // cell width with gaps:
      const totalGapX = (usableCols - 1) * cellGap;
      const totalGapY = (usableRows - 1) * cellGap;
      let cellW = (gridWidth - totalGapX) / usableCols;
      let cellH = (gridHeight - totalGapY) / usableRows;
      // Keep square-ish
      const cellSize = Math.max(8, Math.min(cellW, cellH));
      // Recompute starting offsets to center grid
      const gridTotalW = usableCols * cellSize + totalGapX;
      const gridTotalH = usableRows * cellSize + totalGapY;
      const offsetX = padding + (gridWidth - gridTotalW) / 2;
      const offsetY = topArea + (gridHeight - gridTotalH) / 2;

      // Draw each cell
      for (let c = 0; c < usableCols; c++) {
        const week = weeks[c] || [];
        for (let rIdx = 0; rIdx < usableRows; rIdx++) {
          const day = week[rIdx];
          const x = offsetX + c * (cellSize + cellGap);
          const y = offsetY + rIdx * (cellSize + cellGap);

          let key = null;
          let count = 0;
          if (day) {
            key = formatDateYMD(day);
            count = map[key] || 0;
          } else {
            count = 0;
          }

          const fill = colorForIntensity(count, max);
          // border/stroke for better separation
          ctx.fillStyle = fill;
          roundRect(ctx, x, y, cellSize, cellSize, 3, true, false);
          // optional small stroke
          ctx.strokeStyle = 'rgba(255,255,255,0.06)';
          ctx.lineWidth = 0.6;
          ctx.strokeRect(x + 0.3, y + 0.3, cellSize - 0.6, cellSize - 0.6);

          // if count > 0, draw small number when space allows
          if (count > 0 && cellSize >= 18) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `${Math.max(9, Math.floor(cellSize / 3))}px Inter, sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(String(count), x + cellSize / 2, y + cellSize / 2);
          }
        }
      }

      // legend bottom-right
      const legendW = 110, legendH = 28;
      const lx = canvasWidth - padding - legendW;
      const ly = canvasHeight - padding - legendH;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      roundRect(ctx, lx, ly, legendW, legendH, 6, true, false);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Menos', lx + 8, ly + 6);
      ctx.fillText('Mais', lx + legendW - 36, ly + 6);
      // draw gradient bar
      const barX = lx + 36, barY = ly + 10, barW = 52, barH = 10;
      const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, colorForIntensity(0, max));
      grad.addColorStop(1, colorForIntensity(max, max));
      ctx.fillStyle = grad;
      roundRect(ctx, barX, barY, barW, barH, 3, true, false);

    } catch (err) {
      console.error('Erro carregarHeatmap:', err);
    }
  }

  // rounded rectangle helper
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
    ctx.beginPath();
    ctx.moveTo(x + r.tl, y);
    ctx.lineTo(x + w - r.tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    ctx.lineTo(x + w, y + h - r.br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    ctx.lineTo(x + r.bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    ctx.lineTo(x, y + r.tl);
    ctx.quadraticCurveTo(x, y, x + r.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  // -----------------------
  // Inicialização
  // -----------------------
  async function init() {
    // attempt to load KPIs and charts in parallel
    await carregarKPIs();

    // Load charts (heatmap may be heavier)
    await Promise.all([
      carregarGraficoSucessoFalha(),
      carregarGraficoTentativasDia(),
      carregarHeatmap()
    ]);
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // expose atualizarBarraLateral function (HTML calls it)
  window.atualizarBarraLateral = function () {
    const barraLateral = document.querySelector('.barra_lateral');
    const elementos = document.getElementById('elementos');
    const butAtual = document.getElementById('but_atualizar_bl');
    if (barraLateral) barraLateral.classList.toggle('ativa');
    if (elementos) elementos.classList.toggle('bl_ativa');
    if (butAtual) {
      butAtual.classList.toggle('bxs-menu-wide');
      butAtual.classList.toggle('bxs-menu-select');
    }
  };

})();
