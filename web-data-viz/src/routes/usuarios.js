var express = require("express");
var router = express.Router();

var usuarioController = require("../controllers/usuarioController");

//Recebendo os dados do html e direcionando para a função cadastrar de usuarioController.js
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/security", function (req, res) {
    usuarioController.autenticar(req, res);
});

router.get("/kpi/tentativas", (req, res) => usuarioController.kpiTentativas(req, res));
router.get("/kpi/taxa-sucesso", (req, res) => usuarioController.kpiTaxaSucesso(req, res));
router.get("/kpi/admin-ativos", (req, res) => usuarioController.kpiAdminAtivos(req, res));
router.get("/kpi/inativos", (req, res) => usuarioController.kpiInativos(req, res));

router.get("/grafico/tentativas-dia", (req, res) => usuarioController.graficoTentativasDia(req, res));
router.get("/grafico/sucesso-vs-falha", (req, res) => usuarioController.graficoSucessoFalha(req, res));
router.get("/grafico/cargos", (req, res) => usuarioController.graficoCargos(req, res));
router.get("/grafico/ativas-vs-inativas", (req, res) => usuarioController.graficoAtivasVsInativas(req, res));


module.exports = router;