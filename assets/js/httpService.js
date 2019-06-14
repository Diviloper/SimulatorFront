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
            localStorage.setItem('simulation_id', response)
        },
        data: JSON.stringify(formData),
        contentType: 'application/json',
    });
}

function getResults() {
    let id = localStorage.getItem('simulation_id');
    if (id === null) {
        changeParameters();
        while(id === null) id = localStorage.getItem('simulation_id');
    } else {
        $.ajax({
            url: `http://localhost:8000/simulation/${id}`,
            method: 'GET',
            success: function (response) {

                document.getElementById('mean_time').innerText = parseInt(response['mean_time']) + 's';
                document.getElementById('queue_percentage').innerText = parseInt(response['percent_trucks_in_queue']) + '%';
                document.getElementById('max_time').innerText = response['max_time_in_queue'] + 's';

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
                            enabled: false
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

function aggregate(matrix) {
    for (let i = 1; i < matrix.length; ++i) {
        for (let j = 0; j < 24; ++j) {
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

