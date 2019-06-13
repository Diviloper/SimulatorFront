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
    let newParameters = document.getElementById('parameters');
    let formData = new FormData(newParameters);
}
