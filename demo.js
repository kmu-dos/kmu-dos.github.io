let chart1 = true;
window.onload = function (){
    let innerWidth = document.documentElement.clientWidth;
    chart1 = (innerWidth<=1000);
    changeChart();
}
window.addEventListener('resize', function (event){
    let innerWidth = document.documentElement.clientWidth;
    chart1 = (innerWidth<=1000);
    changeChart();
}, true)

function changeChart(){
    if (chart1) {
        document.getElementsByClassName('graph-topRow')[0].style.display = 'none';
        document.getElementsByClassName('graph-bottomRow')[0].style.display = 'block';
        document.getElementById('inputDiv').style.width = '50%';
        let w = document.getElementById('inputDiv').clientWidth;
        document.getElementsByClassName('help-btn')[0].style.width = w+'px';
        document.getElementById('result-data').style.width = '50%';

    }else {
        document.getElementsByClassName('graph-topRow')[0].style.display = 'block';
        document.getElementsByClassName('graph-bottomRow')[0].style.display = 'none';
        document.getElementById('inputDiv').style.width = 'calc(30% - 30px)';
        let w = document.getElementById('inputDiv').offsetWidth;
        document.getElementsByClassName('help-btn')[0].style.width = w+'px';
        document.getElementById('result-data').style.width = 'calc(40% - 60px)';
    }

}
let chart, resultChart, bottomChart, bottomResultChart
document.addEventListener("DOMContentLoaded", function(){
    chart = document.getElementById('data-graph').getContext('2d');
    resultChart = new Chart(chart, {
        type: 'bar',
        data: defaultData,
        options: defaultOption
    })
    bottomChart = document.getElementById('data-graph-wide').getContext('2d');
    bottomResultChart = new Chart(bottomChart, {
        type: 'bar',
        data: defaultData,
        options: defaultOption
    })
})
let defaultData = {
    labels: ['Sparse X Sparse', 'Sparse X Dense\n(Spark default)'],
    datasets: [{
        label: 'Latency (ms)',
        backgroundColor: "#008fff",
        data: [],
    }]
}
let defaultOption = {
    responsive:true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
    },
    scales: {
        x: {
            grid : {
                display : false,
            },
            ticks: {
                font: {
                    family : 'Roboto',
                    size: 14
                },
            }
        },
        y: {
            type: 'linear',
            position: 'left',
            scalePositionLeft: true,
            title: {
                display: true,
                text: 'Latency (ms)',
                font : {
                    family : 'Roboto',
                    size : 18,
                    weight : 'bold',
                },
                color: '#424242',
            },
            beginAtZero : true,
            min: 0,
            max: 30000,
            ticks : {
                fontSize:12,
                padding: 10,
                stepSize: 7500
            },
            grid: {
                display: true,
            }
        }
    }
}
async function submit (){
    const load = document.getElementById("loading");
    load.style.display = 'block';
    const lr = document.getElementById('nr_l').value ? document.getElementById('nr_l').value : 10000;
    const lc = document.getElementById('nc_l').value ? document.getElementById('nc_l').value : 60000;
    const rc = document.getElementById('nc_r').value ? document.getElementById('nc_r').value : 20000;
    const ld = document.getElementById('d_l').value ? document.getElementById('d_l').value : 0.0001;
    const rd = document.getElementById('d_r').value ? document.getElementById('d_r').value : 0.03;
    const lnnz = lr*lc*ld;
    const rnnz = lc*rc*rd;
    let resultData;
    const api = "https://lcukdaf75g.execute-api.us-west-2.amazonaws.com/dos-inference-stage/dos-inference-resource";
    const timeout = 10000;
    const controller = new AbortController();
    const id = setTimeout(() => {
        // 취소 callback
        load.style.display = 'none';
        alert("Timeout error. \nPlease contact the site administrator at bigdata@kookmin.ac.kr");
        controller.abort();
    }, timeout);
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
        signal: controller.signal,
    }).then((result) => result.json())
        .then((data) => {
            resultData = data.body;
            load.style.display = 'none';
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
            if(typeof resultChart != 'undefined'){
                resultChart.destroy()
            }
            resultChart = new Chart(chart, {
                type: 'bar',
                data: {
                    labels: ['Sparse X Sparse', 'Sparse X Dense (Spark default)'],
                    datasets: [{
                        label: 'Latency (ms)',
                        backgroundColor: "#4c9de7",
                        data: [sparse, dense],
                        barThickness: 50,
                        maxBarThickness: 80,
                    }]
                },
                options: {
                    responsive:true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        x: {
                            grid : {
                                display : false,
                            },
                            ticks: {
                                font: {
                                    family : 'Roboto',
                                    size: 14
                                },
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            scalePositionLeft: true,
                            title: {
                                display: true,
                                text: 'Latency (ms)',
                                font : {
                                    family : 'Roboto',
                                    size : 18,
                                    weight : 'bold',
                                },
                                color: '#424242',
                            },
                            beginAtZero : true,
                            ticks : {
                                fontSize:12,
                                padding: 10,
                            },
                            grid: {
                                display: true,
                            }
                        }
                    }

                }
            })
            if(typeof bottomResultChart != 'undefined'){
                bottomResultChart.destroy()
            }
            bottomResultChart = new Chart(bottomChart, {
                type: 'bar',
                data: {
                    labels: ['Sparse X Sparse', 'Sparse X Dense (Spark default)'],
                    datasets: [{
                        label: 'Latency (ms)',
                        backgroundColor: "#4c9de7",
                        data: [sparse, dense],
                        barThickness: 50,
                        maxBarThickness: 80,
                    }]
                },
                options: {
                    responsive:true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                    scales: {
                        x: {
                            grid : {
                                display : false,
                            },
                            ticks: {
                                font: {
                                    family : 'Roboto',
                                    size: 14
                                },
                            }
                        },
                        y: {
                            type: 'linear',
                            position: 'left',
                            scalePositionLeft: true,
                            title: {
                                display: true,
                                text: 'Latency (ms)',
                                font : {
                                    family : 'Roboto',
                                    size : 18,
                                    weight : 'bold',
                                },
                                color: '#424242',
                            },
                            beginAtZero : true,
                            ticks : {
                                fontSize:12,
                                padding: 10,
                            },
                            grid: {
                                display: true,
                            }
                        }
                    }

                }
            })
    }).catch((e) => console.log(e));
    clearTimeout(id);
}
function exampleSXS(){
    document.getElementById('nr_l').value = '10000';
    document.getElementById('nc_l').value = '60000';
    document.getElementById('nc_r').value = '20000';
    document.getElementById('d_l').value = '0.0001';
    document.getElementById('d_r').value = '0.03';
}
function exampleSXD(){
    document.getElementById('nr_l').value = '140000';
    document.getElementById('nc_l').value = '30000';
    document.getElementById('nc_r').value = '2000';
    document.getElementById('d_l').value = '0.0002';
    document.getElementById('d_r').value = '0.3';
}