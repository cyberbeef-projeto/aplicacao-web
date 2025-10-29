var express = require("express");
var router = express.Router();

var crudController = require("../controllers/crudController");

router.post("/usuarios", function (req, res) {
    crudController.buscarUsuarios(req, res);
});

router.post("/criarUsuario", function (req, res) {
    crudController.criarUsuario(req, res);
});

module.exports = router;
