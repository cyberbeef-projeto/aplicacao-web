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


function listar(req, res) {
    cadastroEmpresaModel.listarEmpresas()
        .then(resultado => {
            res.status(200).json(resultado);
        })
        .catch(erro => {
            console.error("Erro ao listar empresas:", erro);
            res.status(500).json(erro);
        });
}


function excluir(req, res) {
    var tokenEmpresa = req.params.tokenEmpresa;

    cadastroEmpresaModel.excluirEmpresa(tokenEmpresa)
        .then(() => {
            res.status(200).json({ mensagem: "Empresa excluída com sucesso!" });
        })
        .catch(erro => {
            console.error("Erro ao excluir empresa:", erro);
            res.status(500).json(erro);
        });
}

module.exports = {
    cadastrar,
    listar,
    excluir
};
