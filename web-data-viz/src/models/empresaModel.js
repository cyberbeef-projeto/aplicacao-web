var database = require("../database/config");



function buscarPorId(id) {
  var instrucaoSql = `
      SELECT 
        e.tokenEmpresa,
        e.razaoSocial,
        e.nomeFantasia,
        e.cnpj,
        e.dataCadastro,
        en.logradouro,
        en.numero,
        en.bairro,
        en.cidade,
        en.estado,
        en.cep
      FROM empresa e
      LEFT JOIN endereco en ON e.tokenEmpresa = en.tokenEmpresa
      WHERE e.tokenEmpresa = ${id};
  `;
  return database.executar(instrucaoSql);
}

function listar() {
  var instrucaoSql = `
    SELECT 
      e.tokenEmpresa,
      e.razaoSocial,
      e.nomeFantasia,
      e.cnpj,
      e.dataCadastro,
      en.cidade,
      en.estado
    FROM empresa e
    LEFT JOIN endereco en ON e.tokenEmpresa = en.tokenEmpresa;
  `;
  return database.executar(instrucaoSql);
}

function buscarPorCnpj(cnpj) {
  var instrucaoSql = `
    SELECT * FROM empresa WHERE cnpj = '${cnpj}';
  `;
  return database.executar(instrucaoSql);
}



async function cadastrar(
  razaoSocial,
  nomeFantasia,
  cnpj,
  cep,
  logradouro,
  bairro,
  cidade,
  uf,
  numero
) {
  // 1 — Inserir a empresa
  var sqlEmpresa = `
    INSERT INTO empresa (razaoSocial, nomeFantasia, cnpj)
    VALUES ('${razaoSocial}', '${nomeFantasia}', '${cnpj}');
  `;

  const resultado = await database.executar(sqlEmpresa);
  const tokenEmpresa = resultado.insertId;


  var sqlEndereco = `
    INSERT INTO endereco (tokenEmpresa, logradouro, numero, bairro, cidade, estado, cep)
    VALUES (${tokenEmpresa}, '${logradouro}', '${numero}', '${bairro}', '${cidade}', '${uf}', '${cep}');
  `;

  await database.executar(sqlEndereco);

  return resultado;
}



module.exports = {
  buscarPorId,
  listar,
  buscarPorCnpj,
  cadastrar
};
