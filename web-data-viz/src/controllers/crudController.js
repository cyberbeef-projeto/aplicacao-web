var crudModel = require("../models/crudModel");

function buscarUsuarios(req, res) {
  var id = req.body.tokenEmpresa;

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
  console.log(nome, email, permissao, senha)

  crudModel.criarUsuario(id, nome, email, permissao, senha).then((resultado) => {
    res.status(200).json(resultado);
  });
}

module.exports = {
    buscarUsuarios,
    criarUsuario
};