var crudModel = require("../models/crudModel");

function buscarUsuarios(req, res) {
  var id = req.body.id;

  crudModel.buscarUsuarios(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function criarUsuario(req, res) {
  var id = req.body.id;
  var nome = req.body.nome;
  var email = req.body.email;
  var permissao = req.body.permissaoUsuario;
  var senha = req.body.senha;

  crudModel.criarUsuario(id, nome, email, permissao, senha).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function editarUsuario(req, res) {
  var id = req.body.id;
  var nome = req.body.nome;
  var email = req.body.email;
  var permissao = req.body.permissaoUsuario;
  var senha = req.body.senha;
  var id2 = req.body.id2;

  crudModel.editarUsuario(id, nome, email, permissao, senha, id2).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function deletarUsuario(req, res) {
  var nome = req.body.nome;

  crudModel.deletarUsuario(nome).then((resultado) => {
    res.status(200).json(resultado);
  });
}


function buscarMaquinas(req, res) {
  var id = req.body.id;

  crudModel.buscarMaquinas(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function editarMaquina(req, res) {
  var nome = req.body.nome;
  var id2 = req.body.id2;


  crudModel.editarMaquina(nome, id2).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function deletarMaquina(req, res) {
  var nome = req.body.nome;


  crudModel.deletarMaquina(nome).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarSetores(req, res) {
  var id = req.body.id;

  crudModel.buscarSetores(id).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function criarSetor(req, res) {
  var id = req.body.id;
  var nome = req.body.nome;
  var descricao = req.body.descricao;

  crudModel.criarSetor(id, nome, descricao).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function editarSetor(req, res) {
  var nome = req.body.nome;
  var descricao = req.body.descricao;
  var id2 = req.body.id2;


  crudModel.editarSetor(nome, descricao, id2).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function deletarSetor(req, res) {
  var nome = req.body.nome;

  crudModel.deletarSetor(nome).then((resultado) => {
    res.status(200).json(resultado);
  });
}
module.exports = {
    buscarUsuarios,
    criarUsuario,
    editarUsuario,
    deletarUsuario,
    buscarMaquinas,
    editarMaquina,
    deletarMaquina,
    buscarSetores,
    criarSetor,
    editarSetor,
    deletarSetor,
};