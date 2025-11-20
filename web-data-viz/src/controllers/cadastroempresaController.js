var cadastroEmpresaModel = require("../models/cadastroempresaModel");

function cadastrar(req, res) {

    var { 
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
    } = req.body;

    cadastroEmpresaModel.cadastrarEmpresaCompleta(
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
    )
    .then(() => {
        res.status(201).json({ mensagem: "Empresa cadastrada com sucesso!" });
    })
    .catch(erro => {
        console.error("Erro ao cadastrar empresa:", erro);
        res.status(500).json(erro);
    });
}

module.exports = { cadastrar };
