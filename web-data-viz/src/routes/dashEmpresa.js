var express = require("express");
var router = express.Router();
var dashEmpresaController = require("../controllers/dashEmpresaController");

router.get("/dashboard", (req, res) => {
    dashEmpresaController.dashboard(req, res);
});

 router.get("/obterQtdCidadesEstados", controller.obterQtdCidadeEstados);


module.exports = router;
