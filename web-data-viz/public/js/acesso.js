let dados = [
  { dashboard: "Segurança", recursos: {} },
  { dashboard: "Todas as Máquinas", recursos: {} }
];

const graficosAtivos = {};
let componente = null;

// Utilitários DOM (referências aos elementos existentes no HTML)
const el = id => document.getElementById(id);
const botoescomp = () => document.querySelectorAll("#sel_componentes button");
const campoBusca = () => document.getElementById('pesquisa');
const nomesDashEl = () => document.getElementById('nomes_dash');
const container = () => document.getElementById("cardsContainer");
const botoesKpi = () => document.querySelectorAll('.abas_kpis button');
const kpidesc = i => document.querySelector(`#kpi${i}_desc`);
const kpiresult = i => document.querySelector(`#kpi${i}_result`);
const kpidisp = i => document.querySelector(`#kpi${i}`);

/* -------------------------
   Funções que buscam dados
   ------------------------- */

async function fetchJson(url, opts = {}) {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    console.error("fetchJson erro:", url, e);
    return null;
  }
}

async function trazerDadosDash() {
  // 1) buscar máquinas
  try {
    const maquinas = await fetchJson("/dash/maquinas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenEmpresa: sessionStorage.TOKEN_EMPRESA })
    });
    if (Array.isArray(maquinas)) {
      maquinas.forEach(m => dados.push({ dashboard: m.hostname, recursos: {} }));
    }
  } catch (e) {
    console.error("Erro na requisição de máquinas:", e);
  }

  // 2) buscar dados de segurança (rota principal)
  try {
    const token = encodeURIComponent(sessionStorage.TOKEN_EMPRESA || "");
    const security = await fetchJson(`/usuarios/security?tokenEmpresa=${token}`, { method: "GET", headers: { "Content-Type": "application/json" } });

    if (security) {
      const k = security.kpis || {};
      // grafico1: espera labels + sucesso + falha (ou labels + dados)
      const g1 = security.grafico1 || {};
      const g2 = security.grafico2 || {};
      const g3 = security.grafico3 || {};

      // converter entradas possivelmente faltantes
      const labelsG1 = Array.isArray(g1.labels) ? g1.labels : (Array.isArray(g1.dados) ? g1.dados.map((_,i)=>i) : []);
      const sucesso = g1.sucesso || g1.datasets?.[0]?.data || [];
      const falha = g1.falha || g1.datasets?.[1]?.data || [];

      dados[0].recursos = {
        geral: {
          kpi1: [
          Number(k.tentativas30d ?? 0),
          Number(k.tentativas30d ?? 0) - Number(k.tentativas30dPrev ?? 0)
          ],
          kpi2: [`${Number(k.taxaSucesso ?? 0).toFixed(2)}%`, Number(k.taxaSucesso ?? 0), []],
          kpi3: [k.contasAdmin ?? 0, "N", []],
          kpi4: [k.contasInativas ?? 0, "N", []],
          grafico1: {
            id: "grafico1",
            tipo: "line",
            labels: labelsG1,
            datasets: [
              { label: "Sucesso", data: sucesso },
              { label: "Falha", data: falha }
            ],
            titulo: "Tentativas de Login (últimos 30 dias)",
            xylabels: ["Data", "Tentativas"]
          },
          grafico2: {
            id: "grafico2",
            tipo: "bar",
            labels: Array.isArray(g2.labels) ? g2.labels : (g2.map? g2.map(l=>l.cargo): []),
            dados: Array.isArray(g2.dados) ? g2.dados : (g2.map? g2.map(l=>l.total): []),
            titulo: "Usuários por cargo",
            xylabels: ["Cargo", "Usuários"]
          }
        }
      };
    } else {
      // fallback: vazios para não quebrar UI
      dados[0].recursos = {
        geral: {
          kpi1: [0, "N", []],
          kpi2: ["0%", "N", []],
          kpi3: [0, "N", []],
          kpi4: [0, "N", []],
          grafico1: { id: "grafico1", tipo: "line", labels: [], datasets: [] },
          grafico2: { id: "grafico2", tipo: "bar", labels: [], dados: [] }
        }
      };
    }
  } catch (e) {
    console.error("Erro na requisição de security:", e);
    dados[0].recursos = {
      geral: {
        kpi1: [0, "N", []],
        kpi2: ["0%", "N", []],
        kpi3: [0, "N", []],
        kpi4: [0, "N", []],
        grafico1: { id: "grafico1", tipo: "line", labels: [], datasets: [] },
        grafico2: { id: "grafico2", tipo: "bar", labels: [], dados: [] }
      }
    };
  }

  // 3) preencher "Todas as Máquinas"
  try {
    const kpiTodasResp = await fetchJson("/usuarios/kpisTodas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenEmpresa: sessionStorage.TOKEN_EMPRESA })
    });
    const kpiTodas = Array.isArray(kpiTodasResp) ? (kpiTodasResp[0] || {}) : (kpiTodasResp || {});
    dados[1].recursos = {
      geral: {
        kpi1: [kpiTodas.maquinas ?? 0, "N", []],
        kpi2: [kpiTodas.alertasAtuais ?? 0, (kpiTodas.alertasAtuais ?? 0) - (kpiTodas.alertasPassados ?? 0), []],
        kpi3: [kpiTodas.DiasSemAlertas ?? 0, "N", []],
        kpi4: [kpiTodas.MaquinaMaisAlertas ?? 0, "N", []],
        grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)" },
        grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "3 Máquinas com Mais Alertas (últimos 7 dias)" }
      }
    };
  } catch (e) {
    console.error("Erro na requisição kpisTodas:", e);
  }

  // 4) preencher cada máquina (se existirem)
  for (const maquina of dados.slice(2)) {
    try {
      const resp = await fetchJson("/usuarios/kpisGeral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenEmpresa: sessionStorage.TOKEN_EMPRESA, maquina: maquina.dashboard })
      });
      const kpiGeral = Array.isArray(resp) ? (resp[0] || {}) : (resp || {});
      maquina.recursos['geral'] = {
        kpi1: [kpiGeral.setores ?? 0, "N", []],
        kpi2: [kpiGeral.alertasAtuais ?? 0, (kpiGeral.alertasAtuais ?? 0) - (kpiGeral.alertasPassados ?? 0), []],
        kpi3: [kpiGeral.diasSemAlertas ?? 0, "N", []],
        kpi4: [kpiGeral.ComponenteMaisAlertas ?? 0, "N", []],
        grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)" },
        grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "3 Componentes com Mais Alertas" }
      };
    } catch (e) {
      console.error("Erro ao buscar kpis por máquina:", e);
    }
  }
}

/* -------------------------
   Funções de plotagem
   ------------------------- */

function defaultColor(idx, tipo) {
  const palette = [
    "rgba(75,108,240,0.6)",
    "rgba(233,79,55,0.7)",
    "rgba(110,235,131,0.7)",
    "rgba(255,193,7,0.7)"
  ];
  const color = palette[idx % palette.length];
  if (tipo === 'line') return color.replace(/0\.6|0\.7|0\.7|0\.7/, '0.22');
  return color;
}

function defaultBorder(idx) {
  const borders = ["#4B6CF0", "#E94F37", "#6EEB83", "#FFC107"];
  return borders[idx % borders.length];
}

function gerarBins(dados, binSize = 10) {
  const min = 0;
  const max = 100;
  const nBins = Math.ceil((max - min) / binSize);
  const bins = Array.from({ length: nBins }, (_, i) => ({ x: min + i * binSize, count: 0 }));
  (dados || []).forEach(v => {
    const n = Number(v);
    if (isNaN(n)) return;
    const idx = Math.floor((n - min) / binSize);
    if (bins[idx]) bins[idx].count++;
  });
  return bins;
}

function montarGrafico(cfg) {
  if (!cfg || !cfg.id) return;
  const { id, tipo } = cfg;
  let labels = Array.isArray(cfg.labels) ? cfg.labels.slice() : [];
  let titulo = cfg.titulo || "";
  let xylabels = cfg.xylabels || [];
  let datasets = [];

  if (Array.isArray(cfg.datasets) && cfg.datasets.length > 0) {
    datasets = cfg.datasets.map((ds, i) => ({
      label: ds.label || `Série ${i + 1}`,
      data: ds.data || [],
      backgroundColor: ds.backgroundColor || defaultColor(i, tipo),
      borderColor: ds.borderColor || defaultBorder(i),
      borderWidth: 2,
      fill: tipo === "line"
    }));
  } else if (Array.isArray(cfg.dados) && cfg.dados.length > 0) {
    datasets = [{
      label: titulo || "Valores",
      data: cfg.dados || [],
      backgroundColor: defaultColor(0, tipo),
      borderColor: defaultBorder(0),
      borderWidth: 2,
      fill: tipo === "line"
    }];
  } else {
    // Try detect success/fail style (grafico1 uses sucesso/falha)
    if (Array.isArray(cfg.labels) && cfg.datasets === undefined && cfg.sucesso) {
      datasets = [
        { label: "Sucesso", data: cfg.sucesso || [], backgroundColor: defaultColor(0, 'line'), borderColor: defaultBorder(0), borderWidth: 2, fill: true },
        { label: "Falha", data: cfg.falha || [], backgroundColor: defaultColor(1, 'line'), borderColor: defaultBorder(1), borderWidth: 2, fill: true }
      ];
    } else {
      datasets = [{
        label: titulo || "Sem dados",
        data: [],
        backgroundColor: defaultColor(0, tipo),
        borderColor: defaultBorder(0),
        borderWidth: 2,
        fill: tipo === "line"
      }];
    }
  }

  // histograma support
  let finalType = tipo === "histograma" ? "bar" : tipo;
  if (tipo === "histograma") {
    const bins = gerarBins(cfg.dados || [], cfg.binSize || 10);
    labels = bins.map(b => `${b.x}-${b.x + (cfg.binSize || 10)}`);
    datasets = [{ label: titulo || "Histograma", data: bins.map(b => b.count), backgroundColor: defaultColor(0, "bar"), borderColor: defaultBorder(0) }];
    finalType = "bar";
  }

  const canvas = el(id);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  if (graficosAtivos[id]) graficosAtivos[id].destroy();

  graficosAtivos[id] = new Chart(ctx, {
    type: finalType || 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { boxWidth: 12 } },
        title: { display: Boolean(titulo), text: titulo }
      },
      scales: {
        x: { title: { display: Boolean(xylabels[0]), text: xylabels[0] || '' } },
        y: { beginAtZero: true, title: { display: Boolean(xylabels[1]), text: xylabels[1] || '' } }
      }
    }
  });
}

/* -------------------------
   UI: montar lista e ligações
   ------------------------- */

function textoComparacao(comparacao) {
  if (comparacao === "N" || isNaN(Number(comparacao))) return ["#FFFF", "Veja mais🔍︎"];
  const num = Number(comparacao);
  if (num > 0) return ["#E94F37", `${num} A mais que o período anterior▲`];
  if (num < 0) return ["#6EEB83", `${Math.abs(num)} A menos que o período anterior▼`];
  return ["#FFD447", "Número igual ao período anterior"];
}

function colorirDado(dado) {
  let color = "#ffff";
  const num = (dado.valor + "").replace(/[^0-9.-]/g, '');
  const n = Number(num) || 0;
  if (dado.nome == "Perda de Pacotes") {
    if (n > 5) color = "#E94F37";
    else if (n >= 2.5) color = "#FFD447";
    else color = "#6EEB83";
  }
  if (["CPU", "RAM", "DISCO", "Uso"].includes(dado.nome)) {
    if (n > 90) color = "#E94F37";
    else if (n >= 85) color = "#FFD447";
    else color = "#6EEB83";
  }
  return `<span class="dado-valor" style="color: ${color};">${dado.valor}</span>`;
}

function montarListaDashboardsENomearBotoes() {
  const nomesDash = nomesDashEl();
  nomesDash.innerHTML = '';
  dados.forEach((d, idx) => {
    const div = document.createElement('div');
    div.className = "item clicado";
    div.innerHTML = `<button id="${idx}_dash" class="titulo_dash">${d.dashboard}</button>`;
    nomesDash.appendChild(div);
  });

  // click nos dashboards
  document.querySelectorAll(".titulo_dash").forEach(btn => {
    btn.addEventListener('click', () => {
      const indexDash = parseInt(btn.id.split("_")[0]);
      const dashAtual = dados[indexDash];
      // atualizar título
      document.querySelectorAll("#sel_componentes p")[0].textContent = (dashAtual.dashboard || '').toUpperCase();

      // mostrar/ocultar botões de componente: para segurança usamos apenas 'geral' visível
      Array.from(botoescomp()).forEach(b => {
        if (indexDash === 0 || indexDash === 1) {
          // se for Segurança ou Todas as Máquinas, manter apenas 'geral' visível
          if (b.dataset && b.dataset.comp === 'geral') b.classList.remove('aparente');
          else b.classList.add('aparente');
        } else {
          b.classList.remove('aparente');
        }
      });

      // setar campo de busca
      campoBusca().value = btn.textContent;

      // dispara clique no botão geral disponível
      const geralBtn = Array.from(botoescomp()).find(b => b.dataset && b.dataset.comp === 'geral');
      if (geralBtn) geralBtn.dispatchEvent(new Event('click'));
    });
  });
}

function wireComportamentoBotoesComp() {
  Array.from(botoescomp()).forEach(botao => {
    botao.addEventListener('click', () => {
      // set ativo
      botoescomp().forEach(b => b.classList.remove('ativo'));
      botao.classList.add('ativo');

      // descobrir dashAtual pelo título
      const titleText = (document.querySelectorAll("#sel_componentes p")[0].textContent || '').toUpperCase();
      const dashAtual = dados.find(d => (d.dashboard || '').toUpperCase() === titleText) || dados[0];

      // componente = recurso escolhido pelo data-comp ou fallback geral
      componente = (dashAtual.recursos && dashAtual.recursos[botao.dataset.comp]) || (dashAtual.recursos && dashAtual.recursos['geral']) || {};

      // montar gráficos com o que existir
      try {
        montarGrafico(componente.grafico1 || { id: "grafico1", tipo: "line", labels: [], datasets: [], titulo: "" });
        montarGrafico(componente.grafico2 || { id: "grafico2", tipo: "bar", labels: [], dados: [], titulo: "" });
      } catch (e) {
        console.error("Erro montarGrafico:", e);
      }

      // preencher KPIs
      for (let i = 1; i <= 4; i++) {
        const key = `kpi${i}`;
        const val = (componente && componente[key]) || [0, "N", []];
        // exibição do valor
        const disp = (val[0] !== undefined && val[0] !== null) ? val[0] : 0;
        const elDisp = kpidisp(i);
        if (elDisp) elDisp.textContent = disp;
        // descrição do KPI vem do data attribute do botão clicado
        if (botao.dataset && botao.dataset[`kpi${i}`] && kpidesc(i)) kpidesc(i).textContent = botao.dataset[`kpi${i}`];
        // comparação
        const comp = val[1];
        const [color, text] = textoComparacao(comp);
        if (kpiresult(i)) { kpiresult(i).style.color = color; kpiresult(i).textContent = text; }
      }

      // dispara o clique da aba kpi (primeira) para preencher cards
      const firstKpiBtn = document.querySelector('.abas_kpis button');
      if (firstKpiBtn) firstKpiBtn.dispatchEvent(new Event('click'));
    });
  });
}

function wireAbasKPIs() {
  Array.from(botoesKpi()).forEach(btn => {
    btn.addEventListener('click', () => {
      botoesKpi().forEach(b => b.classList.remove('ativa'));
      btn.classList.add('ativa');

      const bTag = btn.querySelector('b');
      if (!bTag) return;
      const idk = bTag.id; // ex kpi1
      const blocos = (componente && componente[idk] && componente[idk][2]) || [];

      container().innerHTML = '';

      if (!Array.isArray(blocos) || blocos.length === 0) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<h3>Sem dados</h3><div class="dados"><div class="dado-item">Nenhum dado disponível para este cartão.</div></div>`;
        container().appendChild(card);
        return;
      }

      blocos.forEach(bloco => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <h3>${bloco.titulo}</h3>
          <div class="dados">
            ${(bloco.dados || []).map(d => `
              <div class="dado-item">
                <span class="dado-nome">${d.nome}</span>
                ${colorirDado(d)}
              </div>
            `).join('')}
          </div>
        `;
        container().appendChild(card);
      });
    });
  });
}

/* -------------------------
   Inicialização
   ------------------------- */

async function initDashboard() {
  try {
    await trazerDadosDash();       // monta dados[]
    montarListaDashboardsENomearBotoes(); // cria a lista lateral
    wireComportamentoBotoesComp(); // liga botões de componentes
    wireAbasKPIs();                // liga abas de KPI

    // ativar o primeiro dashboard (Segurança)
    setTimeout(() => {
      const first = document.getElementById('0_dash') || document.querySelector('.titulo_dash');
      if (first) first.click();
    }, 50);
  } catch (e) {
    console.error("Erro initDashboard:", e);
  }
}

// Expor função atualizarBarraLateral (mantém sua API original)
function atualizarBarraLateral() {
  const barraLateral = document.querySelector('.barra_lateral');
  const elementos = document.getElementById('elementos');
  const butAtual = document.getElementById('but_atualizar_bl');
  if (barraLateral) barraLateral.classList.toggle('ativa');
  if (elementos) elementos.classList.toggle('bl_ativa');
  if (butAtual) {
    butAtual.classList.toggle('bxs-menu-wide');
    butAtual.classList.toggle('bxs-menu-select');
  }
}

// inicializa quando DOM pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDashboard);
} else {
  initDashboard();
}