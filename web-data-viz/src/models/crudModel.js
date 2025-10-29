var database = require("../database/config")

function buscarUsuarios(id) {
  var instrucaoSql = `SELECT nome, permissaoUsuario, email, '*********' as senha FROM usuario WHERE tokenEmpresa = '${id}'`;

  return database.executar(instrucaoSql);
}

function criarUsuario(id, nome, email, permissao, senha) {
  var instrucaoSql = `INSERT INTO usuario (tokenEmpresa, permissaoUsuario, email, senha, nome) VALUE ('${id}', '${permissao}', '${email}', '${senha}', '${nome}');`;

  return database.executar(instrucaoSql);
}

module.exports = {
    buscarUsuarios,
    criarUsuario
};