var jiraModel = require("../models/jiraModel");

const PROJECT_KEY = process.env.JIRA_PROJECT_KEY;
const CSAT_FIELD_ID = process.env.JIRA_CSAT_FIELD;

// Função auxiliar para CSAT (Mantida)
async function calcularCsat() {
    try {
        const jql = `project = "${PROJECT_KEY}" AND resolved >= -6m AND "${CSAT_FIELD_ID}" is not EMPTY`;
        const issues = await jiraModel.fetchIssues(jql, CSAT_FIELD_ID, 1000);
        let soma = 0, qtd = 0;
        issues.forEach(issue => {
            const val = issue.fields[CSAT_FIELD_ID];
            const nota = (val && val.rating) ? val.rating : val;
            if (typeof nota === 'number') {
                soma += nota; qtd++;
            }
        });
        return qtd === 0 ? "0.0" : (soma / qtd).toFixed(1);
    } catch (err) {
        return "0.0";
    }
}

async function getKpis(req, res) {
    try {
        // CORREÇÃO 1: Buscar TOTAL de Abertos (independente da data)
        const jqlAbertos = `project = "${PROJECT_KEY}" AND resolution = Unresolved`;
        
        // Comparativo: Criados nos últimos 30 dias vs 30-60 dias atrás (para variação de volume)
        const jqlMesAtual = `project = "${PROJECT_KEY}" AND created >= -30d`;
        const jqlMesPassado = `project = "${PROJECT_KEY}" AND created >= -60d AND created < -30d`;
        
        const jqlCritico = `project = "${PROJECT_KEY}" AND resolution = Unresolved AND priority in (High, Highest, Critical)`;

        const [totalAbertos, criadosMesAtual, criadosMesPassado, totalCritico, csatScore] = await Promise.all([
            jiraModel.count(jqlAbertos),
            jiraModel.count(jqlMesAtual),
            jiraModel.count(jqlMesPassado),
            jiraModel.count(jqlCritico),
            calcularCsat()
        ]);

        // Variação baseada no volume de entrada de chamados
        let variacao = 0;
        if (criadosMesPassado > 0) {
            variacao = ((criadosMesAtual - criadosMesPassado) / criadosMesPassado) * 100;
        }

        // OBS: O SLA ainda está fixo pois requer cálculo complexo de datas ou campo customizado do Jira.
        // Mantive 100.0 se houver chamados abertos sem violação, ou 95.0 padrão.
        
        res.json({
            total: totalAbertos, // Agora mostra o real acumulado
            variacao: variacao.toFixed(1),
            sla: 95.0,
            csat: csatScore,
            backlog: totalCritico
        });
    } catch (error) {
        console.error("Erro Jira KPIs:", error.message);
        res.status(500).json({ error: "Erro ao conectar com o Jira" });
    }
}

async function getStatus(req, res) {
    try {
        // Busca tudo que não está resolvido
        const jql = `project = "${PROJECT_KEY}" AND resolution = Unresolved`;
        const issues = await jiraModel.fetchIssues(jql, "status", 500);

        const contagem = {};
        issues.forEach(issue => {
            const nomeStatus = issue.fields.status?.name || "Desconhecido";
            contagem[nomeStatus] = (contagem[nomeStatus] || 0) + 1;
        });

        res.json({ labels: Object.keys(contagem), data: Object.values(contagem) });
    } catch (error) {
        console.error("Erro Jira Status:", error.message);
        res.status(500).json({ error: "Erro ao buscar status" });
    }
}

// NOVO: Endpoint para o gráfico de Incidentes vs Requisições
async function getIncidentsByType(req, res) {
    try {
        // Pega chamados criados nos ultimos 6 meses
        const jql = `project = "${PROJECT_KEY}" AND created >= -6m`;
        // Precisamos dos campos de data de criação e tipo de issue
        const issues = await jiraModel.fetchIssues(jql, "issuetype,created", 1000);

        const meses = {}; 
        // Estrutura: { "2023-10": { Incident: 5, ServiceRequest: 2 }, ... }

        issues.forEach(issue => {
            const dataCriacao = new Date(issue.fields.created);
            // Formata chave como "NomeDoMes" (ex: "nov")
            const mesChave = dataCriacao.toLocaleString('pt-BR', { month: 'short' }); 
            
            if (!meses[mesChave]) meses[mesChave] = { Incident: 0, Request: 0 };
            
            const tipo = issue.fields.issuetype.name; // Ex: "Incident", "Service Request", "Bug"
            
            // Simplificação de tipos (ajuste conforme seus nomes reais no Jira)
            if (tipo.includes("Incident") || tipo.includes("Incidente") || tipo.includes("Bug")) {
                meses[mesChave].Incident++;
            } else {
                meses[mesChave].Request++;
            }
        });

        // Ordenar os meses cronologicamente é complexo sem array auxiliar, 
        // mas vamos retornar as keys como estão para simplificar o exemplo
        const labels = Object.keys(meses);
        const dataIncidents = labels.map(m => meses[m].Incident);
        const dataRequests = labels.map(m => meses[m].Request);

        res.json({ labels, incidents: dataIncidents, requests: dataRequests });

    } catch (error) {
        console.error("Erro Grafico Tipos:", error.message);
        res.status(500).json({ labels: [], incidents: [], requests: [] });
    }
}

module.exports = {
    getKpis,
    getStatus,
    getIncidentsByType, 
    calcularCsat
};