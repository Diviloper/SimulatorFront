function getQueueTrace() {
    $.ajax({
        url: 'http://localhost:5000/queueTrace',
        method: 'GET',
        success: function (response) {
            console.log(response);
            return response;
        },
        dataType: 'json',
    });
}

function changeParameters() {
    const formData = {
        'n_cranes': document.getElementById('n_cranes').value,
        'max_time': document.getElementById('max_time').value,
        'alpha_A': document.getElementById('alpha_A').value,
        'beta_A': document.getElementById('beta_A').value,
        'mean_PG': document.getElementById('mean_PG').value,
        'sigma_PG': document.getElementById('sigma_PG').value,
        'mean_MG': document.getElementById('mean_MG').value,
        'sigma_MG': document.getElementById('sigma_MG').value,
        'mean_S': document.getElementById('mean_S').value,
        'sigma_S': document.getElementById('sigma_S').value
    };
    console.log(formData);
    $.ajax({
        url: 'http://localhost:5000/post',
        method: 'POST',
        success: function (response) {
            console.log(response);
            return response;
        },
        data: JSON.stringify(formData),
        dataType: 'json',
    });
}

function getResults() {
    $.ajax({
        url: 'http://localhost:5000/results',
        method: 'GET',
        success: function (response) {
            console.log(response);

            document.getElementById('mean_time').innerText = response['mean_time'] + 's';
            document.getElementById('queue_percentage').innerText = response['queue_percentage'] + '%';
            document.getElementById('max_time').innerText = response['max_time'] + 's';

            ctx = document.getElementById('chartHours').getContext("2d");
            matrix = response['queue_matrix'];
            matrix = aggregate(matrix);

            datasets = [];
            for(let i=0; i<matrix.size(); ++i){
                datasets.add({
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

function aggregate(matrix) {
    for(let i=1; i<matrix.size(); ++i){
        for(let j=0; j<24; ++j){
            matrix[i][j] += matrix[i-1][j];
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
