var jiraModel = require("../models/jiraModel");

const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
const CSAT_FIELD_ID = process.env.JIRA_CSAT_FIELD;

async function calcularSLA() {
    try {
        const jql = `project = "${PROJECT_KEY}" AND resolved >= -180d`;
        const issues = await jiraModel.fetchIssues(jql, "resolutiondate,created,customfield_10015", 1000);
        
        if (issues.length === 0) return "100.0";
        
        let dentroDoSLA = 0;
        let total = 0;
        
        issues.forEach(issue => {
            const criacao = new Date(issue.fields.created);
            const resolucao = new Date(issue.fields.resolutiondate);
            const tempoResolucao = (resolucao - criacao) / (1000 * 60 * 60);
            const slaAlvo = 24;
            
            if (tempoResolucao <= slaAlvo) dentroDoSLA++;
            total++;
        });
        
        const taxa = total > 0 ? (dentroDoSLA / total) * 100 : 100;
        return taxa.toFixed(1);
        
    } catch (err) {
        console.error("Erro ao calcular SLA:", err.message);
        return "95.0";
    }
}

async function calcularCsat() {
    try {
        const jqlTodos = `project = "${PROJECT_KEY}" AND resolution is not EMPTY`;
        const todosResolvidos = await jiraModel.fetchIssues(jqlTodos, `${CSAT_FIELD_ID},created,resolutiondate`, 100);
        
        if (todosResolvidos.length === 0) return "0.0";
        
        let soma = 0, qtd = 0;
        const notasEncontradas = [];
        
        todosResolvidos.forEach(issue => {
            const val = issue.fields[CSAT_FIELD_ID];
            if (!val) return;
            
            let nota = null;
            
            if (val && typeof val === 'object' && val.rating) {
                nota = parseFloat(val.rating);
            } else if (val && typeof val === 'object' && val.value) {
                nota = parseFloat(val.value);
            } else if (typeof val === 'number') {
                nota = val;
            } else if (typeof val === 'string' && !isNaN(val)) {
                nota = parseFloat(val);
            } else if (val && typeof val === 'object' && val.label) {
                const mapeamento = {
                    'muito satisfeito': 5,
                    'satisfeito': 4,
                    'neutro': 3,
                    'insatisfeito': 2,
                    'muito insatisfeito': 1
                };
                const labelLower = val.label.toLowerCase();
                nota = mapeamento[labelLower];
            }
            
            if (nota && !isNaN(nota) && nota >= 1 && nota <= 5) {
                soma += nota;
                qtd++;
                notasEncontradas.push({ chamado: issue.key, nota });
            }
        });
        
        if (qtd === 0) return "N/A";
        
        const media = (soma / qtd).toFixed(1);
        return media;
        
    } catch (err) {
        console.error("Erro ao calcular CSAT:", err.message);
        return "0.0";
    }
}

async function getKpis(req, res) {
    try {
        const jqlCriados = `project = "${PROJECT_KEY}" AND created >= -30d`;
        const jqlResolvidos = `project = "${PROJECT_KEY}" AND resolved >= -30d`;
        const jqlCritico = `project = "${PROJECT_KEY}" AND resolution is EMPTY AND priority in (High, Highest, Critical)`;
        const jqlAbertos = `project = "${PROJECT_KEY}" AND resolution is EMPTY`;

        const [totalCriados, totalResolvidos, totalCritico, totalAbertos, csatScore, slaScore] = await Promise.all([
            jiraModel.count(jqlCriados),
            jiraModel.count(jqlResolvidos),
            jiraModel.count(jqlCritico),
            jiraModel.count(jqlAbertos),
            calcularCsat(),
            calcularSLA()
        ]);

        res.json({
            totalAbertos: totalAbertos,
            sla: parseFloat(slaScore),
            csat: csatScore,
            backlog: totalCritico
        });

    } catch (error) {
        console.error("Erro ao buscar KPIs:", error.message);
        res.status(500).json({ error: "Erro ao conectar com o Jira" });
    }
}

async function getStatus(req, res) {
    try {
        const jql = `project = "${PROJECT_KEY}" AND resolution is EMPTY`;
        const issues = await jiraModel.fetchIssues(jql, "status", 500);

        const contagem = {};
        issues.forEach(issue => {
            const nomeStatus = issue.fields.status?.name || "Desconhecido";
            contagem[nomeStatus] = (contagem[nomeStatus] || 0) + 1;
        });

        res.json({ 
            labels: Object.keys(contagem), 
            data: Object.values(contagem) 
        });

    } catch (error) {
        console.error("Erro ao buscar status:", error.message);
        res.status(500).json({ error: "Erro ao buscar status" });
    }
}

async function getIncidentsByType(req, res) {
    try {
        const hoje = new Date();
        const seisMesesAtras = new Date(hoje);
        seisMesesAtras.setMonth(hoje.getMonth() - 6);
        
        const jql = `project = "${PROJECT_KEY}" ORDER BY created DESC`;
        const issues = await jiraModel.fetchIssues(jql, "issuetype,created", 1000);

        if (issues.length === 0) {
            return res.json({ 
                labels: ['Sem dados'], 
                incidents: [0], 
                requests: [0] 
            });
        }
        
        const issuesFiltradas = issues.filter(issue => {
            const dataCriacao = new Date(issue.fields.created);
            return dataCriacao >= seisMesesAtras;
        });

        const meses = {};
        const mesesOrdenados = [];
        
        issuesFiltradas.forEach(issue => {
            const dataCriacao = new Date(issue.fields.created);
            const mesAno = `${dataCriacao.getFullYear()}-${String(dataCriacao.getMonth() + 1).padStart(2, '0')}`;
            
            if (!meses[mesAno]) {
                meses[mesAno] = { Incident: 0, Request: 0 };
                mesesOrdenados.push(mesAno);
            }
            
            const tipoOriginal = issue.fields.issuetype?.name || "";
            const tipoLower = tipoOriginal.toLowerCase();
            
            const ehIncidente = 
                tipoLower.includes("incident") || 
                tipoLower.includes("incidente") || 
                tipoLower.includes("bug") || 
                tipoLower.includes("problem") ||
                tipoLower.includes("problema") ||
                tipoLower.includes("falha") ||
                tipoLower.includes("issue");
            
            if (ehIncidente) {
                meses[mesAno].Incident++;
            } else {
                meses[mesAno].Request++;
            }
        });

        mesesOrdenados.sort();
        
        const mesesPt = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const labels = mesesOrdenados.map(m => {
            const [ano, mes] = m.split('-');
            return `${mesesPt[parseInt(mes) - 1]}/${ano.substring(2)}`;
        });

        const dataIncidents = mesesOrdenados.map(m => meses[m].Incident);
        const dataRequests = mesesOrdenados.map(m => meses[m].Request);

        res.json({ labels, incidents: dataIncidents, requests: dataRequests });

    } catch (error) {
        console.error("Erro ao buscar tipos:", error.message);
        res.status(500).json({ 
            labels: ['Erro'], 
            incidents: [0], 
            requests: [0]
        });
    }
}

async function getChamadosEmRisco(req, res) {
    try {
        const jql = `project = "${PROJECT_KEY}" AND resolution is EMPTY ORDER BY created DESC`;
        const issues = await jiraModel.fetchIssues(jql, "summary,assignee,created,status,priority", 500);
        
        function determinarSuporteENivel(nomeStatus) {
            const statusLower = nomeStatus.toLowerCase();
            
            if (statusLower.includes('completado') || statusLower.includes('concluído') || 
                statusLower.includes('resolvido') || statusLower.includes('fechado')) {
                return { nivel: null, filtrar: true };
            }
            
            if (statusLower.includes('n3')) {
                return { nivel: 'N3', filtrar: false };
            } else if (statusLower.includes('n2')) {
                return { nivel: 'N2', filtrar: false };
            } else if (statusLower.includes('n1') || statusLower.includes('triagem')) {
                return { nivel: 'N1', filtrar: false };
            }
            
            return { nivel: 'N1', filtrar: false };
        }
        
        function traduzirPrioridade(prioridadeEn) {
            const prioLower = prioridadeEn.toLowerCase();
            const mapeamento = {
                'highest': 'Crítico',
                'critical': 'Crítico',
                'high': 'Alto',
                'medium': 'Médio',
                'low': 'Baixo',
                'lowest': 'Baixíssimo'
            };
            
            return mapeamento[prioLower] || prioridadeEn;
        }
        
        function corPrioridade(prioridadeEn) {
            const prioLower = prioridadeEn.toLowerCase();
            if (prioLower.includes('highest') || prioLower.includes('critical')) return '#ff5252';
            if (prioLower.includes('high')) return '#ff9800';
            if (prioLower.includes('medium')) return '#ffcc00';
            if (prioLower.includes('low')) return '#4caf50';
            if (prioLower.includes('lowest')) return '#2196f3';
            return '#b8c3e0';
        }
        
        function calcularSLA(prioridadeEn) {
            const prioLower = prioridadeEn.toLowerCase();
            if (prioLower.includes('highest') || prioLower.includes('critical')) return 4;
            if (prioLower.includes('high')) return 8;
            if (prioLower.includes('medium')) return 24;
            if (prioLower.includes('low')) return 48;
            if (prioLower.includes('lowest')) return 72;
            return 24;
        }
        
        function calcularOrdemPrioridade(prioridadeEn) {
            const prioLower = prioridadeEn.toLowerCase();
            if (prioLower.includes('highest') || prioLower.includes('critical')) return 1;
            if (prioLower.includes('high')) return 2;
            if (prioLower.includes('medium')) return 3;
            if (prioLower.includes('low')) return 4;
            if (prioLower.includes('lowest')) return 5;
            return 3;
        }
        
        const chamadosAbertos = [];
        
        issues.forEach(issue => {
            const nomeStatus = issue.fields.status?.name || "Desconhecido";
            const suporteInfo = determinarSuporteENivel(nomeStatus);
            
            if (suporteInfo.filtrar) return;
            
            const criacao = new Date(issue.fields.created);
            const agora = new Date();
            const horasAbertas = Math.floor((agora - criacao) / (1000 * 60 * 60));
            
            const prioridadeOriginal = issue.fields.priority?.name || "Medium";
            const slaHoras = calcularSLA(prioridadeOriginal);
            const horasRestantes = slaHoras - horasAbertas;
            const atrasado = horasRestantes < 0;
            
            let tempoTexto, statusSLA;
            if (atrasado) {
                const horasAtraso = Math.abs(horasRestantes);
                if (horasAtraso < 24) {
                    tempoTexto = `${horasAtraso}h atrasado`;
                } else {
                    const diasAtraso = Math.floor(horasAtraso / 24);
                    const horasResto = horasAtraso % 24;
                    tempoTexto = horasResto > 0 ? 
                        `${diasAtraso}d ${horasResto}h atrasado` : 
                        `${diasAtraso}d atrasado`;
                }
                statusSLA = 'atrasado';
            } else {
                if (horasRestantes < 24) {
                    tempoTexto = `${horasRestantes}h restantes`;
                } else {
                    const diasRestantes = Math.floor(horasRestantes / 24);
                    const horasResto = horasRestantes % 24;
                    tempoTexto = horasResto > 0 ? 
                        `${diasRestantes}d ${horasResto}h restantes` : 
                        `${diasRestantes}d restantes`;
                }
                statusSLA = horasRestantes <= 2 ? 'critico' : 'ok';
            }
            
            chamadosAbertos.push({
                chave: issue.key,
                assunto: issue.fields.summary || "Sem título",
                tecnico: issue.fields.assignee?.displayName || "Não atribuído",
                status: nomeStatus,
                suporte: suporteInfo.nivel,
                prioridade: traduzirPrioridade(prioridadeOriginal),
                prioridadeOriginal: prioridadeOriginal,
                corPrioridade: corPrioridade(prioridadeOriginal),
                prioridadeOrdem: calcularOrdemPrioridade(prioridadeOriginal),
                tempoTexto: tempoTexto,
                horasRestantes: horasRestantes,
                statusSLA: statusSLA,
                horasAbertas: horasAbertas,
                slaHoras: slaHoras
            });
        });
        
        chamadosAbertos.sort((a, b) => a.horasRestantes - b.horasRestantes);
        
        res.json(chamadosAbertos);
        
    } catch (error) {
        console.error("Erro ao buscar chamados abertos:", error.message);
        res.status(500).json([]);
    }
}

module.exports = {
    getKpis,
    getStatus,
    getIncidentsByType,
    getChamadosEmRisco,
    calcularCsat,
    calcularSLA
};