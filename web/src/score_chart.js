function updateScoreChart() {
  var ctx = document.getElementById("scoreChart").getContext('2d');
  var scoreChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: timestamps_copy,
      datasets: [{
        label: 'Average Commit Score',
        data: cummulativeAverage,
        backgroundColor: [
          'rgba(255, 255, 255, 0)'
        ],
        borderColor: [
          'rgba(99, 132, 255, 1)',
          'rgba(235,162, 54, 1)',
          'rgba(86, 206, 255, 1)',
          'rgba(192, 192, 75, 1)',
          'rgba(255, 102, 153, 1)',
          'rgba(64, 159, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });
}