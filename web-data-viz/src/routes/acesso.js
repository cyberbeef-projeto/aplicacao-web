var express = require("express");
var router = express.Router();
var acessoController = require("../controllers/acessoController");

// KPIs
router.get("/kpi/inativas", acessoController.kpiInativas);
router.get("/kpi/tentativas", acessoController.kpiTotalTentativas);
router.get("/kpi/taxa-sucesso", acessoController.kpiTaxaSucesso);
router.get("/kpi/admins", acessoController.kpiAdminsAtivos);

// GRÁFICOS
router.get("/grafico/tentativas-dia", acessoController.graficoTentativasDia);
router.get("/grafico/sucesso-vs-falha", acessoController.graficoSucessoFalha);
router.get("/grafico/cargos", acessoController.graficoCargos);
router.get("/grafico/heatmap", acessoController.graficoHeatmap);

module.exports = router;