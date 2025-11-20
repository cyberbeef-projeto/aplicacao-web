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

module.exports = {
  cadastrarEmpresaCompleta
};
