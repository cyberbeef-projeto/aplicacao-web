var express = require("express");
var router = express.Router();
var alertasController = require("../controllers/alertasController");

router.post("/kpis", function (req, res) {
    alertasController.buscarKpis(req, res);
});

router.post("/tabela", function (req, res) {
    alertasController.buscarTabela(req, res);
});

router.post("/graficoBarras", function (req, res) {
    alertasController.buscarGraficoBarras(req, res);
});

module.exports = router;