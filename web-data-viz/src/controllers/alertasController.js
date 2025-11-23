var alertasModel = require("../models/alertasModel");

function buscarKpis(req, res) {
  var filtro = req.body.filtro;

  alertasModel.buscarKpis(filtro).then((resultado) => {
    res.status(200).json(resultado);
  });
}


function buscarTabela(req, res) {
  var filtro = req.body.filtro;

  alertasModel.buscarTabela(filtro).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarGraficoBarras(req, res) {
  var filtro = req.body.filtro;

  alertasModel.buscarGraficoBarras(filtro).then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = {
    buscarKpis,
    buscarTabela,
    buscarGraficoBarras,
};
