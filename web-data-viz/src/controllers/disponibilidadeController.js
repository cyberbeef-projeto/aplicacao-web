var disponibilidadeModel = require("../models/disponibilidadeModel");

function buscarKpis(req, res) {
    disponibilidadeModel.buscarKpis()
        .then(function (resultado) {
            if (resultado.length > 0) {
                // Lógica de tratamento dos dados (como no seu dashEmpresaController)
                const dados = resultado[0];
                
                // Conversão de minutos para horas
                const minutosTotal = dados.tempoSemDowntime || 0;
                const horas = Math.floor(minutosTotal / 60);
                const minutos = minutosTotal % 60;
                
                res.status(200).json({
                    totalMaquinas: dados.totalMaquinas,
                    tempoUp: `${horas}h ${minutos}m`,
                    capturasMin: dados.capturasPorMinuto,
                    dtLastDown: dados.dtUltimoDowntime || "Sem registros"
                });
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar os KPIs: ", erro.sqlMessage);
            res.status(500).json(erro);
        });
}

function buscarStatusRecursos(req, res) {
    var idMaquina = req.params.idMaquina;

    disponibilidadeModel.buscarStatusRecursos(idMaquina)
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar status de recursos: ", erro.sqlMessage);
            res.status(500).json(erro);
        });
}

function buscarGraficos(req, res) {
    disponibilidadeModel.buscarGraficos()
        .then(function (resultado) {
            if (resultado.length > 0) {
                res.status(200).json(resultado);
            } else {
                res.status(204).send("Nenhum resultado encontrado!");
            }
        }).catch(function (erro) {
            console.log(erro);
            console.log("Houve um erro ao buscar gráficos: ", erro.sqlMessage);
            res.status(500).json(erro);
        });
}

module.exports = {
    buscarKpis,
    buscarStatusRecursos,
    buscarGraficos
}