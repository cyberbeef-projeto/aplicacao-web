const API_URL = "/jira";
const chartInstances = {
    graficoIncidReq: null,
    graficoStatus: null
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("Sistema iniciado via Backend Node.js");
    carregarKPIs();
    carregarGraficos();
    carregarChamadosAbertos();

    refreshIntervalId = setInterval(() => {
        carregarKPIs();
        carregarGraficos();
        carregarChamadosAbertos();
    }, 6000);

    window.addEventListener('beforeunload', () => {
        if (refreshIntervalId) clearInterval(refreshIntervalId);
    });
});

function atualizarBarraLateral() {
    document.querySelector('.barra_lateral').classList.toggle('ativa');
    document.getElementById('elementos').classList.toggle('bl_ativa');
    document.getElementById('but_atualizar_bl').classList.toggle('clicado');
}

function limparSessao() {
    alert("Sessão encerrada.");
    window.location.reload();
}

async function carregarKPIs() {
    try {
        let dados;
        console.log("Buscando KPIs do backend...");
        const res = await fetch(`${API_URL}/kpis`);

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Erro HTTP ${res.status}:`, errorText);
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        dados = await res.json();
        console.log("KPIs recebidos:", dados);

        // KPI 1: Total de Chamados Abertos
        const totalAbertos = dados.totalAbertos || 0;
        document.getElementById("kpi1").innerText = totalAbertos;

        // Taxa de Sucesso do SLA
        const slaValor = parseFloat(dados.sla) || 0;
        document.getElementById("kpi2").innerText = `${slaValor}%`;

        const elemSla = document.getElementById("kpi2_result");
        if (slaValor >= 93) {
            elemSla.innerHTML = `<span style="color:#4caf50">Excelente</span> - Cumprimento dos prazos`;
        } else if (slaValor >= 80) {
            elemSla.innerHTML = `<span style="color:#ff9800">Regular</span> - Melhorias necessárias`;
        } else {
            elemSla.innerHTML = `<span style="color:#ff5252">Ruim</span> - Atenção urgente`;
        }

        // Satisfação
        if (dados.csat === "N/A") {
            document.getElementById("kpi3").innerText = "N/A";
            document.getElementById("kpi3_result").innerHTML = `<span style="color:#b8c3e0">Sem avaliações</span> - Últimos 6 meses`;
        } else {
            const csatValor = parseFloat(dados.csat);
            document.getElementById("kpi3").innerText = `${csatValor}/5.0`;

            const elemCsat = document.getElementById("kpi3_result");
            if (csatValor >= 5.0) {
                elemCsat.innerHTML = `<span style="color:#4caf50">Excelente</span> - Clientes muito satisfeitos`;
            } else if (csatValor >= 4.0) {
                elemCsat.innerHTML = `<span style="color:#4caf50">Satisfatório</span> - Boa avaliação`;
            } else if (csatValor >= 3.0) {
                elemCsat.innerHTML = `<span style="color:#ff9800">Neutro</span> - Pode melhorar`;
            } else if (csatValor >= 2.0) {
                elemCsat.innerHTML = `<span style="color:#ff5252">Insatisfatório</span> - Atenção necessária`;
            } else {
                elemCsat.innerHTML = `<span style="color:#ff5252">Péssimo</span> - Ação urgente`;
            }
        }

        // Backlog Crítico
        const elemBacklog = document.getElementById("kpi4");
        elemBacklog.innerText = dados.backlog;
        elemBacklog.style.color = dados.backlog > 0 ? "#ff5252" : "#4caf50";

    } catch (erro) {
        console.error("Erro nos KPIs:", erro);
        document.getElementById("kpi1").innerText = "Erro";
        document.getElementById("kpi1_result").innerText = "Falha na conexão";
        document.getElementById("kpi2").innerText = "Erro";
        document.getElementById("kpi2_result").innerText = "Falha na conexão";
        document.getElementById("kpi3").innerText = "Erro";
        document.getElementById("kpi3_result").innerText = "Falha na conexão";
        document.getElementById("kpi4").innerText = "Erro";
    }
}

async function fetchStatusReal() {
    try {
        const res = await fetch(`${API_URL}/status`);
        if (res.ok) {
            return await res.json();
        }
    } catch (err) {
        console.error("Erro ao carregar status:", err);
    }
    return { labels: [], data: [] };
}

async function carregarGraficos() {
    Chart.defaults.color = '#b8c3e0';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    // Gráfico de Incidentes vs Requisições 
    const ctx1 = document.getElementById('graficoIncidReq').getContext('2d');
    
    let dadosTipos = { labels: [], incidents: [], requests: [] };
    
    try {
        const res = await fetch(`${API_URL}/tipos`);
        if (res.ok) {
            dadosTipos = await res.json();
        }
    } catch (err) {
        console.error("Erro ao carregar gráfico tipos:", err);
    }

    if (dadosTipos.labels.length === 0) {
        dadosTipos = {
            labels: ['Sem dados'],
            incidents: [0],
            requests: [0]
        };
    }

    const maxIncidents = Math.max(...dadosTipos.incidents, 0);
    const maxRequests = Math.max(...dadosTipos.requests, 0);
    const maxValue = Math.max(maxIncidents, maxRequests);
    const suggestedMax = Math.ceil(maxValue * 1.15);

    if (chartInstances.graficoIncidReq) {
        chartInstances.graficoIncidReq.destroy();
        chartInstances.graficoIncidReq = null;
    }

    const gradientRed = ctx1.createLinearGradient(0, 0, 0, 300);
    gradientRed.addColorStop(0, "rgba(255, 82, 82, 0.9)");
    gradientRed.addColorStop(1, "rgba(255, 82, 82, 0.3)");

    const gradientBlue = ctx1.createLinearGradient(0, 0, 0, 300);
    gradientBlue.addColorStop(0, "rgba(75, 108, 240, 0.9)");
    gradientBlue.addColorStop(1, "rgba(75, 108, 240, 0.3)");

    chartInstances.graficoIncidReq = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: dadosTipos.labels,
            datasets: [
                {
                    label: 'Incidentes',
                    data: dadosTipos.incidents,
                    backgroundColor: gradientRed,
                    borderRadius: 8,
                    borderWidth: 0
                },
                {
                    label: 'Requisições',
                    data: dadosTipos.requests,
                    backgroundColor: gradientBlue,
                    borderRadius: 8,
                    borderWidth: 0
                }
            ]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#fff',
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#cfd7ff',
                        font: { size: 11 }
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: suggestedMax,
                    ticks: {
                        stepSize: 1,
                        color: '#cfd7ff',
                        font: { size: 11 }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.07)' }
                }
            }
        }
    });

    // Gráfico de Distribuição por Status
    const ctx2 = document.getElementById('graficoStatus').getContext('2d');
    const canvasStatus = document.getElementById('graficoStatus');
    const containerStatus = canvasStatus.parentElement;
    
    const dadosStatus = await fetchStatusReal();

    const mensagemAnterior = containerStatus.querySelector('.mensagem-sem-dados');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }

    const temDados = dadosStatus && 
                     dadosStatus.data && 
                     Array.isArray(dadosStatus.data) && 
                     dadosStatus.data.length > 0 && 
                     dadosStatus.data.some(val => val > 0);
    
    if (!temDados) {
        canvasStatus.style.display = 'none';
        
        const mensagem = document.createElement('div');
        mensagem.className = 'mensagem-sem-dados';
        mensagem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #4caf50;
            font-size: 1.1rem;
            text-align: center;
            padding: 20px;
        `;
        mensagem.textContent = 'Nenhum chamado aberto no momento';
        containerStatus.appendChild(mensagem);
        
        if (chartInstances.graficoStatus) {
            chartInstances.graficoStatus.destroy();
            chartInstances.graficoStatus = null;
        }
    } else {
        canvasStatus.style.display = 'block';
        
        if (chartInstances.graficoStatus) {
            chartInstances.graficoStatus.destroy();
            chartInstances.graficoStatus = null;
        }
        
        chartInstances.graficoStatus = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: dadosStatus.labels,
                datasets: [{
                    data: dadosStatus.data,
                    backgroundColor: [
                        'rgba(255, 82, 82, 0.8)',
                        'rgba(75, 108, 240, 0.8)',
                        'rgba(255, 204, 0, 0.8)',
                        'rgba(160, 102, 255, 0.8)',
                        'rgba(0, 230, 118, 0.8)'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { 
                        position: 'right',
                        labels: {
                            color: '#fff',
                            boxWidth: 12,
                            font: { size: 11 }
                        }
                    }
                }
            }
        });
    }
}

// Chamados Abertos
let chamadosGlobal = [];
let ordenacaoAtual = 'tempo';
let direcaoTempo = 'asc';
let direcaoPrioridade = 'asc';

async function carregarChamadosAbertos() {
    try {
        console.log("Buscando chamados abertos...");
        const res = await fetch(`${API_URL}/risco`);

        if (!res.ok) {
            throw new Error(`Erro HTTP: ${res.status}`);
        }

        chamadosGlobal = await res.json();
        console.log("Chamados abertos recebidos:", chamadosGlobal.length);

        ordenarPor(ordenacaoAtual, false);

    } catch (erro) {
        console.error("Erro ao carregar chamados abertos:", erro);
        const tbody = document.getElementById("tabela-sla-body");
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 20px; color: #ff5252;">
                    Erro ao carregar dados
                </td>
            </tr>
        `;
    }
}

function ordenarPor(tipo, alterarDirecao = true) {
    console.log("Ordenando por:", tipo);

    document.querySelectorAll('.seta-ordem').forEach(seta => {
        seta.classList.remove('ativo');
        seta.textContent = '⇅';
    });

    if (tipo === 'tempo') {
        if (ordenacaoAtual === 'tempo' && alterarDirecao) {
            direcaoTempo = direcaoTempo === 'asc' ? 'desc' : 'asc';
        } else {
            direcaoTempo = 'asc';
        }
        ordenacaoAtual = 'tempo';

        const setaTempo = document.getElementById('seta-tempo');
        setaTempo.classList.add('ativo');

        if (direcaoTempo === 'asc') {
            chamadosGlobal.sort((a, b) => a.horasRestantes - b.horasRestantes);
            setaTempo.textContent = '↓';
            console.log("Tempo: Urgente → Tranquilo");
        } else {
            chamadosGlobal.sort((a, b) => b.horasRestantes - a.horasRestantes);
            setaTempo.textContent = '↑';
            console.log("Tempo: Tranquilo → Urgente");
        }

    } else if (tipo === 'prioridade') {
        if (ordenacaoAtual === 'prioridade' && alterarDirecao) {
            direcaoPrioridade = direcaoPrioridade === 'asc' ? 'desc' : 'asc';
        } else {
            direcaoPrioridade = 'asc';
        }
        ordenacaoAtual = 'prioridade';

        const setaPrioridade = document.getElementById('seta-prioridade');
        setaPrioridade.classList.add('ativo');

        if (direcaoPrioridade === 'asc') {
            chamadosGlobal.sort((a, b) => {
                if (a.prioridadeOrdem !== b.prioridadeOrdem) {
                    return a.prioridadeOrdem - b.prioridadeOrdem;
                }
                return a.horasRestantes - b.horasRestantes;
            });
            setaPrioridade.textContent = '↓';
            console.log("Prioridade: Crítico → Baixíssimo");
        } else {
            chamadosGlobal.sort((a, b) => {
                if (a.prioridadeOrdem !== b.prioridadeOrdem) {
                    return b.prioridadeOrdem - a.prioridadeOrdem;
                }
                return a.horasRestantes - b.horasRestantes;
            });
            setaPrioridade.textContent = '↑';
            console.log("Prioridade: Baixíssimo → Crítico");
        }
    }

    renderizarTabela();
}

function renderizarTabela() {
    const tbody = document.getElementById("tabela-sla-body");
    tbody.innerHTML = "";

    if (chamadosGlobal.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; color: #4caf50;">
                Nenhum chamado aberto no momento
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    console.log("Renderizando", chamadosGlobal.length, "chamados");
    console.log("Primeiro:", chamadosGlobal[0].chave, "- Prioridade:", chamadosGlobal[0].prioridade, "- Tempo:", chamadosGlobal[0].tempoTexto);

    chamadosGlobal.forEach(chamado => {
        const tr = document.createElement("tr");

        const badgeSuporteColor =
            chamado.suporte === 'N1' ? '#4B6CF0' :
                chamado.suporte === 'N2' ? '#ffcc00' :
                    chamado.suporte === 'N3' ? '#ff5252' : '#b8c3e0';

        let corTempo;
        if (chamado.statusSLA === 'atrasado') {
            corTempo = '#ff5252';
        } else if (chamado.statusSLA === 'critico') {
            corTempo = '#ff9800';
        } else {
            corTempo = '#4caf50';
        }

        tr.innerHTML = `
            <td><strong>${chamado.chave}</strong></td>
            <td style="max-width: 300px; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;" 
            title="${chamado.assunto}">
            ${chamado.assunto}
            </td>
            <td>${chamado.tecnico}</td>
            <td>${chamado.status}</td>
            <td>
                <span style="
                    background-color: ${badgeSuporteColor}; 
                    color: white; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-weight: bold;
                    font-size: 0.85rem;
                ">
                    ${chamado.suporte}
                </span>
            </td>
            <td>
                <span style="color: ${chamado.corPrioridade}; font-weight: bold;">
                    ${chamado.prioridade}
                </span>
            </td>
            <td>
                <span style="color: ${corTempo}; font-weight: bold;">
                    ${chamado.tempoTexto}
                </span>
            </td>
        `;
        tbody.appendChild(tr);
    });
}