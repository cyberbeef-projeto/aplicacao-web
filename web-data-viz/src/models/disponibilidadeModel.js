var database = require("../database/config");

function buscarKpis() {
    var instrucaoSql = `
        SELECT 
            (SELECT COUNT(idMaquina) FROM maquina) as totalMaquinas,
            (SELECT TIMESTAMPDIFF(MINUTE, MAX(l.dthCaptura), NOW()) FROM alerta a JOIN leitura l ON a.idLeitura = l.idLeitura WHERE a.descricao = 'Crítico') as tempoSemDowntime,
            (SELECT COUNT(idLeitura) FROM leitura WHERE dthCaptura > DATE_SUB(NOW(), INTERVAL 1 MINUTE)) as capturasPorMinuto,
            (SELECT DATE_FORMAT(MAX(l.dthCaptura), '%d/%m %H:%i') FROM alerta a JOIN leitura l ON a.idLeitura = l.idLeitura WHERE a.descricao = 'Crítico') as dtUltimoDowntime;
    `;
    return database.executar(instrucaoSql);
}

function buscarStatusRecursos(idMaquina) {
    var instrucaoSql = `
        SELECT 
            c.tipoComponente AS nome, l.dado AS valor, c.unidadeMedida AS unidade,
            CASE WHEN l.dado >= p.max THEN 'CRÍTICO' WHEN l.dado >= (p.max * 0.8) THEN 'ALERTA' ELSE 'ESTÁVEL' END AS status_texto,
            CASE WHEN l.dado >= p.max THEN 'led-red' WHEN l.dado >= (p.max * 0.8) THEN 'led-yellow' ELSE 'led-green' END AS cor_led,
            CASE WHEN l.dado >= p.max THEN 'color-down' WHEN l.dado >= (p.max * 0.8) THEN 'color-warn' ELSE 'color-up' END AS cor_texto
        FROM leitura l
        JOIN componente c ON l.idComponente = c.idComponente
        JOIN parametro p ON p.idComponente = c.idComponente AND p.idMaquina = l.idMaquina
        WHERE l.idLeitura IN (
            SELECT MAX(l2.idLeitura) FROM leitura l2 JOIN componente c2 ON l2.idComponente = c2.idComponente WHERE l2.idMaquina = ${idMaquina} GROUP BY l2.idComponente
        );
    `;
    return database.executar(instrucaoSql);
}

function buscarGraficos() {
    var instrucaoSql = `
        SELECT m.hostname, COUNT(a.idAlerta) as qtd_alertas FROM alerta a JOIN maquina m ON a.idMaquina = m.idMaquina GROUP BY m.hostname ORDER BY qtd_alertas DESC LIMIT 5;
    `;
    return database.executar(instrucaoSql);
}

function buscarDisponibilidade() {
    var instrucaoSql = `
        SELECT 
            SUM(CASE WHEN l.dado < p.max THEN 1 ELSE 0 END) as componentes_ok,
            COUNT(l.idLeitura) as total_componentes
        FROM leitura l
        JOIN componente c ON l.idComponente = c.idComponente
        JOIN parametro p ON p.idComponente = c.idComponente AND p.idMaquina = l.idMaquina
        WHERE l.idLeitura IN (
            SELECT MAX(l2.idLeitura) FROM leitura l2 GROUP BY l2.idComponente, l2.idMaquina
        );
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarStatusRecursos,
    buscarGraficos,
    buscarDisponibilidade
};