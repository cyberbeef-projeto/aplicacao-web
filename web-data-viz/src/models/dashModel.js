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

function buscarKpisTodas(id) {
    var instrucaoSql = `
SELECT 
(SELECT COUNT(DISTINCT m.idMaquina) 
	FROM setor s
	JOIN setorMaquina sm ON s.idSetor = sm.idSetor
	JOIN maquina m ON sm.idMaquina = m.idMaquina
	WHERE sm.tokenEmpresa = '${id}') as maquinas,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE l.dthCaptura >= NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}') as alertasAtuais,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE l.dthCaptura >= NOW() - INTERVAL 14 DAY
	AND l.dthCaptura <  NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}') as alertasPassados,
(SELECT 
	COALESCE(DATEDIFF(CURDATE(), DATE(MAX(l.dthCaptura))), 'Sem Alertas') 
	FROM alerta a 
    JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}') as DiasSemAlertas,
(SELECT m.hostname
	FROM alerta a 
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}'
    GROUP BY m.hostname
	ORDER BY COUNT(*) DESC
	LIMIT 1) as MaquinaMaisAlertas;`;
    return database.executar(instrucaoSql);
}


module.exports = {
    buscarMaquinas,
    buscarKpisTodas
};