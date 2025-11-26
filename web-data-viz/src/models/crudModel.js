var database = require("../database/config")

function buscarUsuarios(id) {
  var instrucaoSql = `SELECT nome, permissaoUsuario, email, '*********' as senha FROM usuario WHERE tokenEmpresa = '${id}' AND ativo = 1 AND email != 'cyber@cyber.com'`;

  return database.executar(instrucaoSql);
}

function criarUsuario(id, nome, email, permissao, senha) {
  if (id && nome && email && permissao && senha) {
    var instrucaoSql = `INSERT INTO usuario (tokenEmpresa, permissaoUsuario, email, senha, nome) VALUE ('${id}', '${permissao}', '${email}', '${senha}', '${nome}');`;
  } else {
    var instrucaoSql = "SELECT ''";
  }
  return database.executar(instrucaoSql);
}

function editarUsuario(id, nome, email, permissao, senha, id2) {
  if (permissao) {
    var instrucaoSql = `
  UPDATE usuario SET 
  nome = '${nome}', permissaoUsuario = ${permissao}, email = '${email}', senha = '${senha}' WHERE tokenEmpresa = '${id}' AND nome = '${id2}'`;
  } else {
    var instrucaoSql = `
  UPDATE usuario SET 
  nome = '${nome}', email = '${email}', senha = '${senha}' WHERE tokenEmpresa = '${id}' AND nome = '${id2}'`;
  }
  return database.executar(instrucaoSql);
}

function deletarUsuario(nome) {
  var instrucaoSql = `
  UPDATE usuario SET 
  ativo = 0, senha = '@!D@D4$3sdcdf' WHERE nome = '${nome}'`;

  return database.executar(instrucaoSql);
}

function buscarMaquinas(id) {
  var instrucaoSql = `
  SELECT m.hostname as nome, DATE_FORMAT(MAX(l.dthCaptura), '%d/%m/%y %H:%i') as ultimaCap 
    FROM leitura l JOIN maquina m ON m.idmaquina = l.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}' AND ativo = 1
    GROUP BY m.hostname`;

  return database.executar(instrucaoSql);
}

function editarMaquina(nome, id2) {
  var instrucaoSql = `
  UPDATE maquina SET 
  hostname = '${nome}' WHERE hostname = '${id2}'`;

  return database.executar(instrucaoSql);
}

function deletarMaquina(nome) {
  var instrucaoSql = `
  UPDATE maquina SET 
  ativo = 0 WHERE hostname = '${nome}'`;

  return database.executar(instrucaoSql);
}

function buscarSetores(id) {
  var instrucaoSql = `
  SELECT nomeSetor as nome, descricao as descricao
      FROM setor 
      WHERE tokenEmpresa = '${id}' AND ativo = 1`;

  return database.executar(instrucaoSql);
}

function criarSetor(id, nome, descricao) {
  var instrucaoSql = `
  INSERT setor (tokenEmpresa, nomeSetor, descricao)
  VALUES ('${id}', '${nome}', '${descricao}');`;

  return database.executar(instrucaoSql);
}

function editarSetor(nome, descricao, id2) {
  var instrucaoSql = `
  UPDATE setor SET 
  nomeSetor = '${nome}', descricao = '${descricao}' WHERE nomeSetor = '${id2}'`;

  return database.executar(instrucaoSql);
}

function deletarSetor(nome) {
  var instrucaoSql = `
  UPDATE setor SET 
  ativo = 0 WHERE nomeSetor = '${nome}'`;

  return database.executar(instrucaoSql);
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