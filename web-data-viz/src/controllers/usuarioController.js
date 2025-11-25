var usuarioModel = require("../models/usuarioModel");

function autenticar(req, res) {
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    if (!email) return res.status(400).send("Seu email está undefined!");
    if (!senha) return res.status(400).send("Sua senha está undefined!");

    usuarioModel.autenticar(email, senha)
        .then(function (resultadoAutenticar) {

            // SE LOGIN FALHAR
            if (resultadoAutenticar.length == 0) {
                usuarioModel.registrarTentativa(null, email, 0);
                return res.status(403).send("Email, senha ou token inválido(s)");
            }

            if (resultadoAutenticar.length == 1) {

                // LOGIN OK
                let usuario = resultadoAutenticar[0];

                usuarioModel.registrarTentativa(
                    usuario.id,
                    usuario.email,
                    1
                );

                return res.json({
                    token: usuario.tokenEmpresa,
                    id: usuario.id,
                    email: usuario.email,
                    nome: usuario.nome,
                    permissao: usuario.permissaoUsuario
                });
            }

            return res.status(403).send("Mais de um usuário com o mesmo login!");

        })
        .catch(function (erro) {
            console.log("Erro ao autenticar: ", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;
    var fkEmpresa = req.body.idEmpresaVincularServer;

    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    } else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    } else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else if (fkEmpresa == undefined) {
        res.status(400).send("Sua empresa a vincular está undefined!");
    } else {

        
        usuarioModel.cadastrar(nome, email, senha, fkEmpresa)
            .then(
                function (resultado) {
                    res.json(resultado);
                }
            ).catch(
                function (erro) {
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

// Tentativas
function kpiTentativas(req, res) {
    usuarioModel.kpiTentativas()
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

// Taxa de sucesso
function kpiTaxaSucesso(req, res) {
    usuarioModel.kpiTaxaSucesso()
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

// Admins ativos
function kpiAdminAtivos(req, res) {
    usuarioModel.kpiAdminAtivos()
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

// Contas inativas
function kpiInativos(req, res) {
    usuarioModel.kpiInativos()
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function graficoTentativasDia(req, res) {
    usuarioModel.graficoTentativasDia()
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function graficoSucessoFalha(req, res) {
    usuarioModel.graficoSucessoFalha()
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function graficoCargos(req, res) {
    usuarioModel.graficoCargos()
        .then(resultado => res.json(resultado))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

function graficoAtivasVsInativas(req, res) {
    usuarioModel.graficoAtivasVsInativas()
        .then(resultado => res.json(resultado[0]))
        .catch(erro => res.status(500).json(erro.sqlMessage));
}

async function security(req, res) {
    try {
        const tokenEmpresa = req.query.tokenEmpresa;

        const kpiTentativas = await usuarioModel.kpiTentativas();
        const kpiSucesso = await usuarioModel.kpiTaxaSucesso();
        const kpiAdmins = await usuarioModel.kpiAdminAtivos();
        const kpiInativos = await usuarioModel.kpiInativos();

        const graf1 = await usuarioModel.graficoTentativasDia();
        const graf2 = await usuarioModel.graficoSucessoFalha();
        const graf3 = await usuarioModel.graficoCargos();

        res.json({
            kpis: {
                tentativas30d: kpiTentativas[0].total,
                taxaSucesso: kpiSucesso[0].taxa,
                contasAdmin: kpiAdmins[0].total,
                contasInativas: kpiInativos[0].total
            },
            grafico1: {
                labels: graf1.map(l => l.dia),
                dados: graf1.map(l => l.total)
            },
            grafico2: {
                labels: graf2.map(g => g.sucesso),
                dados: graf2.map(g => g.total)
            },
            grafico3: {
                labels: graf3.map(g => g.cargo),
                dados: graf3.map(g => g.total)
            }
        });

    } catch (erro) {
        console.error("Erro em /security:", erro);
        res.status(500).json(erro.message);
    }
}

module.exports = {
    autenticar,
    cadastrar,
    kpiTentativas,
    kpiTaxaSucesso,
    kpiAdminAtivos,
    kpiInativos,
    graficoTentativasDia,
    graficoSucessoFalha,
    graficoCargos,
    graficoAtivasVsInativas,
    security    
};