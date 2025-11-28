(() => {
  const $ = (id) => document.getElementById(id);
  const safeNum = (v) => {
    if (v === null || v === undefined) return 0;
    if (typeof v === "number") return v;
    let s = String(v).trim();
    s = s.replace("%", "").replace(/\s+/g, "");
    s = s.replace(/[^0-9\.,-]/g, "");
    s = s.replace(",", ".");
    const n = Number(s);
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

  const charts = {};
  function destroyChart(key) {
    if (charts[key]) {
      try {
        charts[key].destroy();
      } catch (e) {}
      delete charts[key];
    }
  }

  function parseDbDate(v) {
    if (!v) return null;
    const d = new Date(v);
    if (isNaN(d)) return null;
    return d;
  }
  function formatDateYMD(d) {
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
  function mesesPt() {
    return [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
  }

  function parseLocalDate(v) {
    if (!v) return null;

    // Formato puro de data: "2025-02-27"
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const [y, m, d] = v.split("-").map(Number);
      return new Date(y, m - 1, d); // <-- sempre local
    }

    // Caso venha com "T" (2025-02-27T00:00:00)
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) {
      const [datePart] = v.split("T");
      const [y, m, d] = datePart.split("-").map(Number);
      return new Date(y, m - 1, d); // <-- ignorar horário
    }

    return null;
  }

  function intensidadeCor(value, max) {
    if (!max || max <= 0) {
      return "rgba(230,240,255,0.35)";
    }
    const ratio = Math.min(1, Math.max(0, value / max));
    const alpha = 0.25 + 0.7 * ratio; // 0.25..0.95
    const r = 15,
      g = 60,
      b = 220;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function roundRect(ctx, x, y, w, h, r = 4, fill = true, stroke = false) {
    if (typeof r === "number") r = { tl: r, tr: r, br: r, bl: r };
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

  async function carregarKPIs() {
    try {
      const [tentativasResp, taxaResp, adminsResp, inativasResp] =
        await Promise.all([
          fetchJson("/acesso/kpi/tentativas"),
          fetchJson("/acesso/kpi/taxa-sucesso"),
          fetchJson("/acesso/kpi/admins"),
          fetchJson("/acesso/kpi/inativas"),
        ]);

      const totalTentativas =
        Array.isArray(tentativasResp) &&
        tentativasResp[0] &&
        tentativasResp[0].total !== undefined
          ? safeNum(tentativasResp[0].total)
          : tentativasResp && tentativasResp.total
          ? safeNum(tentativasResp.total)
          : 0;

      const taxa =
        Array.isArray(taxaResp) && taxaResp[0] && taxaResp[0].taxa !== undefined
          ? safeNum(taxaResp[0].taxa)
          : taxaResp && taxaResp.taxa
          ? safeNum(taxaResp.taxa)
          : 0;

      const admins =
        Array.isArray(adminsResp) &&
        adminsResp[0] &&
        adminsResp[0].total !== undefined
          ? safeNum(adminsResp[0].total)
          : adminsResp && adminsResp.total
          ? safeNum(adminsResp.total)
          : 0;

      const inativas =
        Array.isArray(inativasResp) &&
        inativasResp[0] &&
        inativasResp[0].inativas !== undefined
          ? safeNum(inativasResp[0].inativas)
          : inativasResp && inativasResp.inativas
          ? safeNum(inativasResp.inativas)
          : 0;

      const elK1 = $("kpi1");
      if (elK1) elK1.textContent = totalTentativas;
      const elK2 = $("kpi2");
      if (elK2) elK2.textContent = `${Number(taxa).toFixed(2)}%`;
      const elK3 = $("kpi3");
      if (elK3) elK3.textContent = admins;
      const elK4 = $("kpi4");
      if (elK4) elK4.textContent = inativas;
    } catch (err) {
      console.error("Erro carregarKPIs:", err);
    }
  }

  async function carregarGraficoSucessoFalha() {
    const canvas = $("grafico1");
    if (!canvas) {
      console.warn("grafico1 canvas not found");
      return;
    }

    try {
      const resp = await fetchJson("/acesso/grafico/sucesso-vs-falha");
      const rows = Array.isArray(resp) ? resp : [];

      let sucesso = 0,
        falha = 0;
      rows.forEach((r) => {
        const key = safeNum(r.sucesso);
        const tot = safeNum(r.total);
        if (key === 1) sucesso = tot;
        else falha = tot;
      });

      destroyChart("grafico1");
      const ctx = canvas.getContext("2d");

      charts["grafico1"] = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Sucesso", "Falha"],
          datasets: [
            {
              data: [sucesso, falha],
              backgroundColor: [
                "rgba(75,108,240,0.85)",
                "rgba(233,79,55,0.85)",
              ],
              borderColor: ["#ffffff", "#ffffff"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Sucesso vs Falha (últimos 07 dias)",
              color: "#fff",
              font: {
                size: 16,
                weight: "bold",
              },
            },
            legend: {
              position: "bottom",
              labels: {
                color: "#fff",
              },
            },
          },
        },
      });
    } catch (err) {
      console.error("Erro carregarGraficoSucessoFalha:", err);
    }
  }

  async function carregarGraficoTentativasDia() {
    const canvas = $("graficoAba");
    if (!canvas) {
      console.warn("graficoAba canvas not found");
      return;
    }

    try {
      const resp = await fetchJson("/acesso/grafico/tentativas-dia");
      const rows = Array.isArray(resp) ? resp : [];

      const labels = [];
      const data = [];
      rows.forEach((r) => {
        const key = String(r.dia).split("T")[0];
        const d = parseLocalDate(key);
        labels.push(
          `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`
        );

        data.push(safeNum(r.total));
      });

      destroyChart("graficoAba");
      const ctx = canvas.getContext("2d");

      charts["graficoAba"] = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Tentativas",
              data,
              backgroundColor: "rgba(75,108,240,0.8)",
              borderColor: "#4B6CF0",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              // text: "Tentativas de Login por Dia (últimos 30 dias)",
              color: "#1a1a1a",
              font: {
                size: 18,
                weight: "bold",
              },
            },

            legend: {
              display: false,
              labels: {
                color: "#fff",
              },
            },
          },

          scales: {
            x: {
              title: {
                display: true,
                text: "Data",
                color: "#fff",
                font: { size: 14, weight: "bold" },
              },
              ticks: {
                color: "#fff",
                font: { size: 12 },
              },
              grid: {
                color: "rgba(0,0,0,0.1)",
              },
            },

            y: {
              title: {
                display: true,
                text: "Tentativas",
                color: "#fff",
                font: { size: 14, weight: "bold" },
              },
              ticks: {
                color: "#fff",
                font: { size: 12 },
              },
              beginAtZero: true,
              grid: {
                color: "rgba(0,0,0,0.1)",
              },
            },
          },
        },
      });
      window.graficoAbaRef = charts["graficoAba"];
    } catch (err) {
      console.error("Erro carregarGraficoTentativasDia:", err);
    }
  }

  let heatmapRows = []; // { dia: 'YYYY-MM-DD', total: N }
  let heatmapVisibleMonth = new Date();
  let heatmapCells = [];

  function ensureTooltip() {
    let t = $("heatmapTooltip");
    if (!t) {
      t = document.createElement("div");
      t.id = "heatmapTooltip";
      t.style.position = "absolute";
      t.style.zIndex = 9999;
      t.style.padding = "6px 14px";
      t.style.background = "rgba(0,0,0,0.85)";
      t.style.color = "#fff";
      t.style.borderRadius = "4px";
      t.style.fontSize = "12px";
      t.style.pointerEvents = "none";
      t.style.display = "none";
      document.body.appendChild(t);
    }
    return t;
  }

  async function carregarHeatmapDados() {
    try {
      const resp = await fetchJson("/acesso/grafico/heatmap");
      const rows = Array.isArray(resp) ? resp : [];
      heatmapRows = rows.map((r) => {
        const key = String(r.dia).split("T")[0];
        return {
          dia: key,
          total: safeNum(r.total),
        };
      });
    } catch (err) {
      console.error("Erro carregarHeatmapDados:", err);
      heatmapRows = [];
    }
  }

  function weekdayIndexMondayFirst(day) {
    return (day + 6) % 7;
  }

  function atualizarLabelMes() {
    const label = $("currentMonthLabel");
    if (!label) return;
    const m = heatmapVisibleMonth.getMonth();
    const y = heatmapVisibleMonth.getFullYear();
    label.textContent = `${mesesPt()[m]} ${y}`;
    const title = $("heatmapTitle");
    if (title)
      title.textContent = `Frequência de acessos diária — ${mesesPt()[m]} ${y}`;
  }

  function drawHeatmap(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const parent = canvas.parentElement;
    if (!parent) return;

    const parentRect = parent.getBoundingClientRect();
    const width = Math.max(300, Math.floor(parentRect.width));
    const height = Math.max(160, Math.floor(parentRect.height));
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    atualizarLabelMes();
    const visibleYear = heatmapVisibleMonth.getFullYear();
    const visibleMonth = heatmapVisibleMonth.getMonth();
    const map = {};
    heatmapRows.forEach((r) => {
      const key = r.dia.split("T")[0];
      const d = parseLocalDate(key);
      if (!d) return;
      if (d.getFullYear() === visibleYear && d.getMonth() === visibleMonth) {
        map[formatDateYMD(d)] = safeNum(r.total);
      }
    });

    const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    const rawDay = new Date(visibleYear, visibleMonth, 1).getDay();
    const firstWeekday = weekdayIndexMondayFirst(rawDay);
    const totalSlots = firstWeekday + daysInMonth;
    const weeks = Math.ceil(totalSlots / 7);

    const padding = 6;
    const titleH = 28;
    const gap = 6;
    const cols = 7;
    const rowsCount = weeks;

    const gridWidth = width - padding * 2;
    const gridHeight = height - padding - titleH - 48;

    const totalGapX = (cols - 1) * gap;
    const totalGapY = (rowsCount - 1) * gap;
    let cellW = (gridWidth - totalGapX) / cols;
    let cellH = (gridHeight - totalGapY) / rowsCount;
    let cellSize = Math.max(8, Math.floor(Math.min(cellW, cellH)));

    const gridTotalW = cols * cellSize + totalGapX;
    const gridTotalH = rowsCount * cellSize + totalGapY;
    const offsetX = padding + (gridWidth - gridTotalW) / 2;
    const offsetY = padding + titleH + (gridHeight - gridTotalH) / 2;

    const vals = Object.keys(map).map((k) => map[k]);
    const maxVal = vals.length ? Math.max(...vals) : 0;

    const weekdays = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let c = 0; c < cols; c++) {
      const x = offsetX + c * (cellSize + gap) + cellSize / 2;
      const y = padding + titleH / 2;
      ctx.fillText(weekdays[c], x, y);
    }

    heatmapCells = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const slotIndex = firstWeekday + (d - 1);
      const col = slotIndex % 7;
      const row = Math.floor(slotIndex / 7);

      const x = offsetX + col * (cellSize + gap);
      const y = offsetY + row * (cellSize + gap);

      const dateObj = new Date(visibleYear, visibleMonth, d);
      const key = formatDateYMD(dateObj);
      const count = map[key] || 0;

      const fill = intensidadeCor(count, maxVal);

      ctx.fillStyle = fill;
      roundRect(ctx, x, y, cellSize, cellSize, 4, true, false);

      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.6;
      ctx.strokeRect(x + 0.3, y + 0.3, cellSize - 0.6, cellSize - 0.6);

      heatmapCells.push({
        x,
        y,
        w: cellSize,
        h: cellSize,
        date: dateObj,
        count,
      });

      if (count > 0 && cellSize >= 18) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = `${Math.max(
          10,
          Math.floor(cellSize / 2.6)
        )}px Inter, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(count), x + cellSize / 2, y + cellSize / 2);
      }
    }

    const legendW = 100;
    const legendH = 32;
    const lx = width - padding - legendW;
    const ly = height - padding - legendH;
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    roundRect(ctx, lx, ly, legendW, legendH, 6, true, false);
    ctx.fillStyle = "#ffffff";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Menos", lx + 8, ly + 6);
    ctx.fillText("Mais", lx + legendW - 36, ly + 6);
    const barX = lx + 36,
      barY = ly + 10,
      barW = 52,
      barH = 10;
    const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
    grad.addColorStop(0, intensidadeCor(0, maxVal));
    grad.addColorStop(1, intensidadeCor(maxVal, maxVal));
    ctx.fillStyle = grad;
    roundRect(ctx, barX, barY, barW, barH, 4, true, false);
  }

  function heatmapHitTest(canvas, evt) {
    if (!heatmapCells || heatmapCells.length === 0) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = ((evt.clientX - rect.left) * scaleX) / devicePixelRatio;
    const my = ((evt.clientY - rect.top) * scaleY) / devicePixelRatio;

    for (const c of heatmapCells) {
      if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h)
        return c;
    }
    return null;
  }

  function wireHeatmapEvents(canvas) {
    if (!canvas) return;
    const tooltip = ensureTooltip();
    canvas.addEventListener("mousemove", (e) => {
      const hit = heatmapHitTest(canvas, e);
      if (hit) {
        tooltip.style.display = "block";
        tooltip.style.left = `${e.pageX + 12}px`;
        tooltip.style.top = `${e.pageY + 12}px`;
        const d = hit.date;
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        tooltip.textContent = `${hit.count} login(s) — ${dd}/${mm}/${yyyy}`;
      } else {
        tooltip.style.display = "none";
      }
    });
    canvas.addEventListener("mouseleave", () => {
      const tooltip = ensureTooltip();
      tooltip.style.display = "none";
    });
    window.addEventListener("resize", () => {
      drawHeatmap(canvas);
    });
  }

  async function carregarHeatmap() {
    const canvas = $("heatmapCanvas");
    if (!canvas) {
      console.warn("heatmapCanvas not found");
      return;
    }

    const prev = $("prevMonth");
    const next = $("nextMonth");
    if (prev)
      prev.addEventListener("click", () => {
        heatmapVisibleMonth.setMonth(heatmapVisibleMonth.getMonth() - 1);
        drawHeatmap(canvas);
        atualizarLabelMes();
      });
    if (next)
      next.addEventListener("click", () => {
        heatmapVisibleMonth.setMonth(heatmapVisibleMonth.getMonth() + 1);
        drawHeatmap(canvas);
        atualizarLabelMes();
      });

    try {
      await carregarHeatmapDados();
      atualizarLabelMes();
      drawHeatmap(canvas);
      wireHeatmapEvents(canvas);
    } catch (err) {
      console.error("Erro carregarHeatmap:", err);
    }
  }

  async function init() {
    await carregarKPIs();

    await Promise.all([
      carregarGraficoSucessoFalha(),
      carregarGraficoTentativasDia(),
      carregarHeatmap(),
    ]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  let liveInterval = null;
  const liveButton = document.getElementById("btnLiveMode");
  const liveIndicator = document.getElementById("liveIndicator");

  liveButton.addEventListener("click", () => {
    if (liveInterval) {
      clearInterval(liveInterval);
      liveInterval = null;

      liveButton.classList.remove("active");
      liveIndicator.style.display = "none";

      return;
    }

    liveButton.classList.add("active");
    liveIndicator.style.display = "inline";

    liveInterval = setInterval(() => {
      atualizarDashboard();
    }, 5000);

    atualizarDashboard();
  });

  function atualizarDashboard() {
    carregarKPIs();
    carregarGraficoTentativasDia();
    carregarGraficoSucessoFalha();
    carregarHeatmap();
  }

  const btnRiskAI = document.getElementById("btnRiskAI");
  const modalAI = document.getElementById("modalAI");
  const aiOutput = document.getElementById("aiOutput");
  const closeAI = document.getElementById("closeAI");

  btnRiskAI.addEventListener("click", async () => {
    modalAI.style.display = "flex";
    aiOutput.textContent = "Gerando análise com IA...\nCarregando dados...";

    await gerarAnaliseIA();
  });

  closeAI.addEventListener("click", () => {
    modalAI.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modalAI) modalAI.style.display = "none";
  });

  async function gerarAnaliseIA() {
    let kpi1 = document.getElementById("kpi1").textContent.trim();
    let kpi2 = document.getElementById("kpi2").textContent.trim();
    let kpi3 = document.getElementById("kpi3").textContent.trim();
    let kpi4 = document.getElementById("kpi4").textContent.trim();

    let grafico = window.graficoAbaRef || null;
    let dias = grafico ? grafico.data.labels : [];
    let tentativas = grafico ? grafico.data.datasets[0].data : [];

    const prompt = `
Analise de segurança do sistema CyberBeef:

KPIs:
- Total de tentativas (7 dias): ${kpi1}
- Taxa de sucesso: ${kpi2}
- Contas admin: ${kpi3}
- Contas inativas: ${kpi4}

Atividade por dia:
Dias: ${JSON.stringify(dias)}
Tentativas: ${JSON.stringify(tentativas)}

Gere:
1) Diagnóstico Geral
2) Evidências observadas
3) Riscos potenciais
4) Usuários suspeitos
5) Recomendações críticas

Lembre de não usar *** deixe limpo apenas com o texto
  `;

    try {
      const resp = await fetch("/acesso/ia/analise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await resp.json();
      aiOutput.textContent = data.text || "Erro na análise.";
    } catch (err) {
      aiOutput.textContent = "Erro ao conectar com a IA.";
      console.error(err);
    }
  }

  window.atualizarBarraLateral = function () {
    const barraLateral = document.querySelector(".barra_lateral");
    const elementos = document.getElementById("elementos");
    const butAtual = document.getElementById("but_atualizar_bl");
    if (barraLateral) barraLateral.classList.toggle("ativa");
    if (elementos) elementos.classList.toggle("bl_ativa");
    if (butAtual) {
      butAtual.classList.toggle("bxs-menu-wide");
      butAtual.classList.toggle("bxs-menu-select");
    }
  };
})();
