let dados = [
  {
    dashboard: "Todas as Máquinas",
    recursos: {}
  },
];

async function descKpi(caminho, info, kpi, maq = null, comp = null) {
  try {
    let descricao = (await (await fetch(caminho, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
        maquina: maq,
        componente: comp

      })
    })).json())
    let retorno = [];
    for (const desc of descricao[kpi - 1]) {
      let dado = {
        titulo: info,
        dados: []
      }
      for (const chave in desc) {
        dado.dados.push({ nome: chave, valor: desc[chave] })
      }
      retorno.push(dado);
    }
    return retorno;
  } catch (erro) {
    console.error("Erro na requisição:", erro);
  }
}

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

  for (const maquina of dados) {
    if (maquina.dashboard == "Todas as Máquinas") {
      try {
        let kpiTodas = (await (await fetch("/dash/kpisTodas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokenEmpresa: sessionStorage.TOKEN_EMPRESA })
        })).json())
        kpiTodas = kpiTodas[0];
        maquina.recursos = {
          geral: {
            kpi1: [kpiTodas.maquinas, "N", await descKpi("/dash/kpisTodasDesc", "", 1)],
            kpi2: [kpiTodas.alertasAtuais, kpiTodas.alertasAtuais - kpiTodas.alertasPassados, await descKpi("/dash/kpisTodasDesc", "Alerta", 2)],
            kpi3: [kpiTodas.DiasSemAlertas, "N", await descKpi("/dash/kpisTodasDesc", "Último Alerta", 3)],
            kpi4: [kpiTodas.MaquinaMaisAlertas, "N", await descKpi("/dash/kpisTodasDesc", "Alerta", 4)],
            grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: [] },
            grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "3 Máquinas com Mais Alertas (últimos 7 dias)", xylabels: [] }
          }
        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
      }
    }
    else {
      try {
        let kpiGeral = (await (await fetch("/dash/kpisGeral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
            maquina: maquina.dashboard
          })
        })).json())
        kpiGeral = kpiGeral[0];
        maquina.recursos['geral'] = {
          kpi1: [kpiGeral.setores, "N", await descKpi("/dash/kpisGeralDesc", "", 1, maquina.dashboard)],
          kpi2: [kpiGeral.alertasAtuais, kpiGeral.alertasAtuais - kpiGeral.alertasPassados, await descKpi("/dash/kpisGeralDesc", "Alerta", 2, maquina.dashboard)],
          kpi3: [kpiGeral.diasSemAlertas, "N", await descKpi("/dash/kpisGeralDesc", "Último Alerta", 3, maquina.dashboard)],
          kpi4: [kpiGeral.ComponenteMaisAlertas, "N", await descKpi("/dash/kpisGeralDesc", "Alerta", 4, maquina.dashboard)],
          grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "3 Componentes com Mais Alertas (últimos 7 dias)", xylabels: ["Máquina", "N° Alerta(s)"] }
        }

        let kpiCpu = (await (await fetch("/dash/kpisGeral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
            maquina: maquina.dashboard,
            componente: 'CPU'
          })
        })).json())
        kpiCpu = kpiCpu[0];
        maquina.recursos['cpu'] = {
          kpi1: [kpiCpu.ultimaCaptura + "%", kpiCpu.ultimaCaptura - kpiCpu.penultimaCaptura, []],
          kpi2: [kpiCpu.alertasAtuais, kpiCpu.alertasAtuais - kpiCpu.alertasPassados, []],
          kpi3: [kpiCpu.diasSemAlertas, "N", []],
          kpi4: [kpiCpu.cvAtual + "%", kpiCpu.cvAtual - kpiCpu.cvPassado, []],
          grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "Histograma de Dados Capturados (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
        }

        let kpiRam = (await (await fetch("/dash/kpisGeral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
            maquina: maquina.dashboard,
            componente: 'RAM'
          })
        })).json())
        kpiRam = kpiRam[0];
        maquina.recursos['ram'] = {
          kpi1: [kpiRam.ultimaCaptura + "%", kpiRam.ultimaCaptura - kpiRam.penultimaCaptura, []],
          kpi2: [kpiRam.alertasAtuais, kpiRam.alertasAtuais - kpiRam.cvPassado, []],
          kpi3: [kpiRam.diasSemAlertas, "N", []],
          kpi4: [kpiRam.cvAtual + "%", kpiRam.cvAtual - kpiRam.alertasAtuais, []],
          grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "Histograma de Dados Capturados (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
        }

        let kpiDisco = (await (await fetch("/dash/kpisGeral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
            maquina: maquina.dashboard,
            componente: 'DISCO'
          })
        })).json())
        kpiDisco = kpiDisco[0];
        maquina.recursos['disco'] = {
          kpi1: [kpiDisco.ultimaCaptura + "%", kpiDisco.ultimaCaptura - kpiDisco.penultimaCaptura, []],
          kpi2: [kpiDisco.alertasAtuais, kpiDisco.alertasAtuais - kpiDisco.alertasPassados, []],
          kpi3: [kpiDisco.diasSemAlertas, "N", []],
          kpi4: [kpiDisco.cvAtual + "%", kpiDisco.cvAtual - kpiDisco.cvPassado, []],
          grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "Histograma de Dados Capturados (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
        }

        let kpiRede = (await (await fetch("/dash/kpisGeral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
            maquina: maquina.dashboard,
          })
        })).json())
        kpiRede = kpiRede[0];
        maquina.recursos['rede'] = {
          kpi1: [kpiRede.ultimaCaptura + "%", kpiRede.ultimaCaptura - kpiRede.penultimaCaptura, []],
          kpi2: [kpiRede.alertasAtuais, kpiRede.alertasAtuais - kpiRede.alertasPassados, []],
          kpi3: [kpiRede.diasSemAlertas, "N", []],
          kpi4: [kpiRede.plAtual + "%", kpiRede.plkAtual - kpiRede.plPassado, []],
          grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "Histograma de Perda de Pacotes (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
      }

    }
  }

}
