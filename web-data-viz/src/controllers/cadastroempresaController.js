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
    .then(() => res.status(201).json({ mensagem: "Empresa cadastrada com sucesso!" }))
    .catch(erro => {
      console.error("Erro ao cadastrar:", erro);
      res.status(500).json(erro);
    });
}


function listar(req, res) {
  cadastroEmpresaModel.listarEmpresasAtivas()
    .then(resultado => res.json(resultado))
    .catch(erro => {
      console.error("Erro ao listar:", erro);
      res.status(500).json(erro);
    });
}


function desativar(req, res) {
  var tokenEmpresa = req.params.tokenEmpresa;

  cadastroEmpresaModel.desativarEmpresa(tokenEmpresa)
    .then(() => res.json({ mensagem: "Empresa desativada!" }))
    .catch(erro => {
      console.error("Erro ao desativar:", erro);
      res.status(500).json(erro);
    });
}

function editar(req, res) {
    var tokenEmpresa = req.params.tokenEmpresa;

    var {
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

    cadastroEmpresaModel.editarEmpresa(
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
        res.status(200).json({ mensagem: "Empresa atualizada com sucesso!" });
    })
    .catch(erro => {
        console.error("Erro ao editar empresa:", erro);
        res.status(500).json(erro);
    });
}



module.exports = { cadastrar, listar, desativar, editar };
