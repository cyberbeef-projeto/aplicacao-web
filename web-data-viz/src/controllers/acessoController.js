var acessoModel = require("../models/acessoModel");
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

async function gerarAnaliseIA(req, res) {
  try {
    const { prompt } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "Você é um analista de segurança cibernética."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800
    });

    const texto =
      completion.choices[0]?.message?.content ||
      "Falha ao gerar resposta.";

    res.json({ text: texto });

  } catch (e) {
    console.error("Erro com IA:", e);
    res.status(500).json({ error: "Erro ao gerar análise IA." });
  }
}

module.exports = {
    kpiInativas,
    kpiTotalTentativas,
    kpiTaxaSucesso,
    kpiAdminsAtivos,
    graficoTentativasDia,
    graficoSucessoFalha,
    graficoCargos,
    graficoHeatmap,
    gerarAnaliseIA
};