function drawParallelCoordinates() {
    d3.json('data/a1-cars.json').then(data => {
        const dimensions = ['Horsepower', 'MPG', 'Cylinders', 'Weight'];
        const width = 800;
        const height = 600;
        const margin = { top: 50, right: 120, bottom: 40, left: 60 };

        // Setup the color scale
        const origins = Array.from(new Set(data.map(d => d.Origin)));
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(origins);

        // Append the svg object to the body of the page
        const svg = d3.select('svg')
            .attr('width', width + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        // Initialize a simple tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "lightsteelblue")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("pointer-events", "none");

        // For each dimension, build a linear scale
        const yScales = dimensions.reduce((acc, dim) => ({
            ...acc,
            [dim]: d3.scaleLinear()
                .domain(d3.extent(data, d => +d[dim]))
                .range([height - margin.bottom, margin.top])
        }), {});

        // Build the X scale and axis
        const xScale = d3.scalePoint()
            .range([margin.left, width - margin.right])
            .domain(dimensions);

        // Draw the paths
        const paths = svg.selectAll("myPath")
            .data(data)
            .enter()
            .append("path")
            .attr("class", d => "line line-origin-" + d.Origin.replace(/[^a-zA-Z]/g, ""))
            .attr("d", function (d) {
                return d3.line()(dimensions.map(p => [xScale(p), yScales[p](d[p])]));
            })
            .style("fill", "none")
            .style("stroke", d => colorScale(d.Origin))
            .style("opacity", 0.5)
            .on("mouseover", function (event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(dimensions.map(dim => `${dim}: ${d[dim]}`).join("<br>"))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function () {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Draw the axes
        svg.selectAll(".dimension")
            .data(dimensions)
            .enter()
            .append("g")
            .attr("class", "dimension")
            .attr("transform", d => `translate(${xScale(d)})`)
            .each(function (d) { d3.select(this).call(d3.axisLeft(yScales[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", margin.top - 8)
            .text(d => d)
            .style("fill", "black");

        // Add legend with click interaction
        const legend = svg.selectAll(".legend")
            .data(origins)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width + margin.right - 120}, ${20 + i * 20})`)
            .style("cursor", "pointer")
            .on("click", function (event, selectedOrigin) {
                const originClass = "line-origin-" + selectedOrigin.replace(/[^a-zA-Z]/g, "");
                // Check if the current legend is active
                const isActive = d3.select(this).classed("active");
                // Reset all paths to reduced opacity
                paths.style("opacity", 0.1);
                // Set the active class on the legend
                d3.selectAll('.legend').classed("active", false);
                d3.select(this).classed("active", !isActive);
                // Conditionally adjust the opacity
                if (!isActive) {
                    // Highlight the selected origin
                    svg.selectAll(".line." + originClass).style("opacity", 0.8);
                } else {
                    // Reset to the original opacity
                    paths.style("opacity", 0.5);
                }
            });

        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colorScale);

        legend.append("text")
            .attr("x", 22)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);

        // Add the title
        svg.append("text")
            .attr("x", (width / 2))
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "24px")
            .style("text-decoration", "underline")
            .text("Parallel Coordinates Visualization for Car Data");
    });
}

window.addEventListener('load', drawParallelCoordinates);
