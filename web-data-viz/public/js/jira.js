const API_URL = "/jira";

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
        

        document.getElementById("kpi1").innerText = dados.total;

        const elemVar = document.getElementById("kpi1_result");
        const variacao = parseFloat(dados.variacao) || 0;
        
        if (variacao === 0) {
            elemVar.innerHTML = `<span style="color:#ffcc00">Sem variação</span> vs mês anterior`;
        } else {
            const cor = variacao < 0 ? "#4caf50" : "#ff5252";
            const texto = variacao < 0 ? "redução" : "aumento";
            elemVar.innerHTML = `<span style="color:${cor}">${Math.abs(variacao).toFixed(1)}%</span> de ${texto} vs mês anterior`;
        }

        document.getElementById("kpi2").innerText = `${dados.sla}%`;
        
        const csatValor = dados.csat === "N/A" ? "N/A" : `${dados.csat}/5.0`;
        document.getElementById("kpi3").innerText = csatValor;

        const elemBacklog = document.getElementById("kpi4");
        elemBacklog.innerText = dados.backlog;
        elemBacklog.style.color = dados.backlog > 0 ? "#ff5252" : "";

    } catch (erro) {
        console.error("Erro nos KPIs:", erro);
        document.getElementById("kpi1").innerText = "Erro";
        document.getElementById("kpi1_result").innerText = "Falha na conexão";
    }
}

async function carregarGraficos() {
    Chart.defaults.color = '#b8c3e0';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.05)';

    // Gráfico de Incidentes vs Requisições
    const ctx1 = document.getElementById('graficoIncidReq').getContext('2d');
    
    let dadosTipos = { labels: [], incidents: [], requests: [] };
    
        try {
            console.log("Buscando dados de tipos...");
            const res = await fetch(`${API_URL}/tipos`);
            if (res.ok) {
                dadosTipos = await res.json();
                console.log("Dados de tipos recebidos:", dadosTipos);
            } else {
                console.error("Erro ao buscar tipos:", res.status);
            }
        } catch (err) {
            console.error("Erro ao carregar gráfico tipos:", err);
        }
    

    if (dadosTipos.labels.length === 0) {
        console.log("⚠️  Sem dados para gráfico de tipos, usando placeholder");
        dadosTipos = {
            labels: ['Sem dados'],
            incidents: [0],
            requests: [0]
        };
    }

    new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: dadosTipos.labels,
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
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    // Gráfico de Status dos Chamados
    const ctx2 = document.getElementById('graficoStatus').getContext('2d');
    
    const dadosStatus = await fetchStatusReal();

    new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: dadosStatus.labels,
            datasets: [{
                data: dadosStatus.data,
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
                legend: { 
                    position: 'right', 
                    labels: { boxWidth: 12, font: { size: 11 } } 
                }
            }
        }
    });
}

async function fetchStatusReal() {
    try {
        console.log("Buscando status...");
        const res = await fetch(`${API_URL}/status`);
        
        if (!res.ok) {
            throw new Error(`Falha ao buscar status: ${res.status}`);
        }
        
        const dados = await res.json();
        console.log("Status recebidos:", dados);
        return dados;
        
    } catch (e) {
        console.error("Erro ao carregar status:", e);
        return { labels: ["Sem Dados"], data: [1] };
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
        
        // reaplica a ordenação atual sem alternar a direção (evita flip em cada refresh)
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
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" 
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