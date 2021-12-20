document.addEventListener("DOMContentLoaded", function(){
    const chart = document.getElementById('data-graph').getContext('2d');
    let resultChart = new Chart(chart, {
        type: 'bar',
        data: {
            labels: ['A', 'B'],
            datasets: [{
                label: 'latency (m/s)',
                data: [1000, 3000],
                backgroundColor : '#4CAAE8',
            }]
        },
        options: {
            plugins : {
                legend: {
                    display: false,
                }
            },
            responsive:true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    grid: {
                        display: false
                    },
                },
                y: {
                    type: 'linear',
                    position: 'left',
                    scalePositionLeft: true,
                    title: {
                        display: true,
                        text: 'Latency (ms)',
                        font : {
                            size : 14,
                        }
                    },
                }
            }
        },
    })
    console.log('hi');
})

async function submit (){
    const lr = document.getElementById('nr_l').value ? document.getElementById('nr_l').value : 10000;
    const lc = document.getElementById('nc_l').value ? document.getElementById('nc_l').value : 60000;
    const rc = document.getElementById('nc_r').value ? document.getElementById('nc_r').value : 20000;
    const ld = document.getElementById('d_l').value ? document.getElementById('d_l').value : 0.0001;
    const rd = document.getElementById('d_r').value ? document.getElementById('d_r').value : 0.03;
    const lnnz = lr*lc*ld;
    const rnnz = lc*rc*rd;
    let resultData;
    const api = "https://lcukdaf75g.execute-api.us-west-2.amazonaws.com/dos-inference-stage/dos-inference-resource";
    await fetch(api, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "lr" : lr,
            "lc" : lc,
            "rc" : rc,
            "ld" : ld,
            "rd" : rd,
            "lnnz" : lnnz,
            "rnnz" : rnnz
        }),
    }).then((result) => result.json())
        .then((data) => resultData = data.body);

    const sparse = parseInt(resultData.split("sm*sm : [")[1].split(']')[0]);
    const dense = parseInt(resultData.split('sm*dm : [')[1].split(']')[0]);
    const optimal = resultData.split('optim_method : ')[1].split('\"')[0];
    let x = optimal==='smsm' ? dense/sparse : sparse/dense;
    x = x.toFixed(2);
    document.getElementById('sparse').innerText = sparse;
    document.getElementById('dense').innerText =dense;
    document.getElementById('optim_method').innerText = x;
    document.getElementById('result-comment').innerText = optimal==='smsm' ?
        ("The performance of Sparse X Sparse is " + x + " better than the default Apache Spark SPMM.")
        : ("The performance of default Apache Spark SPMM is improved " + x + " times than Sparse X Sparse.");
    document.getElementById('result-comment').style.color = optimal==='smsm' ? 'red' : '#000';
}