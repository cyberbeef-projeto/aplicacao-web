var empresaModel = require("../models/dashEmpresaModel");

function dashboard(req, res) {
    Promise.all([
        empresaModel.obterMetricas(),
        empresaModel.obterEmpresasPorEstado(),
        empresaModel.obterEmpresasPorCidade()
    ])
    .then(([metricas, estados, cidades]) => {

        const m = metricas[0];

        // Churn Rate
        const churn = m.totalInicio === 0 ? 0 : ((m.canceladas / m.totalInicio) * 100).toFixed(2);

        // Growth Rate
        const growth = m.anterior === 0 ? 100 : (((m.atual - m.anterior) / m.anterior) * 100).toFixed(2);

        res.json({
            kpis: {
                totalEmpresas: m.totalEmpresas,
                churnRate: churn,
                novasEmpresas: m.atual,
                growthRate: growth
            },
            graficos: {
                ativos: m.ativas,
                inativos: m.inativas,
                estados: estados,
                cidades: cidades
            }
        });
    })
    .catch((erro) => {
        console.log("Erro ao carregar dados da dashboard", erro);
        res.status(500).json(erro);
    });
}

module.exports = { dashboard };
