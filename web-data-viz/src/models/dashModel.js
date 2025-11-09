var database = require("../database/config")

function buscarMaquinas(id) {
    var instrucaoSql = `
    SELECT m.hostname
    FROM setor s
    JOIN setorMaquina sm ON s.idSetor = sm.idSetor
    JOIN maquina m ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = s.tokenEmpresa AND sm.tokenEmpresa = '${id}'`;

    return database.executar(instrucaoSql);
}


module.exports = {
    buscarMaquinas,
};