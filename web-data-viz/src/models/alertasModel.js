var database = require("../database/config");

function buscarKpis(filtro) {
    var instrucaoSql = `
    SELECT
    (SELECT COUNT(*) 
        FROM alerta a 
        JOIN leitura l ON l.idLeitura = a.idLeitura
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        ${filtro}) as alertasGerais,
    (SELECT COUNT(*) 
        FROM alerta a 
        JOIN leitura l ON l.idLeitura = a.idLeitura
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        ${filtro} AND a.descricao = "Crítico") as alertasCriticos,
    (SELECT COUNT(*) 
        FROM alerta a 
        JOIN leitura l ON l.idLeitura = a.idLeitura
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        ${filtro} AND a.descricao = "Anormal") as alertasAnormais`;

    return database.executar(instrucaoSql);
}

function buscarTabela(filtro) {
    var instrucaoSql = `
    SELECT DATE_FORMAT(l.dthCaptura, '%d/%m/%y %H:%i') as dataHora, m.hostname as maquina, c.tipoComponente as componente, a.descricao as tipo, l.dado as dado 
        FROM alerta a 
        JOIN leitura l ON l.idLeitura = a.idLeitura
        JOIN componente c ON c.idComponente = a.idComponente
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        ${filtro}
        ORDER BY l.dthCaptura DESC`;

    return database.executar(instrucaoSql);
}

function buscarGraficoBarras(filtro) {
    var instrucaoSql = `
    SELECT COUNT(*) as numAlertas, m.hostname as maquina
        FROM alerta a
        JOIN leitura l ON l.idLeitura = a.idLeitura
        JOIN maquina m ON m.idmaquina = a.idmaquina
        JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
        ${filtro}
        GROUP BY maquina
        ORDER BY numAlertas DESC
        LIMIT 5`;

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarTabela,
    buscarGraficoBarras,
};