var express = require("express");
var router = express.Router();
var alertasController = require("../controllers/alertasController");

router.post("/kpis", function (req, res) {
    alertasController.buscarKpis(req, res);
});

module.exports = router;