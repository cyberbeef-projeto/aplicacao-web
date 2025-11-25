var express = require("express");
var router = express.Router();

var crudController = require("../controllers/crudController");

router.post("/usuarios", function (req, res) {
    crudController.buscarUsuarios(req, res);
});

router.post("/criarUsuario", function (req, res) {
    crudController.criarUsuario(req, res);
});

router.post("/editarUsuario", function (req, res) {
    crudController.editarUsuario(req, res);
});

router.post("/maquinas", function (req, res) {
    crudController.buscarMaquinas(req, res);
});

router.post("/editarMaquina", function (req, res) {
    crudController.editarMaquina(req, res);
});

router.post("/setores", function (req, res) {
    crudController.buscarSetores(req, res);
});

router.post("/editarSetor", function (req, res) {
    crudController.editarSetor(req, res);
});

module.exports = router;
