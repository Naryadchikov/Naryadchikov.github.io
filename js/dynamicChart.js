window.onload = function () {
    drawChart("chartContainerX", "Ex(t)", getEnergyX);
    drawChart("chartContainerY", "Ey(t)", getEnergyY);
}

function drawChart(containerName, chartName, getUpdatedValueFunction) {
    var dps = []; // dataPoints
    var chart = new CanvasJS.Chart(containerName, {
        title: {
            text: chartName
        },
        axisY: {
            includeZero: false
        },
        data: [{
            type: "line",
            dataPoints: dps
        }]
    });

    var xVal = 0;
    var yVal = 0;
    var updateInterval = 1 / 60;
    var dataLength = 1000; // number of dataPoints visible at any point

    var updateChart = function (count) {

        count = count || 1;

        for (var j = 0; j < count; j++) {
            yVal = getUpdatedValueFunction();
            dps.push({
                x: xVal,
                y: yVal
            });
            xVal++;
        }

        if (dps.length > dataLength) {
            dps.shift();
        }

        chart.render();
    };

    updateChart(dataLength);
    setInterval(function () { updateChart() }, updateInterval);
}