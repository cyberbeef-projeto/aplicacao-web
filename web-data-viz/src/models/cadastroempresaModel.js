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
      INSERT INTO empresa (tokenEmpresa, razaoSocial, nomeFantasia, cnpj, statusEmpresa)
      VALUES ('${tokenEmpresa}', '${razaoSocial}', '${nomeFantasia}', '${cnpj}', 1);
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


function listarEmpresasAtivas() {
  var sql = `
    SELECT 
      e.tokenEmpresa,
      e.razaoSocial,
      e.nomeFantasia,
      e.cnpj,
      e.statusEmpresa,
      e.dataCadastro,
      en.logradouro,
      en.numero,
      en.bairro,
      en.cidade,
      en.estado,
      en.cep
    FROM empresa e
    JOIN endereco en
      ON e.tokenEmpresa = en.tokenEmpresa
    WHERE e.statusEmpresa = 1; 
  `;

  return database.executar(sql);
}



function desativarEmpresa(tokenEmpresa) {
  var sql = `
    UPDATE empresa
    SET statusEmpresa = 0
    WHERE tokenEmpresa = ${tokenEmpresa};
  `;
  return database.executar(sql);
}


function editarEmpresa(
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
    const sqlEmpresa = `
        UPDATE empresa
        SET 
            razaoSocial = '${razaoSocial}',
            nomeFantasia = '${nomeFantasia}',
            cnpj = '${cnpj}'
        WHERE tokenEmpresa = ${tokenEmpresa};
    `;

    const sqlEndereco = `
        UPDATE endereco
        SET 
            logradouro = '${logradouro}',
            numero = '${numero}',
            bairro = '${bairro}',
            cidade = '${cidade}',
            estado = '${estado}',
            cep = '${cep}'
        WHERE tokenEmpresa = ${tokenEmpresa};
    `;

    return database.executar(sqlEmpresa)
      .then(() => database.executar(sqlEndereco));
}



module.exports = {
  cadastrarEmpresaCompleta,
  listarEmpresasAtivas,
  desativarEmpresa,
  editarEmpresa
};
