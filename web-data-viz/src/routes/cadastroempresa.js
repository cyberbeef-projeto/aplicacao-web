var express = require("express");
var router = express.Router();

var cadastroempresaController = require("../controllers/cadastroempresaController");

router.post("/cadastrar", function (req, res) {
    cadastroempresaController.cadastrar(req, res);
});

module.exports = router;
