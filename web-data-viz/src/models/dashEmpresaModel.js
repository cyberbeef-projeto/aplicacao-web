var database = require("../database/config");


function obterMetricas() {
    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM empresa) AS totalEmpresas,

            (SELECT COUNT(*)  
             FROM empresa  
             WHERE statusEmpresa = 0) AS canceladas,


            (SELECT COUNT(*) 
             FROM empresa 
             WHERE dataCadastro < DATE_SUB(NOW(), INTERVAL 6 MONTH)) AS totalInicio,

            (SELECT COUNT(*) 
             FROM empresa 
             WHERE dataCadastro BETWEEN DATE_SUB(NOW(), INTERVAL 6 MONTH) AND NOW()) AS atual,

            (SELECT COUNT(*) 
             FROM empresa 
             WHERE dataCadastro BETWEEN DATE_SUB(NOW(), INTERVAL 12 MONTH) AND DATE_SUB(NOW(), INTERVAL 6 MONTH)) AS anterior,

            (SELECT COUNT(*) 
             FROM empresa 
             WHERE statusEmpresa = 1
             AND dataCadastro >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             ) AS ativas,

             (SELECT COUNT(*) 
              FROM empresa 
             WHERE statusEmpresa = 0
             AND dataCadastro >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            ) AS inativas;

    `;
    return database.executar(sql);
}


function obterEmpresasPorEstado() {
    const sql = `
        SELECT estado, COUNT(*) AS quantidade
        FROM endereco
        GROUP BY estado;
    `;
    return database.executar(sql);
}

function obterEmpresasPorCidade() {
    const sql = `
        SELECT en.cidade, COUNT(*) AS quantidade
        FROM endereco en
        JOIN empresa e ON e.tokenEmpresa = en.tokenEmpresa
        GROUP BY en.cidade
        ORDER BY quantidade DESC
        LIMIT 5;
    `;
    return database.executar(sql);
}

function obterQtdCidadesEstados() {
    const sql = `
        SELECT 
            (SELECT COUNT(DISTINCT en.cidade)
             FROM endereco en
             JOIN empresa e ON e.tokenEmpresa = en.tokenEmpresa
            ) AS cidades,

            (SELECT COUNT(DISTINCT en.estado)
             FROM endereco en
             JOIN empresa e ON e.tokenEmpresa = en.tokenEmpresa
            ) AS estados;
    `;

    return database.executar(sql);
}

function obterGraficoMensal() {
    const sql = `
        SELECT 
            DATE_FORMAT(dataCadastro, '%Y-%m') AS mes,
            SUM(statusEmpresa = 1) AS empresasAtivas,
            SUM(statusEmpresa = 0) AS empresasInativas
        FROM empresa
        WHERE YEAR(dataCadastro) = 2025
        GROUP BY DATE_FORMAT(dataCadastro, '%Y-%m')
        ORDER BY mes
        LIMIT 6;
    `;

    return database.executar(sql);
}







module.exports = {
    obterMetricas,
    obterEmpresasPorEstado,
    obterEmpresasPorCidade,
    obterQtdCidadesEstados,
    obterGraficoMensal
};
