function changeParameters() {
    const formData = {
        'n_cranes': parseInt(document.getElementById('n_cranes').value),
        'seed': parseInt(document.getElementById('seed').value),
        'alpha_A': parseFloat(document.getElementById('alpha_A').value),
        'beta_A': parseFloat(document.getElementById('beta_A').value),
        'mean_PG': parseFloat(document.getElementById('mean_PG').value),
        'sigma_PG': parseFloat(document.getElementById('sigma_PG').value),
        'mean_MG': parseFloat(document.getElementById('mean_MG').value),
        'sigma_MG': parseFloat(document.getElementById('sigma_MG').value),
        'mean_S': parseFloat(document.getElementById('mean_S').value),
        'sigma_S': parseFloat(document.getElementById('sigma_S').value)
    };
    localStorage.setItem('formData', JSON.stringify(formData));
    $.ajax({
        url: 'http://127.0.0.1:8000/simulation',
        method: 'POST',
        success: function (response) {
            localStorage.setItem('simulation_id', response);
            window.location.href = '/SimulatorFront/examples/dashboard.html';
        },
        data: JSON.stringify(formData),
        contentType: 'application/json',
    });
}

function getResults() {
    let id = localStorage.getItem('simulation_id');
    if (id === null) {
        window.location.href = '/SimulatorFront/examples/parameters.html';
        alert('Selecciona els paràmteres amb els que executar la simulació')
    } else {
        $.ajax({
            url: `http://localhost:8000/simulation/${id}`,
            method: 'GET',
            success: function (response) {
                const meanTime = parseInt(response['mean_time']);
                if (meanTime > 3600) {
                    const hours = Math.floor(meanTime / 3600);
                    const minutes = Math.floor((meanTime % 3600) / 60);
                    const secs = Math.floor(meanTime % 60);
                    document.getElementById('mean_time').innerText = hours + 'h ' + minutes + 'm ' + secs + 's';
                }
                if (meanTime > 60) document.getElementById('mean_time').innerText = Math.floor(meanTime / 60) + 'm ' + meanTime % 60 + 's';
                else document.getElementById('mean_time').innerText = meanTime + 's';

                document.getElementById('queue_percentage').innerText = parseInt(response['percent_trucks_in_queue']) + '%';

                const maxTime = response['max_time_in_queue'];
                if (maxTime > 3600) {
                    const hours = Math.floor(maxTime / 3600);
                    const minutes = Math.floor((maxTime % 3600) / 60);
                    const secs = Math.floor(maxTime % 60);
                    document.getElementById('max_time').innerText = hours + 'h ' + minutes + 'm ' + secs + 's';
                } else if (maxTime > 60) document.getElementById('max_time').innerText = Math.floor(maxTime / 60) + 'm ' + maxTime % 60 + 's';
                else document.getElementById('max_time').innerText = maxTime + 's';

                ctx = document.getElementById('chartHours').getContext("2d");
                matrix = JSON.parse(response['n_trucks_in_queue']);
                matrix = aggregate(matrix);

                datasets = [];
                for (let i = 0; i < matrix.length; ++i) {
                    datasets.push({
                        borderColor: getColor(i),
                        backgroundColor: getColor(i),
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        borderWidth: 3,
                        data: matrix[i]
                    });
                }

                myChart = new Chart(ctx, {
                    type: 'line',

                    data: {
                        labels: ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", " 13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"],
                        datasets: datasets
                    },
                    options: {
                        legend: {
                            display: false
                        },

                        tooltips: {
                            enabled: true
                        },

                        scales: {
                            yAxes: [{

                                ticks: {
                                    fontColor: "#9f9f9f",
                                    beginAtZero: false,
                                    maxTicksLimit: 5,
                                    //padding: 20
                                },
                                gridLines: {
                                    drawBorder: false,
                                    zeroLineColor: "#ccc",
                                    color: 'rgba(255,255,255,0.05)'
                                }

                            }],

                            xAxes: [{
                                barPercentage: 1.6,
                                gridLines: {
                                    drawBorder: false,
                                    color: 'rgba(255,255,255,0.1)',
                                    zeroLineColor: "transparent",
                                    display: false,
                                },
                                ticks: {
                                    padding: 20,
                                    fontColor: "#9f9f9f"
                                }
                            }]
                        },
                    }
                });
            },
            dataType: 'json',
        });
    }
}

function downloadFiles() {
    let id = localStorage.getItem('simulation_id');
    $.ajax({
        url: `http://localhost:8000/simulation/download/${id}`,
        method: 'GET',
        success: function (response) {
            const file = new Blob([response]);
            let indexCPM = response.indexOf('CuesPerMinut.csv');
            let indexCEM = response.indexOf('CamionsEsperantPerMinut.csv');
            let indexTEC = response.indexOf('TempsEsperatPerCamio.csv');
            let indexDRS = response.indexOf('DadesResultat.csv');
            let indexTRC = response.indexOf('Traca.txt');

            let CPM = new Blob([response.substring(indexCPM, indexCEM)]);
            let CEM = new Blob([response.substring(indexCEM, indexTEC)]);
            let TEC = new Blob([response.substring(indexTEC, indexDRS)]);
            let DRS = new Blob([response.substring(indexDRS, indexTRC)]);
            let TRC = new Blob([response.substring(indexTRC)]);

            const link = document.createElement("a");
            link.href = URL.createObjectURL(CPM);
            link.download = 'CuesPerMinut.csv';
            link.click();
            link.href = URL.createObjectURL(CEM);
            link.download = 'CamionsEsperantPerMinut.csv';
            link.click();
            link.href = URL.createObjectURL(TEC);
            link.download = 'TempsEsperatPerCamio.csv';
            link.click();
            link.href = URL.createObjectURL(DRS);
            link.download = 'DadesResultat.csv';
            link.click();
            link.href = URL.createObjectURL(TRC);
            link.download = 'Traca.txt';
            link.click();
        },
    });
}


function fillParameters() {
    let data = localStorage.getItem('formData');
    if (data !== null) {
        data = JSON.parse(data);
        document.getElementById('n_cranes').value = data['n_cranes'];
        document.getElementById('seed').value = data['seed'];
        document.getElementById('alpha_A').value = data['alpha_A'];
        document.getElementById('beta_A').value = data['beta_A'];
        document.getElementById('mean_PG').value = data['mean_PG'];
        document.getElementById('sigma_PG').value = data['sigma_PG'];
        document.getElementById('mean_MG').value = data['mean_MG'];
        document.getElementById('sigma_MG').value = data['sigma_MG'];
        document.getElementById('mean_S').value = data['mean_S'];
        document.getElementById('sigma_S').value = data['sigma_S'];
    }
}

function aggregate(matrix) {
    for (let i = 0; i < matrix.length; ++i) {
        matrix[i].splice(0, 0, 0);
    }
    for (let i = 1; i < matrix.length; ++i) {
        for (let j = 0; j < 25; ++j) {
            matrix[i][j] += matrix[i - 1][j];
        }
    }
    return matrix;
}

function getColor(i) {
    switch (i % 4) {
        case 0:
            return "#6bd098";
        case 1:
            return "#f17e5d";
        case 2:
            return "#fcc468";
        case 3:
            return "#51CBCE";
    }
}

