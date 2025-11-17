var dashModel = require("../models/dashModel");

function buscarMaquinas(req, res) {
  var id = req.body.tokenEmpresa;

  dashModel.buscarMaquinas(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarKpisTodas(req, res) {
  var id = req.body.tokenEmpresa;

  dashModel.buscarKpisTodas(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarKpisGeral(req, res) {
  var id = req.body.tokenEmpresa;
  var maquina = req.body.maquina;

  dashModel.buscarKpisGeral(id, maquina).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarKpisCRD(req, res) {
  var id = req.body.tokenEmpresa;
  var maquina = req.body.maquina;
  var componente = req.body.componente;

  dashModel.buscarKpisCRD(id, maquina, componente).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarKpisRede(req, res) {
  var id = req.body.tokenEmpresa;
  var maquina = req.body.maquina;

  dashModel.buscarKpisRede(id, maquina).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarKpisTodasDesc(req, res) {
  var id = req.body.tokenEmpresa;

  dashModel.buscarKpisTodasDesc(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = {
    buscarMaquinas,
    buscarKpisTodas,
    buscarKpisGeral,
    buscarKpisCRD,
    buscarKpisRede,
    buscarKpisTodasDesc,
};