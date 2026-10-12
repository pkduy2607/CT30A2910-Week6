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

async function buildChart() {
    const municipalityCode = localStorage.getItem("municipalityCode");
    const municipalityName = localStorage.getItem("municipalityName");
    json_query.query[1].selection.values[0] = municipalityCode;

    json_query.query[2].selection.values[0] = "synt-vm01"; 
    const birthData = await fetchData();

    json_query.query[2].selection.values[0] = "synt-vm11"; 
    const deathData = await fetchData();

    const chartData = {
        labels: Object.values(birthData.dimension["timeperiod_y"].category.label),
        datasets: [
            { 
                name: "Births",
                values: birthData.value 
            },
            { 
                name: "Death",
                values: deathData.value
            }
        ]
    };

    const chart = new frappe.Chart("#chart", { 
        title: "Birth and death in " + municipalityName,
        data: chartData,
        type: 'bar',
        height: 450,
        colors: ['#63d0ff', '#363636']
    });
}

document.addEventListener("DOMContentLoaded", buildChart());

document.getElementById("navigation").addEventListener("click", () => {
  window.location.href = "index.html"; 
});