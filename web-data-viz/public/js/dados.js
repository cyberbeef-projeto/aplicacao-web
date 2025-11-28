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

async function dadosGraficos(caminho, maq = null, comp = null) {
  try {
    let dados = (await (await fetch(caminho, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
        maquina: maq,
        componente: comp

      })
    })).json())
    let grafico1 = [[], []];
    let grafico2 = [[], []];
    for (const dado of dados[0]) {
      for (const chave in dado) {
        if (chave != "Dia") {
          grafico1[0].push(dado[chave])
        } else {
          grafico1[1].push(dado[chave])
        }
      }
    }
    for (const dado of dados[1]) {
      for (const chave in dado) {
        if (chave == "numAlertas" || chave == "dado") {
          grafico2[0].push(dado[chave])
        } else {
          grafico2[1].push(dado[chave])
        }
      }
    }
    return {
      graficoUm: grafico1,
      graficoDois: grafico2,
    };
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
            grafico1: { id: "grafico1", tipo: "line", dados: (await dadosGraficos("/dash/graficosTodas")).graficoUm[0], 
              labels: (await dadosGraficos("/dash/graficosTodas")).graficoUm[1], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"]},
            grafico2: { id: "grafico2", tipo: "bar", dados: (await dadosGraficos("/dash/graficosTodas")).graficoDois[0]
              , labels: (await dadosGraficos("/dash/graficosTodas")).graficoDois[1], titulo: "3 Máquinas com Mais Alertas (últimos 7 dias)", xylabels: ["Máquina", "N° Alerta(s)"]}
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
          grafico1: { id: "grafico1", tipo: "line", dados: (await dadosGraficos("/dash/graficosGeral", maquina.dashboard)).graficoUm[0], 
            labels: (await dadosGraficos("/dash/graficosGeral", maquina.dashboard)).graficoUm[1], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "bar", dados: (await dadosGraficos("/dash/graficosGeral", maquina.dashboard)).graficoDois[0],
            labels: (await dadosGraficos("/dash/graficosGeral", maquina.dashboard)).graficoDois[1], titulo: "3 Componentes com Mais Alertas (últimos 7 dias)", xylabels: ["Máquina", "N° Alerta(s)"] }
        }

        let kpiCpu = (await (await fetch("/dash/kpisCRD", {
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
          kpi1: [(Math.round(kpiCpu.ultimaCaptura, 2) + "%").replaceAll(".", ","), kpiCpu.ultimaCaptura - kpiCpu.penultimaCaptura, await descKpi("/dash/kpisCRDDesc", "Captura", 1, maquina.dashboard, "CPU")],
          kpi2: [kpiCpu.alertasAtuais, kpiCpu.alertasAtuais - kpiCpu.alertasPassados, await descKpi("/dash/kpisCRDDesc", "Alerta", 2, maquina.dashboard, "CPU")],
          kpi3: [kpiCpu.diasSemAlertas, "N", await descKpi("/dash/kpisCRDDesc", "Último Alerta", 3, maquina.dashboard, "CPU")],
          kpi4: [(Math.round(kpiCpu.cvAtual, 2) + "%").replaceAll(".", ","), kpiCpu.cvAtual - kpiCpu.cvPassado, await descKpi("/dash/kpisCRDDesc", "Balanço (últimos 7 dias)", 4, maquina.dashboard, "CPU")],
          grafico1: { id: "grafico1", tipo: "line", dados: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'CPU')).graficoUm[0], 
            labels: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'CPU')).graficoUm[1], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "histograma", dados: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'CPU')).graficoDois[0], titulo: "Histograma de Dados Capturados (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
        }

        let kpiRam = (await (await fetch("/dash/kpisCRD", {
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
          kpi1: [(Math.round(kpiRam.ultimaCaptura, 2) + "%").replaceAll(".", ","), kpiRam.ultimaCaptura - kpiRam.penultimaCaptura, await descKpi("/dash/kpisCRDDesc", "Captura", 1, maquina.dashboard, "RAM")],
          kpi2: [kpiRam.alertasAtuais, kpiRam.alertasAtuais - kpiRam.cvPassado, await descKpi("/dash/kpisCRDDesc", "Alerta", 2, maquina.dashboard, "RAM")],
          kpi3: [kpiRam.diasSemAlertas, "N", await descKpi("/dash/kpisCRDDesc", "Último Alerta", 3, maquina.dashboard, "RAM")],
          kpi4: [(Math.round(kpiRam.cvAtual, 2) + "%").replaceAll(".", ","),, kpiRam.cvAtual - kpiRam.alertasAtuais, await descKpi("/dash/kpisCRDDesc", "Balanço (últimos 7 dias)", 4, maquina.dashboard, "RAM")],
          grafico1: { id: "grafico1", tipo: "line", dados: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'RAM')).graficoUm[0], 
            labels: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'RAM')).graficoUm[1], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "histograma", dados:  (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'RAM')).graficoDois[0], titulo: "Histograma de Dados Capturados (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
            
        }

        let kpiDisco = (await (await fetch("/dash/kpisCRD", {
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
          kpi1: [(Math.round(kpiDisco.ultimaCaptura, 2) + "%").replaceAll(".", ","), kpiDisco.ultimaCaptura - kpiDisco.penultimaCaptura, await descKpi("/dash/kpisCRDDesc", "Captura", 1, maquina.dashboard, "DISCO")],
          kpi2: [kpiDisco.alertasAtuais, kpiDisco.alertasAtuais - kpiDisco.alertasPassados, await descKpi("/dash/kpisCRDDesc", "Alerta", 2, maquina.dashboard, "DISCO")],
          kpi3: [kpiDisco.diasSemAlertas, "N", await descKpi("/dash/kpisCRDDesc", "Último Alerta", 3, maquina.dashboard, "DISCO")],
          kpi4: [(Math.round(kpiDisco.cvAtual, 2) + "%").replaceAll(".", ","), kpiDisco.cvAtual - kpiDisco.cvPassado, await descKpi("/dash/kpisCRDDesc", "Balanço (últimos 7 dias)", 4, maquina.dashboard, "DISCO")],
          grafico1: { id: "grafico1", tipo: "line", dados: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'DISCO')).graficoUm[0],
             labels: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'DISCO')).graficoUm[1], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "histograma", dados: (await dadosGraficos("/dash/graficosCRD", maquina.dashboard, 'DISCO')).graficoDois[0], titulo: "Histograma de Dados Capturados (últimos 7 dias)", xylabels: ["Intervalo Capturado (%)", "Frequência"] }
        
        }

        let kpiRede = (await (await fetch("/dash/kpisRede", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenEmpresa: sessionStorage.TOKEN_EMPRESA,
            maquina: maquina.dashboard,
          })
        })).json())
        kpiRede = kpiRede[0];
        maquina.recursos['rede'] = {
          kpi1: [(Math.round(kpiRede.ultimaCaptura, 2) + "MB/s").replaceAll(".", ","), kpiRede.ultimaCaptura - kpiRede.penultimaCaptura, await descKpi("/dash/kpisRedeDesc", "Captura", 1, maquina.dashboard, "REDE")],
          kpi2: [kpiRede.alertasAtuais, kpiRede.alertasAtuais - kpiRede.alertasPassados, await descKpi("/dash/kpisRedeDesc", "Alerta", 2, maquina.dashboard, "REDE")],
          kpi3: [kpiRede.diasSemAlertas, "N", await descKpi("/dash/kpisRedeDesc", "Último Alerta", 3, maquina.dashboard, "REDE")],
          kpi4: [(Math.round(kpiRede.ultimaPl, 2) + "%").replaceAll(".", ","), kpiRede.ultimaPl - kpiRede.penultimoPl, await descKpi("/dash/kpisRedeDesc", "Captura", 4, maquina.dashboard, "REDE")],
          grafico1: { id: "grafico1", tipo: "line", dados: (await dadosGraficos("/dash/graficosRede", maquina.dashboard, 'REDE')).graficoUm[0],
             labels: (await dadosGraficos("/dash/graficosRede", maquina.dashboard, 'REDE')).graficoUm[1], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
          grafico2: { id: "grafico2", tipo: "histograma", dados: (await dadosGraficos("/dash/graficosRede", maquina.dashboard, 'REDE')).graficoDois[0], titulo: "Histograma de Perda de Pacotes (últimos 7 dias)", xylabels: ["Intervalo (%)", "Frequência"] }

        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
      }
    }
  }
  console.log(descKpi("/dash/kpisCRDDesc", "Captura", 1, "Servidor SCADA", "CPU"))

  
}
