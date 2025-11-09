var dashModel = require("../models/dashModel");

function buscarMaquinas(req, res) {
  var id = req.body.tokenEmpresa;

  dashModel.buscarMaquinas(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = {
    buscarMaquinas,
};