var database = require("../database/config");

function buscarKpis() {
    // KPI 1: Total de Máquinas
    // KPI 2: Tempo sem Downtime (Diferença em minutos do último alerta crítico até agora)
    // KPI 3: Capturas por minuto (Leituras no último minuto)
    // KPI 4: Data do Último Downtime
    var instrucaoSql = `
        SELECT 
            (SELECT COUNT(idMaquina) FROM maquina) as totalMaquinas,
            
            (SELECT TIMESTAMPDIFF(MINUTE, MAX(l.dthCaptura), NOW()) 
             FROM alerta a JOIN leitura l ON a.idLeitura = l.idLeitura 
             WHERE a.descricao = 'Crítico') as tempoSemDowntime,
             
            (SELECT COUNT(idLeitura) FROM leitura 
             WHERE dthCaptura > DATE_SUB(NOW(), INTERVAL 1 MINUTE)) as capturasPorMinuto,
             
            (SELECT DATE_FORMAT(MAX(l.dthCaptura), '%d/%m %H:%i') 
             FROM alerta a JOIN leitura l ON a.idLeitura = l.idLeitura 
             WHERE a.descricao = 'Crítico') as dtUltimoDowntime;
    `;
    return database.executar(instrucaoSql);
}

function buscarStatusRecursos(idMaquina) {
    // Essa query retorna as classes CSS (led-red, color-down) prontas para o Front-end
    // Baseia-se na tabela 'parametro' para decidir se é Crítico ou não
    var instrucaoSql = `
        SELECT 
            c.tipoComponente AS nome,
            l.dado AS valor,
            c.unidadeMedida AS unidade,
            CASE 
                WHEN l.dado >= p.max THEN 'CRÍTICO'
                WHEN l.dado >= (p.max * 0.8) THEN 'ALERTA'
                ELSE 'ESTÁVEL'
            END AS status_texto,
            CASE 
                WHEN l.dado >= p.max THEN 'led-red'
                WHEN l.dado >= (p.max * 0.8) THEN 'led-yellow'
                ELSE 'led-green'
            END AS cor_led,
            CASE 
                WHEN l.dado >= p.max THEN 'color-down'
                WHEN l.dado >= (p.max * 0.8) THEN 'color-warn'
                ELSE 'color-up'
            END AS cor_texto
        FROM leitura l
        JOIN componente c ON l.idComponente = c.idComponente
        JOIN parametro p ON p.idComponente = c.idComponente AND p.idMaquina = l.idMaquina
        WHERE l.idLeitura IN (
            SELECT MAX(l2.idLeitura)
            FROM leitura l2
            JOIN componente c2 ON l2.idComponente = c2.idComponente
            WHERE l2.idMaquina = ${idMaquina}
            GROUP BY l2.idComponente
        );
    `;
    return database.executar(instrucaoSql);
}

function buscarGraficos() {
    // Retorna o Top 5 máquinas com mais alertas para o gráfico de barras
    var instrucaoSql = `
        SELECT m.hostname, COUNT(a.idAlerta) as qtd_alertas
        FROM alerta a
        JOIN maquina m ON a.idMaquina = m.idMaquina
        GROUP BY m.hostname
        ORDER BY qtd_alertas DESC
        LIMIT 5;
    `;
    return database.executar(instrucaoSql);
}

module.exports = {
    buscarKpis,
    buscarStatusRecursos,
    buscarGraficos
};