var database = require("../database/config")

function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    var instrucaoSql = `
    SELECT idUsuario as id, nome, email, tokenEmpresa, permissaoUsuario
    FROM usuario WHERE email = '${email}' AND senha = '${senha}';
     `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function registrarTentativa(idUsuario, email, sucesso) {
    var sql = `
        INSERT INTO loginHistorico (fkUsuario, email, sucesso)
        VALUES (${idUsuario === null ? 'NULL' : idUsuario}, '${email}', ${sucesso});
    `;
    return database.executar(sql);
}

function cadastrar(nome, email, senha, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, fkEmpresa);
    

    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha, fk_empresa) VALUES ('${nome}', '${email}', '${senha}', '${fkEmpresa}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

// 1) Tentativas de login últimos 30 dias
function kpiTentativas() {
    var sql = `
        SELECT COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 30 DAY;
    `;
    return database.executar(sql);
}

// 2) Taxa de sucesso
function kpiTaxaSucesso() {
    var sql = `
        SELECT 
            (SUM(CASE WHEN sucesso = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS taxa
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 30 DAY;
    `;
    return database.executar(sql);
}

// 3) Contas administrativas ativas
function kpiAdminAtivos() {
    var sql = `
        SELECT COUNT(*) AS total
        FROM usuario u
        JOIN permissaoUsuario p ON u.permissaoUsuario = p.idPermissaoUsuario
        WHERE p.cargo = 'Administrador';
    `;
    return database.executar(sql);
}

// 4) Contas inativas (sem login há 30 dias)
function kpiInativos() {
    var sql = `
        SELECT COUNT(*) AS total
        FROM usuario u
        LEFT JOIN (
            SELECT fkUsuario, MAX(dataHora) AS ultimo_login
            FROM loginHistorico
            WHERE sucesso = 1
            GROUP BY fkUsuario
        ) h ON h.fkUsuario = u.idUsuario
        WHERE ultimo_login IS NULL
           OR ultimo_login < NOW() - INTERVAL 30 DAY;
    `;
    return database.executar(sql);
}

// Tentativas por dia
function graficoTentativasDia() {
    var sql = `
        SELECT DATE(dataHora) AS dia, COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 30 DAY
        GROUP BY DATE(dataHora)
        ORDER BY dia;
    `;
    return database.executar(sql);
}

// Sucesso vs falha
function graficoSucessoFalha() {
    var sql = `
        SELECT sucesso, COUNT(*) AS total
        FROM loginHistorico
        WHERE dataHora >= NOW() - INTERVAL 30 DAY
        GROUP BY sucesso;
    `;
    return database.executar(sql);
}

// Usuários por cargo
function graficoCargos() {
    var sql = `
        SELECT p.cargo, COUNT(*) AS total
        FROM usuario u
        JOIN permissaoUsuario p ON u.permissaoUsuario = p.idPermissaoUsuario
        GROUP BY p.cargo;
    `;
    return database.executar(sql);
}

// Ativas vs inativas
function graficoAtivasVsInativas() {
    var sql = `
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
    return database.executar(sql);
}

module.exports = {
    autenticar,
    cadastrar,
    registrarTentativa,
    kpiTentativas,
    kpiTaxaSucesso,
    kpiAdminAtivos,
    kpiInativos,
    graficoTentativasDia,
    graficoSucessoFalha,
    graficoCargos,
    graficoAtivasVsInativas
};