var disponibilidadeModel = require("../models/disponibilidadeModel");

function buscarKpis(req, res) {
    disponibilidadeModel.buscarKpis().then(function (resultado) {
        if (resultado.length > 0) {
            const dados = resultado[0];
            const minutosTotal = dados.tempoSemDowntime || 0;
            const horas = Math.floor(minutosTotal / 60);
            const minutos = minutosTotal % 60;
            
            res.status(200).json({
                totalMaquinas: dados.totalMaquinas,
                tempoUp: `${horas}h ${minutos}m`,
                capturasMin: dados.capturasPorMinuto,
                dtLastDown: dados.dtUltimoDowntime || "Sem registros"
            });
        } else { res.status(204).send("Nenhum resultado encontrado!"); }
    }).catch(function (erro) { res.status(500).json(erro); });
}

function buscarStatusRecursos(req, res) {
    disponibilidadeModel.buscarStatusRecursos(req.params.idMaquina).then(function (resultado) {
        if (resultado.length > 0) { res.status(200).json(resultado); } 
        else { res.status(204).send("Nenhum resultado!"); }
    }).catch(function (erro) { res.status(500).json(erro); });
}

function buscarGraficos(req, res) {
    disponibilidadeModel.buscarGraficos().then(function (resultado) {
        if (resultado.length > 0) { res.status(200).json(resultado); }
        else { res.status(204).send("Nenhum resultado!"); }
    }).catch(function (erro) { res.status(500).json(erro); });
}

function buscarDisponibilidade(req, res) {
    disponibilidadeModel.buscarDisponibilidade().then(function (resultado) {
        if (resultado.length > 0) {
            const dados = resultado[0];
            const total = dados.total_componentes;
            const ok = dados.componentes_ok;
            
            let uptime = 100;
            let downtime = 0;

            if (total > 0) {
                uptime = ((ok / total) * 100).toFixed(1);
                downtime = (100 - uptime).toFixed(1);
            }

            res.status(200).json({ uptime: uptime, downtime: downtime });
        } else {
            res.status(204).send("Nenhum resultado!");
        }
    }).catch(function (erro) { res.status(500).json(erro); });
}

module.exports = {
    buscarKpis,
    buscarStatusRecursos,
    buscarGraficos,
    buscarDisponibilidade
}