import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import './App.css';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json').then(data => {
      setData(data);
    });
  }, []);

  useEffect(() => {
    if (data) {
      drawHeatMap(data);
    }
  }, [data]);

  const drawHeatMap = (data) => {
    const margin = { top: 50, right: 20, bottom: 100, left: 80 };
    const width = 1200 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
    
    const baseTemperature = data.baseTemperature;
    const monthlyData = data.monthlyVariance;

    const svg = d3.select("#heatmap")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleTime()
      .domain([new Date(d3.min(monthlyData, d => d.year), 0), new Date(d3.max(monthlyData, d => d.year), 0)])
      .range([0, width]);

    const yScale = d3.scaleBand()
      .domain([0,1,2,3,4,5,6,7,8,9,10,11])
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)
      .domain([d3.max(monthlyData, d => baseTemperature + d.variance), d3.min(monthlyData, d => baseTemperature + d.variance)]);

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y")));

    svg.append("g")
      .attr("id", "y-axis")
      .call(d3.axisLeft(yScale).tickFormat(month => d3.timeFormat("%B")(new Date(0, month))));

    svg.selectAll()
      .data(monthlyData, d => `${d.year}:${d.month}`)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("data-month", d => d.month - 1)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemperature + d.variance)
      .attr("x", d => xScale(new Date(d.year, 0)))
      .attr("y", d => yScale(d.month - 1))
      .attr("width", (width / (d3.max(monthlyData, d => d.year) - d3.min(monthlyData, d => d.year))))
      .attr("height", yScale.bandwidth())
      .attr("fill", d => colorScale(baseTemperature + d.variance))
      .on("mouseover", function(event, d) {
        const tooltip = d3.select("#tooltip");
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(`Year: ${d.year}<br/>Month: ${d3.timeFormat("%B")(new Date(0, d.month - 1))}<br/>Temperature: ${d3.format(".1f")(baseTemperature + d.variance)}&deg;C`)
          .attr("data-year", d.year)
          .style("left", (event.pageX + 5) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        d3.select("#tooltip").transition().duration(500).style("opacity", 0);
      });

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(0, ${height + 40})`);

    const legendData = [2, 4, 6, 8, 10];
    const legendWidth = width / legendData.length;

    legend.selectAll()
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * legendWidth)
      .attr("width", legendWidth)
      .attr("height", 20)
      .attr("fill", d => colorScale(d));

    legend.selectAll()
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * legendWidth + legendWidth / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .text(d => `${d}°C`);
  };

  return (
    <div className="App">
      <h1 id="title">Monthly Global Land-Surface Temperature</h1>
      <p id="description">1753 - 2015: base temperature 8.66℃</p>
      <div id="heatmap"></div>
      <div id="tooltip" style={{ opacity: 0, position: 'absolute', textAlign: 'center', width: '120px', height: 'auto', padding: '10px', fontSize: '12px', background: 'lightsteelblue', border: '0px', borderRadius: '8px', pointerEvents: 'none' }}></div>
    </div>
  );
}

export default App;
