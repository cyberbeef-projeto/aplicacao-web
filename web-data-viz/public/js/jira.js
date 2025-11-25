// =========================================================================
// CONFIGURAÇÕES
// =========================================================================

const MODO_SIMULACAO = false;
const API_URL = "/jira";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema iniciado via Backend Node.js");
    carregarKPIs();
    carregarGraficos();
});

// Funções de interação da Barra Lateral (Mantedas do seu original)
function atualizarBarraLateral() {
    document.querySelector('.barra_lateral').classList.toggle('ativa');
    document.getElementById('elementos').classList.toggle('bl_ativa');
    document.getElementById('but_atualizar_bl').classList.toggle('clicado');
}

function limparSessao() {
    alert("Sessão encerrada.");
    window.location.reload();
}

// =========================================================================
// 2. CARREGAMENTO DOS KPIS
// =========================================================================

async function carregarKPIs() {
    try {
        let dados;

        if (MODO_SIMULACAO) {
            dados = { total: 99, variacao: 10, sla: 100, csat: 5.0, backlog: 0 };
        } else {
            // Chama a rota criada no backend
            const res = await fetch(`${API_URL}/kpis`);
            if (!res.ok) throw new Error(`Erro HTTP: ${res.status}`);
            dados = await res.json();
        }

        // Atualiza HTML
        document.getElementById("kpi1").innerText = dados.total;

        // Lógica da Variação
        const elemVar = document.getElementById("kpi1_result");
        // Verifica se variacao existe e é número
        const variacao = parseFloat(dados.variacao) || 0;
        const seta = variacao < 0 ? "🟢" : "🔴";
        const cor = variacao < 0 ? "#4caf50" : "#ff5252";
        elemVar.innerHTML = `<span style="color:${cor}">${seta} ${Math.abs(variacao)}%</span> vs mês anterior`;

        document.getElementById("kpi2").innerText = `${dados.sla}%`;
        document.getElementById("kpi3").innerText = `${dados.csat}/5`;

        const elemBacklog = document.getElementById("kpi4");
        elemBacklog.innerText = dados.backlog;
        if (dados.backlog > 0) elemBacklog.style.color = "#ff5252";

    } catch (erro) {
        console.error("Erro nos KPIs:", erro);
        document.getElementById("kpi1").innerText = "-";
        document.getElementById("kpi1_result").innerText = "Erro de conexão";
    }
}

// =========================================================================
// 3. CARREGAMENTO DOS GRÁFICOS
// =========================================================================

async function carregarGraficos() {
    // Configurações globais de estilo
    Chart.defaults.color = '#b8c3e0';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    // --- GRÁFICO 1: INCIDENTES VS REQUISIÇÕES () ---
    async function carregarGraficos() {
        Chart.defaults.color = '#b8c3e0';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

        // --- GRÁFICO 1: INCIDENTES VS REQUISIÇÕES (AGORA DINÂMICO) ---
        const ctx1 = document.getElementById('graficoIncidReq').getContext('2d');

        // Busca dados reais
        let dadosTipos = { labels: [], incidents: [], requests: [] };
        try {
            const res = await fetch(`${API_URL}/tipos`);
            if (res.ok) dadosTipos = await res.json();
        } catch (err) { console.error("Erro ao carregar gráfico tipos", err); }

        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: dadosTipos.labels, // Meses reais
                datasets: [
                    {
                        label: 'Incidentes',
                        data: dadosTipos.incidents,
                        backgroundColor: '#ff5252'
                    },
                    {
                        label: 'Requisições',
                        data: dadosTipos.requests,
                        backgroundColor: '#4B6CF0'
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        // --- GRÁFICO 2: STATUS DOS CHAMADOS (Conectado ao Backend) ---
        const ctx2 = document.getElementById('graficoStatus').getContext('2d');

        // Busca os dados do backend
        const dadosStatus = await fetchStatusReal();

        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: dadosStatus.labels, // Vem do Node.js
                datasets: [{
                    data: dadosStatus.data, // Vem do Node.js
                    backgroundColor: ['#ff5252', '#4B6CF0', '#ffcc00', '#a066ff', '#00e676'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
                }
            }
        });
    }

    // Função Auxiliar para buscar dados do gráfico
    async function fetchStatusReal() {
        if (MODO_SIMULACAO) return { labels: ["Teste A", "Teste B"], data: [10, 20] };

        try {
            const res = await fetch(`${API_URL}/status`);
            if (!res.ok) throw new Error("Falha ao buscar status");
            return await res.json();
        } catch (e) {
            console.error("Erro ao carregar status:", e);
            return { labels: ["Erro"], data: [1] }; // Retorna dado vazio para não quebrar o gráfico
        }
    }
}