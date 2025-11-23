var alertasModel = require("../models/alertasModel");

function buscarKpis(req, res) {
  var id = req.body.tokenEmpresa;

  alertasModel.buscarKpis(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = {
    buscarKpis
};
