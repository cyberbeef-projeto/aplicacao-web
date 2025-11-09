let dados = [
  {
    dashboard: "Todas as Máquinas",
    recursos: {}
  },
];

async function trazerDadosDash() {
  try {
    (await (await fetch("/dash/maquinas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenEmpresa: sessionStorage.TOKEN_EMPRESA })
    })).json()).forEach(maquina => {
      dados.push({
        dashboard: maquina.hostname,
        recursos: {}
        }
      );
    });
  } catch (erro) {
    console.error("Erro na requisição:", erro);
  }
}



