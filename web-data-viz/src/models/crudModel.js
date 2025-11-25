var database = require("../database/config")

function buscarUsuarios(id) {
  var instrucaoSql = `SELECT nome, permissaoUsuario, email, '*********' as senha FROM usuario WHERE tokenEmpresa = '${id}'`;

  return database.executar(instrucaoSql);
}

function criarUsuario(id, nome, email, permissao, senha) {
  if (id && nome && email && permissao && senha) {
    var instrucaoSql = `INSERT INTO usuario (tokenEmpresa, permissaoUsuario, email, senha, nome) VALUE ('${id}', '${permissao}', '${email}', '${senha}', '${nome}');`;
  }
  var instrucaoSql = "SELECT ''";
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

function buscarMaquinas(id) {
  var instrucaoSql = `
  SELECT m.hostname as nome, DATE_FORMAT(MAX(l.dthCaptura), '%d/%m/%y %H:%i') as ultimaCap 
    FROM leitura l JOIN maquina m ON m.idmaquina = l.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}'
    GROUP BY m.hostname`;

  return database.executar(instrucaoSql);
}

function editarMaquina(nome, id2) {
  var instrucaoSql = `
  UPDATE maquina SET 
  hostname = '${nome}' WHERE hostname = '${id2}'`;
  
  return database.executar(instrucaoSql);
}

function buscarSetores(id) {
  var instrucaoSql = `
  SELECT s.nomeSetor as nome, count(sm.idMaquina) as numMaq
      FROM setor s JOIN setorMaquina sm ON sm.idSetor = s.idSetor
      WHERE sm.tokenEmpresa = '${id}'
      GROUP BY s.nomeSetor`;

  return database.executar(instrucaoSql);
}

function editarSetor(nome, id2) {
  var instrucaoSql = `
  UPDATE setor SET 
  nomeSetor = '${nome}' WHERE nomeSetor = '${id2}'`;
  
  return database.executar(instrucaoSql);
}

module.exports = {
  buscarUsuarios,
  criarUsuario,
  editarUsuario,
  buscarMaquinas,
  editarMaquina,
  buscarSetores,
  editarSetor,
};