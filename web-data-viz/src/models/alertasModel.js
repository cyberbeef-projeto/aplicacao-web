var database = require("../database/config");

function buscarKpis(id) {
    var instrucaoSql = `
    SELECT
    (SELECT COUNT(*) 
        FROM alerta a 
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        WHERE sm.tokenEmpresa = '${id}') as alertasGerais,
    (SELECT COUNT(*) 
        FROM alerta a 
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        WHERE sm.tokenEmpresa = '${id}' AND a.descricao = "Crítico") as alertasCriticos,
    (SELECT COUNT(*) 
        FROM alerta a 
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        WHERE sm.tokenEmpresa = '${id}' AND a.descricao = "Anormal") as alertasAnormais`;

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis
};