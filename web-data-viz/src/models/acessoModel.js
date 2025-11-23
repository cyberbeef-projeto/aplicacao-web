var database = require("../database/config");

function kpiInativas() {
    var query = `
        SELECT
            SUM(CASE WHEN ultimo_login IS NULL 
                      OR ultimo_login < NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END) AS inativas,
            SUM(CASE WHEN ultimo_login >= NOW() - INTERVAL 30 DAY THEN 1 ELSE 0 END) AS ativas
        FROM (
            SELECT 
                u.idUsuario,
                (SELECT MAX(dataHora) FROM loginHistorico 
                 WHERE fkUsuario = u.idUsuario AND sucesso = 1) AS ultimo_login
            FROM usuario u
        ) AS t;
    `;
    return database.executar(query);
}

function kpiTotalTentativas() {
    return database.executar(`
        SELECT COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 7 DAY;
    `);
}

function kpiTaxaSucesso() {
    return database.executar(`
        SELECT 
            (SUM(CASE WHEN sucesso = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS taxa
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 7 DAY;
    `);
}

function kpiAdminsAtivos() {
    return database.executar(`
        SELECT COUNT(*) AS total
        FROM usuario u
        JOIN permissaoUsuario p ON u.permissaoUsuario = p.idPermissaoUsuario
        WHERE p.cargo = 'Administrador';
    `);
}

function graficoTentativasDia() {
    return database.executar(`
        SELECT DATE(dataHora) AS dia, COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 7 DAY
        GROUP BY DATE(dataHora)
        ORDER BY dia;
    `);
}

function graficoSucessoFalha() {
    return database.executar(`
        SELECT sucesso, COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 7 DAY
        GROUP BY sucesso;
    `);
}

function graficoCargos() {
    return database.executar(`
        SELECT p.cargo, COUNT(*) AS total
        FROM usuario u
        JOIN permissaoUsuario p ON u.permissaoUsuario = p.idPermissaoUsuario
        GROUP BY p.cargo;
    `);
}

function graficoHeatmap() {
    return database.executar(`
        SELECT DATE(dataHora) AS dia, COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 90 DAY
        GROUP BY DATE(dataHora)
        ORDER BY dia;
    `);
}

module.exports = {
    kpiInativas,
    kpiTaxaSucesso,
    kpiTotalTentativas,
    kpiAdminsAtivos,
    graficoTentativasDia,
    graficoSucessoFalha,
    graficoCargos,
    graficoHeatmap
};