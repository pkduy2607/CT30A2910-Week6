let json_query = {
  "query": [
    {
      "code": "timeperiod_y",
      "selection": {
        "filter": "item",
        "values": [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      "code": "alue_23_20260101",
      "selection": {
        "filter": "item",
        "values": [
          "SSS"
        ]
      }
    },
    {
      "code": "contentscode",
      "selection": {
        "filter": "item",
        "values": [
          "synt-vaesto"
        ]
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
}

// function to fetch the population data using json_query defined above
const fetchData = async () => {
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/12dy.px";
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json_query)
        });

        const data = await response.json();
        return data;
    } catch (err) {
        console.error("Error:", err.message);
    }
};

// function to fetch the list of municipality codes, this function will be call one time when the program start
const fetchMunicipalityCode = async () => {
    const url = "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/12dy.px";

    try {
        const response = await fetch(url);
        const data = await response.json();

        const codes = data.variables[1].values;
        const names = data.variables[1].valueTexts;
        const municipalities = codes.map((code, index) => ({
            code: code,
            name: names[index].toLowerCase()
        }));
        return municipalities;
    } catch (err) {
        console.error("Error:", err.message);
    }
};

function buildChart(chartData, chartTitle, chartType, chartHeight, chartColors) {
  const chart = new frappe.Chart("#chart", { 
    title: chartTitle,
    data: chartData,
    type: chartType,
    height: chartHeight,
    colors: chartColors
  });
}

async function initApp() {
  const municipalities = await fetchMunicipalityCode();
  const form = document.querySelector("form");
  const submitButton = document.getElementById("submit-data");
  const div = document.querySelector("#chart");
  let currentChartData = null;
  let municipalityName = "whole country";
  let municipalityCode = "SSS";

  // build the first chart
  const populationData = await fetchData();
  currentChartData = {
    labels: Object.values(populationData.dimension["timeperiod_y"].category.label),
    datasets: [
      { values: populationData.value }
    ]
  };
  buildChart(currentChartData, "Population growth in whole country", 'line', 450, ['#eb5146']);

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();
    div.innerHTML = "";
        
    // get the municipality code from the name that user entered
    const formData = new FormData(form);
    municipalityName = formData.get("municipality").toLowerCase();

    for (let i = 0; i < municipalities.length; i++) {
      if (municipalities[i].name == municipalityName) {
        municipalityCode = municipalities[i].code;
        break;
      }
    }
    // change the municipality code in the json_query
    if (municipalityCode == null) {
      alert("Invalid municipality. Enter again!");
      return;
    } else {
      json_query.query[1].selection.values[0] = municipalityCode;
    }

    const data = await fetchData();
    currentChartData = {
      labels: Object.values(data.dimension["timeperiod_y"].category.label),
      datasets: [
        { values: data.value }
      ]
    };

    const formattedMunicipality = municipalityName[0].toUpperCase() + municipalityName.slice(1);
    buildChart(currentChartData, "Population growth in " + formattedMunicipality, 'line', 450, ['#eb5146']);

    // save the municipality details to use in new-chart.js
    localStorage.setItem("municipalityCode", municipalityCode);
    localStorage.setItem("municipalityName", formattedMunicipality);
  });

  const addDataButton = document.getElementById("add-data");

  addDataButton.addEventListener("click", (event) => {
    event.preventDefault();
    div.innerHTML = "";
        
    // check if the chart data is empty
    if (Object.keys(currentChartData).length == 0) {
      alert("Please enter the municipality name first!");
      return;
    }
        
    // add the new estimated value
    let newValue = 0;
    const currentValueObject = Object.values(currentChartData.datasets);
    const currentValue = Object.values(currentValueObject[0])[0];
    for (let i = 1; i < currentValue.length; i++) {          
      newValue += currentValue[i] - currentValue[i - 1];
    }
    newValue /= (currentValue.length - 1);
    newValue += currentValue.at(-1);
    currentValue.push(Math.round(newValue));
        
    const currentYear = Object.values(currentChartData.labels);
    const newYear = parseInt(currentYear.at(-1), 10) + 1;
    currentYear.push(newYear);

    currentChartData = {
      labels: currentYear,
      datasets: [
        { values: currentValue }
      ]
    };
        
    const formattedMunicipality = municipalityName[0].toUpperCase() + municipalityName.slice(1);
    buildChart(currentChartData, "Population growth in " + formattedMunicipality, 'line', 450, ['#eb5146']);
  });
}

document.addEventListener("DOMContentLoaded", initApp);

document.getElementById("navigation").addEventListener("click", () => {
  window.location.href = "index.html"; 
});