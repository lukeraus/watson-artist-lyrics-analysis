var personas = [];

// Green 123, 194, 83

/* RGB Colors */

var green = [123, 194, 83];
var red = [221, 65, 49];
var blue = [1, 79, 131];
var yellow = [249, 223, 60];
var orange = [255, 199, 102]; // [243, 119, 107];

var black = [0, 0, 0];

var blue = [14, 76, 139];

var magenta = [144, 34, 81];

var orange = [244, 81, 44];

var openness = [];
var conscientiousness = [];
var agreeableness = [];
var extraversion = [];
var neuroticism = [];

var mode = "persona";

var randomScalingFactor = function() {
  return Math.round(Math.random() * 100)
};

function toggleChart() {

  if (mode === "time") {
    mode = "persona";
  } else {
    mode = "time";
  }

  drawCharts();

  console.log('toggle');
}

function makeRGB(color, opacity) {
  var rgb = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + opacity + ')';
  return rgb;
}

function basicLineChart(color) {

  var opacity = 0.8;

  var lineChartData = {
    datasets: [
      {
        label: "My First dataset",
        fillColor: makeRGB(color, 0.2),
        strokeColor: makeRGB(color, 1),
        pointColor: makeRGB(color, 1),
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: makeRGB(color, 1),
        backgroundColor: [
          'rgba(153, 215, 222, 0.9)',
          'rgba(87, 140, 169, 0.9)',
          'rgba(244, 81, 44, 0.9)',
          'rgba(206, 49, 117, 0.9)',
          'rgba(90, 114, 71, 0.9)',
          'rgba(14, 76, 139, 0.9)',
          'rgba(207, 176, 149, 0.9)',
          'rgba(103, 88, 74, 0.9)',
          'rgba(135, 175, 74,0.9)',
          'rgba(247, 209, 209, 0.9)',
          'rgba(243, 207, 85, 0.9)'

      //     'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      //   'rgba(244, 81, 44, 0.5)',
      // 'rgba(244, 81, 44, 0.5)'
        ]

      }
    ]
  }

  return lineChartData;
}

function process(album, factor, collection) {
  var value = factor.percentile.toFixed(2) * 100;

  factor.children.forEach(function(trait) {

    var traitdata = {
      'name': album.title,
      'value': trait.percentile.toFixed(2) * 100
    };

    console.log('trait.name: ' + trait.name);
    console.log('traitdata: ' + traitdata);

    if (subfactors[trait.name] != undefined) {
      subfactors[trait.name].push(traitdata);
    }
  })

  var data = {
    'name': album.title,
    'value': value
  };

  collection.push(data);
}

function compare(a, b) {
  if (a.year < b.year)
    return -1;
  else if (a.year > b.year)
    return 1;
  else
    return 0;
  }

function orderData(data) {

  var sorted = data.sort(compare);

  var sortedCount = 0;

  var orderedData = new Object();
  orderedData.labels = [];
  orderedData.data = [];

  sorted.forEach(function(element) {

    if (mode === "time") {
      orderedData.labels[sortedCount] = element.year;
    } else {
      orderedData.labels[sortedCount] = element.name;
    }

    orderedData.data[sortedCount] = element.value;
    sortedCount++;
  });

  return orderedData;
}

function buildLineData(data, color) {

  var ordered = orderData(data);

  var lineData = basicLineChart(color);

  lineData.labels = ordered.labels;
  lineData.datasets[0].data = ordered.data;

  return lineData;
}

function addChart(anchor, data) {
  var openness = document.getElementById(anchor);

  openness.innerHTML = "";

  var opennessChart = document.createElement('canvas');

  if (mode === "time") {
    opennessChart.height = 300;
    openness.style.height = '300px';
  } else {
    opennessChart.height = 400;
    openness.style.height = '400px';
  }

  opennessChart.width = 400;

  openness.appendChild(opennessChart);

  var ctx = opennessChart.getContext("2d");

  if (mode === "time") {

    var chart = new Chart(ctx).Line(data, {
      scaleOverride: true,
      scaleSteps: 10,
      scaleStepWidth: 10,
      scaleStartValue: 0,
      scaleShowVerticalLines: false
    }, {
      options: {
        legend: {
          labels: {
            fontColor: "white",
            fontSize: 18
          }
        },
        scales: {
          yAxes: [
            {
              ticks: {
                fontColor: "white",
                fontSize: 18,
                stepSize: 1,
                beginAtZero: true
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                fontColor: "white",
                fontSize: 14,
                stepSize: 1,
                beginAtZero: true
              }
            }
          ]
        }
      }
    });
  } else {

    var chart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        legend: {
          display: false
        },
        scaleShowValues: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                fontSize: 11,
                fontColor: "black",
                max: 100,
                min: 0
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                autoSkip: false,
                fontColor: "black",
                fontSize: 11
              }
            }
          ]
        }
      }
    });
  }
}

var subfactors = [];

function addOption(select, name) {
  var option = document.createElement('option');
  option.value = name;
  option.innerHTML = name;
  select.appendChild(option);

  subfactors[name] = [];
}

function buildPicker(factor) {

  console.log('Factor: ' + factor.name);

  factor.children.forEach(function(name) {

    switch (factor.name) {

      case "Openness":
        var select = document.getElementById('openness-select');
        addOption(select, name.name);
        break;

      case "Conscientiousness":
        var select = document.getElementById('conscientiousness-select');
        addOption(select, name.name);
        break;

      case "Agreeableness":
        var select = document.getElementById('agreeableness-select');
        addOption(select, name.name);
        break;

      case "Extraversion":
        var select = document.getElementById('extraversion-select');
        addOption(select, name.name);
        break;

      case "Emotional range":
        var select = document.getElementById('neuroticism-select');
        addOption(select, name.name);
        break;
    }
  })
}

function drawCharts() {
  opennessTrait()
  conscientiousnessTrait()
  agreeablenessTrait()
  extraversionTrait()
  neuroticismTrait()
}

function readCombinedData() {

  var url = './samples/kanyewest.json';

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var data = JSON.parse(xmlhttp.responseText);

      var personaCount = 0;

      var factors = data.albums[0].insights.personality;

      for (var f = 0; f < factors.length; f++) {
        buildPicker(factors[f]);
      }
      var albums = data.albums;

      albums.forEach(function(album) {

        var bigfive = album.insights.personality;

        bigfive.forEach(function(factor) {

          switch (factor.name) {

            case "Openness":
              process(album, factor, openness);
              break;

            case "Conscientiousness":
              process(album, factor, conscientiousness);
              break;

            case "Agreeableness":
              process(album, factor, agreeableness);
              break;

            case "Extraversion":
              process(album, factor, extraversion);
              break;

            case "Emotional range":
              process(album, factor, neuroticism);
              break;

          }
        });

        console.log(data);

        personaCount++;
      })

      drawCharts()
    };
  }

  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function readPersonaData() {
  var url = './personas.json';

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var data = JSON.parse(xmlhttp.responseText);

      data.results.forEach(function(persona) {
        personas[persona.key] = persona;
      });

      console.log(data);
      readCombinedData();
    }
  };

  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

function opennessTrait(e) {
  var select = document.getElementById('openness-select');
  if (select.value === 'combined') {
    addChart('openness', buildLineData(openness, orange));
  } else {
    addChart('openness', buildLineData(subfactors[select.value], orange));
  }
}

function conscientiousnessTrait(e) {
  var select = document.getElementById('conscientiousness-select');
  if (select.value === 'combined') {
    addChart('conscientiousness', buildLineData(conscientiousness, orange));
  } else {
    addChart('conscientiousness', buildLineData(subfactors[select.value], orange));
  }
}

function agreeablenessTrait(e) {
  var select = document.getElementById('agreeableness-select');
  if (select.value === 'combined') {
    addChart('agreeableness', buildLineData(agreeableness, orange));
  } else {
    addChart('agreeableness', buildLineData(subfactors[select.value], orange));
  }
}

function extraversionTrait(e) {
  var select = document.getElementById('extraversion-select');
  if (select.value === 'combined') {
    addChart('extraversion', buildLineData(extraversion, orange));
  } else {
    addChart('extraversion', buildLineData(subfactors[select.value], orange));
  }
}

function neuroticismTrait(e) {
  var select = document.getElementById('neuroticism-select');
  if (select.value === 'combined') {
    addChart('neuroticism', buildLineData(neuroticism, orange));
  } else {
    addChart('neuroticism', buildLineData(subfactors[select.value], orange));
  }
}

window.onload = function() {
  readCombinedData();
}