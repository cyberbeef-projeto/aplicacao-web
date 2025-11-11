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
            kpi1: [kpiTodas.maquinas, "N", []], 
            kpi2: [kpiTodas.alertasAtuais, kpiTodas.alertasPassados - kpiTodas.alertasAtuais, []],
            kpi3: [kpiTodas.DiasSemAlertas, "N", []],
            kpi4: [kpiTodas.MaquinaMaisAlertas, "N", []],
            grafico1: { id: "grafico1", tipo: "line", dados: [], labels: [], titulo: "Alertas (últimos 7 dias)", xylabels: [] },
            grafico2: { id: "grafico2", tipo: "bar", dados: [], labels: [], titulo: "3 Máquinas com Mais Alertas (últimos 7 dias)", xylabels: [] }
          }
        }
      } catch (erro) {
        console.error("Erro na requisição:", erro);
      }
    }
  }

  //   recursos: {
  // geral: {
  //   kpi1: [3, "N", allKpi1], //Ordem na lista da Kpi: 1° dado da Kpi 2° Comparação com o período anterir (Caso não haja "N") 3° JSON descrevendo daados kpi
  //     kpi2: [5, -1, allKpi2],
  //       kpi3: [1, "N", allKpi3],
  //         kpi4: ["Máquina 1", "N", allKpi4],
  //           grafico1: { id: "grafico1", tipo: "line", dados: [0, 0, 0, 1, 3, 1, 0], labels: ["10/10", "11/10", "12/10", "13/10", "14/10", "15/10", "16/10"], titulo: "Alertas (últimos 7 dias)", xylabels: ["Data", "N° Alerta(s)"] },
  //   grafico2: { id: "grafico2", tipo: "bar", dados: [3, 1, 1], labels: ["Máquina 1", "Máquina 2", "Máquina 3"], titulo: "3 Máquinas com Mais Alertas (últimos 7 dias)", xylabels: ["Máquina", "N° Alerta"] }
  // }
  // }

}



