var express = require("express");
var router = express.Router();
var disponibilidadeController = require("../controllers/disponibilidadeController");

router.get("/kpis-geral", function (req, res) {
    disponibilidadeController.buscarKpis(req, res);
});

router.get("/status-atual/:idMaquina", function (req, res) {
    disponibilidadeController.buscarStatusRecursos(req, res);
});

router.get("/graficos", function (req, res) {
    disponibilidadeController.buscarGraficos(req, res);
});

router.get("/global", function (req, res) {
    disponibilidadeController.buscarDisponibilidade(req, res);
});

module.exports = router;