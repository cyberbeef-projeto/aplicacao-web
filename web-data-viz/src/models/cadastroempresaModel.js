var database = require("../database/config");


function cadastrarEmpresaCompleta(
  tokenEmpresa,
  razaoSocial,
  nomeFantasia,
  cnpj,
  logradouro,
  numero,
  bairro,
  cidade,
  estado,
  cep
) {

  var sqlEmpresa = `
      INSERT INTO empresa (tokenEmpresa, razaoSocial, nomeFantasia, cnpj)
      VALUES ('${tokenEmpresa}', '${razaoSocial}', '${nomeFantasia}', '${cnpj}');
  `;

  console.log("SQL EMPRESA:", sqlEmpresa);

  return database.executar(sqlEmpresa)
    .then(() => {

      var sqlEndereco = `
          INSERT INTO endereco (tokenEmpresa, logradouro, numero, bairro, cidade, estado, cep)
          VALUES ('${tokenEmpresa}', '${logradouro}', '${numero}', '${bairro}', '${cidade}', '${estado}', '${cep}');
      `;

      console.log("SQL ENDERECO:", sqlEndereco);

      return database.executar(sqlEndereco);
    })
    .catch(erro => {
      console.error("ERRO AO CADASTRAR EMPRESA:", erro);
      throw erro;
    });
}


function listarEmpresas() {
  var sql = `
      SELECT 
        tokenEmpresa,
        nomeFantasia,
        cnpj,
        DATE_FORMAT(dataCadastro, '%d/%m/%Y') AS dataCadastro
      FROM empresa
      ORDER BY tokenEmpresa;
  `;

  console.log("Executando SELECT de empresas...");
  return database.executar(sql);
}


function excluirEmpresa(tokenEmpresa) {
  var sql = `
      DELETE FROM empresa 
      WHERE tokenEmpresa = '${tokenEmpresa}';
  `;

  console.log("SQL EXCLUSÃO:", sql);

  return database.executar(sql);
}

module.exports = {
  cadastrarEmpresaCompleta,
  listarEmpresas,
  excluirEmpresa
};
