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

function buscarKpisGeral(id, maquina) {
    var instrucaoSql = `
SELECT 
(SELECT count(DISTINCT s.nomeSetor) as nSetor
	FROM setor s
	JOIN setorMaquina sm ON s.idSetor = sm.idSetor
	JOIN maquina m ON sm.idMaquina = m.idMaquina
	WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}') as setores,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE l.dthCaptura >= NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}') as alertasAtuais,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE l.dthCaptura >= NOW() - INTERVAL 14 DAY
	AND l.dthCaptura <  NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}') as alertasPassados,
(SELECT 
	COALESCE(DATEDIFF(CURDATE(), DATE(MAX(l.dthCaptura))), 'Sem Alertas') 
	FROM alerta a 
    JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}') as diasSemAlertas,
(SELECT c.tipoComponente
	FROM alerta a 
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    JOIN componente c ON c.idComponente = a.idComponente
    WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}'
    GROUP BY c.tipoComponente
	ORDER BY COUNT(*) DESC
	LIMIT 1) as ComponenteMaisAlertas;`;
    return database.executar(instrucaoSql);
}

function buscarKpisCRD(id, maquina, componente) {
    var instrucaoSql = `
SELECT 
(SELECT l.dado 
	FROM leitura l 
	JOIN maquina m ON l.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    JOIN componente c ON l.idComponente = c.idComponente
    WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}'
    ORDER BY l.dthCaptura DESC
    LIMIT 1) AS ultimaCaptura,
(SELECT l.dado 
	FROM leitura l 
	JOIN maquina m ON l.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    JOIN componente c ON l.idComponente = c.idComponente
    WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}'
    ORDER BY l.dthCaptura DESC
    LIMIT 1 OFFSET 1) AS penultimaCaptura,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN componente c ON l.idComponente = c.idComponente
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE l.dthCaptura >= NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}') as alertasAtuais,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN componente c ON l.idComponente = c.idComponente
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
	WHERE l.dthCaptura >= NOW() - INTERVAL 14 DAY
	AND l.dthCaptura <  NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}') as alertasPassados,
(SELECT 
	COALESCE(DATEDIFF(CURDATE(), DATE(MAX(l.dthCaptura))), 'Sem Alertas') 
	FROM alerta a 
    JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN componente c ON l.idComponente = c.idComponente
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}') as diasSemAlertas,
(SELECT ROUND((STDDEV_SAMP(l.dado) / NULLIF(AVG(l.dado), 0)) * 100)
	FROM leitura l 
	JOIN maquina m ON l.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    JOIN componente c ON l.idComponente = c.idComponente
    WHERE l.dthCaptura >= NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}'
	) AS cvAtual,
(SELECT ROUND((STDDEV_SAMP(l.dado) / NULLIF(AVG(l.dado), 0)) * 100)
	FROM leitura l 
	JOIN maquina m ON l.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    JOIN componente c ON l.idComponente = c.idComponente
	WHERE l.dthCaptura >= NOW() - INTERVAL 14 DAY
	AND l.dthCaptura <  NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = '${componente}'
	) AS cvPassado;`;
    return database.executar(instrucaoSql);
}

function buscarKpisRede(id, maquina) {
    var instrucaoSql = `
SELECT 
(SELECT r.upload
	FROM rede r
    JOIN maquina m ON r.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    AND sm.tokenEmpresa  = '${id}' AND m.hostname = '${maquina}'
    ORDER BY r.dthCaptura DESC
    LIMIT 1) as ultimaCaptura,
(SELECT r.upload
	FROM rede r
    JOIN maquina m ON r.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}'
    ORDER BY r.dthCaptura DESC
    LIMIT 1 OFFSET 1) as penultimaCaptura,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN componente c ON l.idComponente = c.idComponente
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE l.dthCaptura >= NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = 'REDE') as alertasAtuais,
(SELECT COUNT(*) as nAlertas FROM alerta a 
	JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN componente c ON l.idComponente = c.idComponente
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
	WHERE l.dthCaptura >= NOW() - INTERVAL 14 DAY
	AND l.dthCaptura <  NOW() - INTERVAL 7 DAY 
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = 'REDE') as alertasPassados,
(SELECT COALESCE(DATEDIFF(CURDATE(), DATE(MAX(l.dthCaptura))), 'Sem Alertas') 
	FROM alerta a 
    JOIN leitura l ON l.idLeitura = a.idLeitura
    JOIN maquina m ON m.idmaquina = a.idmaquina
    JOIN componente c ON l.idComponente = c.idComponente
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    WHERE sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}' AND c.tipoComponente = 'REDE') as diasSemAlertas,
(SELECT r.packetLoss
	FROM rede r
    JOIN maquina m ON r.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    AND sm.tokenEmpresa  = '${id}' AND m.hostname = '${maquina}'
    ORDER BY r.dthCaptura DESC
    LIMIT 1) as ultimaPl,
(SELECT r.packetLoss
	FROM rede r
    JOIN maquina m ON r.idMaquina = m.idMaquina
    JOIN setorMaquina sm ON sm.idMaquina = m.idMaquina
    AND sm.tokenEmpresa = '${id}' AND m.hostname = '${maquina}'
    ORDER BY r.dthCaptura DESC
    LIMIT 1 OFFSET 1) as penultimoPl;`;
    return database.executar(instrucaoSql);
}

function buscarKpisTodasDesc(id) {
    var instrucaoSql = `CALL descKpiTodas('${id}');`; 
    return database.executar(instrucaoSql);
}

function buscarKpisGeralDesc(id, maquina) {
    var instrucaoSql = `CALL descKpiGeral('${id}', '${maquina}');`; 
    return database.executar(instrucaoSql);
}

function buscarKpisCRDDesc(id, maquina, componente) {
    var instrucaoSql = `CALL descKpiCRD('${id}', '${maquina}', '${componente}');`; 
    return database.executar(instrucaoSql);
}

function buscarKpisRedeDesc(id, maquina, componente) {
    var instrucaoSql = `CALL descKpiRede('${id}', '${maquina}', '${componente}');`; 
    return database.executar(instrucaoSql);
}

function buscarGraficosTodas(id) {
    var instrucaoSql = `CALL graficosTodas('${id}');`; 
    return database.executar(instrucaoSql);
}

function buscarGraficosGeral(id, maquina) {
    var instrucaoSql = `CALL graficosGeral('${id}', '${maquina}');`; 
    return database.executar(instrucaoSql);
}

function buscarGraficosCRD(id, maquina, componente) {
    var instrucaoSql = `CALL graficosCRD('${id}', '${maquina}', '${componente}');`; 
    return database.executar(instrucaoSql);
}

function buscarGraficosRede(id, maquina, componente) {
    var instrucaoSql = `CALL graficosRede('${id}', '${maquina}', '${componente}');`; 
    return database.executar(instrucaoSql);
}
module.exports = {
    buscarMaquinas,
    buscarKpisTodas,
    buscarKpisGeral,
    buscarKpisCRD,
    buscarKpisRede,
    buscarKpisTodasDesc,
    buscarKpisGeralDesc,
    buscarKpisCRDDesc,
    buscarKpisRedeDesc,
    buscarGraficosTodas,
    buscarGraficosGeral,
    buscarGraficosCRD,
    buscarGraficosRede,
};