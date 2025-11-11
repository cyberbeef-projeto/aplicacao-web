var express = require("express");
var router = express.Router();

var dashController = require("../controllers/dashController");

router.post("/maquinas", function (req, res) {
    dashController.buscarMaquinas(req, res);
});

router.post("/kpisTodas", function (req, res) {
    dashController.buscarKpisTodas(req, res);
});

module.exports = router;
