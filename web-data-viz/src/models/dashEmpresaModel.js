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

            (SELECT COUNT(*) FROM empresa WHERE statusEmpresa = 1) AS ativas,
            (SELECT COUNT(*) FROM empresa WHERE statusEmpresa = 0) AS inativas;
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
        WHERE e.statusEmpresa = 1
        GROUP BY en.cidade
        ORDER BY quantidade DESC
        LIMIT 6;
    `;
    return database.executar(sql);
}

function obterQtdCidadesEstados() {
    const sql = `
        SELECT 
            (SELECT COUNT(DISTINCT cidade) 
             FROM endereco 
             JOIN empresa ON empresa.tokenEmpresa = endereco.tokenEmpresa
             WHERE empresa.statusEmpresa = 1) AS cidades,

            (SELECT COUNT(DISTINCT estado)
             FROM endereco
             JOIN empresa ON empresa.tokenEmpresa = endereco.tokenEmpresa
             WHERE empresa.statusEmpresa = 1) AS estados;
    `;

    return database.executar(sql);
}


module.exports = {
    obterMetricas,
    obterEmpresasPorEstado,
    obterEmpresasPorCidade,
    obterQtdCidadesEstados
};
