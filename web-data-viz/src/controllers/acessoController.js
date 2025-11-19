var acessoModel = require("../models/acessoModel");

function kpiInativas(req, res) {
    acessoModel.kpiInativas()
        .then(r => res.json(r[0]))
        .catch(e => res.status(500).json(e));
}

function kpiTotalTentativas(req, res) {
    acessoModel.kpiTotalTentativas()
        .then(r => res.json(r[0]))
        .catch(e => res.status(500).json(e));
}

function kpiTaxaSucesso(req, res) {
    acessoModel.kpiTaxaSucesso()
        .then(r => res.json(r[0]))
        .catch(e => res.status(500).json(e));
}

function kpiAdminsAtivos(req, res) {
    acessoModel.kpiAdminsAtivos()
        .then(r => res.json(r[0]))
        .catch(e => res.status(500).json(e));
}

function graficoTentativasDia(req, res) {
    acessoModel.graficoTentativasDia()
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}

function graficoSucessoFalha(req, res) {
    acessoModel.graficoSucessoFalha()
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}

function graficoCargos(req, res) {
    acessoModel.graficoCargos()
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}

function graficoHeatmap(req, res) {
    acessoModel.graficoHeatmap()
        .then(r => res.json(r))
        .catch(e => res.status(500).json(e));
}

module.exports = {
    kpiInativas,
    kpiTotalTentativas,
    kpiTaxaSucesso,
    kpiAdminsAtivos,
    graficoTentativasDia,
    graficoSucessoFalha,
    graficoCargos,
    graficoHeatmap
};