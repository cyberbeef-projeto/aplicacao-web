
    async function carregarDashboard() {
        try {
            const resposta = await fetch("/dashEmpresa/dashboard");
            const dados = await resposta.json();

            console.log(" Dados recebidos:", dados);

        
            atualizarKPIs(dados.kpis);
            atualizarGraficoCidades(dados.graficos.cidades);
            atualizarGraficoLinha(dados.graficos.ativos, dados.graficos.inativos);

            
            atualizarMapaBrasil(dados.graficos.estados);

        } catch (erro) {
            console.error("Erro ao carregar dashboard", erro);
        }
    }

    carregarDashboard();

    setInterval(() => {
        carregarDashboard();
        obterQtdCidadesEstados();
        // atualizarKPIs(); 
    }, 30000);


    function atualizarKPIs(kpi) {
        document.getElementById("kpi1").innerText = kpi.totalEmpresas;
        document.getElementById("kpi2").innerText = kpi.churnRate + "%";
        document.getElementById("kpi3").innerText = kpi.novasEmpresas;
        document.getElementById("kpi4").innerText = kpi.growthRate + "%";
    }



    let grafico1;
    function atualizarGraficoCidades(cidades) {
        const labels = cidades.map(c => c.cidade);
        const valores = cidades.map(c => c.quantidade);

        const ctx = document.getElementById("grafico1").getContext("2d");

        if (grafico1) grafico1.destroy();

        const gradientBar = ctx.createLinearGradient(0, 0, 0, 300);
        gradientBar.addColorStop(0, "rgba(70,130,255,0.9)");
        gradientBar.addColorStop(1, "rgba(70,130,255,0.3)");

        grafico1 = new Chart(ctx, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: "Contratos",
                        data: valores,
                        backgroundColor: gradientBar,
                        borderRadius: 8,
                        borderWidth: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Top 5 Cidades por Número de Cadastros - Semestre Atual",
                        color: "#fff",
                        font: { size: 14, weight: "bold" }
                    },
                    padding: {
                    top: 10,
                    bottom: 30   
                }
                },
                scales: {
                    x: {
                        ticks: { color: "#cfd7ff", font: { size: 11 } },
                        grid: { display: false }
                    },
                    y: {
                        ticks: { color: "#cfd7ff", font: { size: 11 } },
                        grid: { color: "rgba(255,255,255,0.07)" }
                    }
                }
            }
        });
    }

let grafico3;

function atualizarGraficoLinha(ativos, inativos) {
    const ctx = document.getElementById("grafico3").getContext("2d");

    if (grafico3) grafico3.destroy();

    // Gradientes
    const grad1 = ctx.createLinearGradient(0, 0, 0, 300);
    grad1.addColorStop(0, "rgba(0,140,255,0.35)");
    grad1.addColorStop(1, "rgba(0,140,255,0)");

    const grad2 = ctx.createLinearGradient(0, 0, 0, 300);
    grad2.addColorStop(0, "rgba(255,0,80,0.35)");
    grad2.addColorStop(1, "rgba(255,0,80,0)");

    // Labels fixas dos 6 meses de 2025
    const meses = ["Jun/25", "Jul/25", "Ago/25", "Set/25", "Out/25", "Nov/25"];

    // Distribuindo os valores ao longo dos 6 meses
    // Exemplo: SOMA final = ativos (hoje). Ele preenche crescimento suave.
    const gerarDistribuicao = (total) => {
        const valores = [];
        for (let i = 1; i <= 6; i++) {
            valores.push(Math.round((total / 6) * i));
        }
        return valores;
    };

    const dadosAtivos = gerarDistribuicao(ativos);
    const dadosInativos = gerarDistribuicao(inativos);

    grafico3 = new Chart(ctx, {
        type: "line",
        data: {
            labels: meses,
            datasets: [
                {
                    label: "Empresas Ativas",
                    data: dadosAtivos,
                    borderColor: "#008cff",
                    backgroundColor: grad1,
                    fill: true,
                    borderWidth: 3,
                    tension: 0.45,
                    pointRadius: 5,
                    pointHoverRadius: 7
                },
                {
                    label: "Empresas Inativas",
                    data: dadosInativos,
                    borderColor: "#ff0050",
                    backgroundColor: grad2,
                    fill: true,
                    borderWidth: 3,
                    tension: 0.45,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: "#fff" } },
                title: {
                    display: true,
                    text: "Desempenho Mensal de Contratação — Semestre Atual",
                    color: "#fff",
                    font: { size: 14, weight: "bold" }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#cfd7ff" },
                    grid: { color: "rgba(255,255,255,0.05)" }
                },
                y: {
                    ticks: { color: "#cfd7ff" },
                    grid: { color: "rgba(255,255,255,0.07)" }
                }
            }
        }
    });
}



    function atualizarMapaBrasil(estados) {
        google.charts.load("current", {
            packages: ["geochart"],
            mapsApiKey: "AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY"
        });

        google.charts.setOnLoadCallback(() => {
            const dataArray = [["Estado", "Clientes"]];

            estados.forEach(e => {
                dataArray.push([`BR-${e.estado}`, e.quantidade]);
            });

            const data = google.visualization.arrayToDataTable(dataArray);

            const options = {
                region: "BR",
                resolution: "provinces",
                displayMode: "regions",
                backgroundColor: "transparent",
                datalessRegionColor: "#fff",
                colorAxis: { colors: ["#8AB4FF", "#1A3DBE"] },
                legend: "none"
            };

            const chart = new google.visualization.GeoChart(
                document.getElementById("geoChart")
            );

            chart.draw(data, options);
        });
    }


    function obterQtdCidadesEstados() {
        fetch("/dashEmpresa/obterQtdCidadesEstados")
            .then(res => res.json())
            .then(dados => {
                document.getElementById("qtd-cidades").innerText = dados[0].cidades;
                document.getElementById("qtd-estados").innerText = dados[0].estados;
            })
            .catch(err => console.error("Erro ao carregar cidades/estados:", err));
    }


    obterQtdCidadesEstados();




    function atualizarBarraLateral() {
        const barraLateral = document.querySelector('.barra_lateral');
        const elementos = document.getElementById('elementos');

        if (barraLateral.classList.contains('ativa')) {
            barraLateral.classList.remove('ativa');
            elementos.classList.remove('bl_ativa');
        } else {
            barraLateral.classList.add('ativa');
            elementos.classList.add('bl_ativa');
        }
        

    }




