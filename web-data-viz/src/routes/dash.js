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

module.exports = router;
