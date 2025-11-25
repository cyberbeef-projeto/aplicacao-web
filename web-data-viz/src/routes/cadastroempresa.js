var express = require("express");
var router = express.Router();
var controller = require("../controllers/cadastroempresaController");

router.post("/cadastrar", controller.cadastrar);
router.get("/listar", controller.listar);
router.put("/desativar/:tokenEmpresa", controller.desativar);
router.put("/editar/:tokenEmpresa", controller.editar);


module.exports = router;
