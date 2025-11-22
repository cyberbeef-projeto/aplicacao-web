var express = require("express");
var router = express.Router();
var dashEmpresaController = require("../controllers/dashEmpresaController");

router.get("/dashboard", (req, res) => {
    dashEmpresaController.dashboard(req, res);
});

module.exports = router;
