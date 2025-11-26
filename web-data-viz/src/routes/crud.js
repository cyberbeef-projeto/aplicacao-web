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

router.post("/deletarUsuario", function (req, res) {
    crudController.deletarUsuario(req, res);
});

router.post("/maquinas", function (req, res) {
    crudController.buscarMaquinas(req, res);
});

router.post("/editarMaquina", function (req, res) {
    crudController.editarMaquina(req, res);
});

router.post("/deletarMaquina", function (req, res) {
    crudController.deletarMaquina(req, res);
});

router.post("/setores", function (req, res) {
    crudController.buscarSetores(req, res);
});

router.post("/criarSetor", function (req, res) {
    crudController.criarSetor(req, res);
});

router.post("/editarSetor", function (req, res) {
    crudController.editarSetor(req, res);
});

router.post("/deletarSetor", function (req, res) {
    crudController.deletarSetor(req, res);
});

module.exports = router;
