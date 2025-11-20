var express = require("express");
var router = express.Router();

var dashController = require("../controllers/dashController");

router.post("/maquinas", function (req, res) {
    dashController.buscarMaquinas(req, res);
});

router.post("/kpisTodas", function (req, res) {
    dashController.buscarKpisTodas(req, res);
});

router.post("/kpisGeral", function (req, res) {
    dashController.buscarKpisGeral(req, res);
});

router.post("/kpisCRD", function (req, res) {
    dashController.buscarKpisCRD(req, res);
});

router.post("/kpisRede", function (req, res) {
    dashController.buscarKpisRede(req, res);
});

router.post("/kpisTodasDesc", function (req, res) {
    dashController.buscarKpisTodasDesc(req, res);
});

router.post("/kpisGeralDesc", function (req, res) {
    dashController.buscarKpisGeralDesc(req, res);
});

router.post("/kpisCRDDesc", function (req, res) {
    dashController.buscarKpisCRDDesc(req, res);
});

router.post("/kpisRedeDesc", function (req, res) {
    dashController.buscarKpisRedeDesc(req, res);
});

router.post("/graficosTodas", function (req, res) {
    dashController.buscarGraficosTodas(req, res);
});

router.post("/graficosGeral", function (req, res) {
    dashController.buscarGraficosGeral(req, res);
});

router.post("/graficosCRD", function (req, res) {
    dashController.buscarGraficosCRD(req, res);
});

router.post("/graficosRede", function (req, res) {
    dashController.buscarGraficosRede(req, res);
});

module.exports = router;
