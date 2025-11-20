var express = require("express");
var router = express.Router();

var cadastroempresaController = require("../controllers/cadastroempresaController");


router.post("/cadastrar", function (req, res) {
    cadastroempresaController.cadastrar(req, res);
});


router.get("/listar", function (req, res) {
    cadastroempresaController.listar(req, res);
});


router.delete("/excluir/:tokenEmpresa", function (req, res) {
    cadastroempresaController.excluir(req, res);
});

module.exports = router;
