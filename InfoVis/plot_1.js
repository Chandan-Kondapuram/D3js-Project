window.addEventListener('load', () => {
    // Load the data
    d3.json('data/a1-cars.json').then(data => {
        // Set up SVG dimensions
        const margin = { top: 50, right: 50, bottom: 50, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        // Append SVG to the container
        const svg = d3.select('#scatterplot')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Define scales
        const xScale = d3.scaleLinear().range([0, width]);
        const yScale = d3.scaleLinear().range([height, 0]);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Define axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        // Append axes to the SVG
        const xAxisGroup = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`);
        const yAxisGroup = svg.append('g')
            .attr('class', 'y-axis');

        // Add x-axis label
        svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('transform', `translate(${width / 2},${height + margin.top - 10})`)
            .style('text-anchor', 'middle')
            .text('Horsepower');

        // Add y-axis label
        svg.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -margin.left + 20)
            .style('text-anchor', 'middle')
            .text('MPG');

        // Create function to update chart
        function updateChart(selectedFeature) {
            // Update xScale domain
            xScale.domain(d3.extent(data, d => d[selectedFeature]));

            // Update yScale domain
            yScale.domain([0, d3.max(data, d => d.MPG)]);

            // Update circles
            const circles = svg.selectAll('circle')
                .data(data);

            circles.enter().append('circle')
                .merge(circles)
                .attr('cx', d => xScale(d[selectedFeature]))
                .attr('cy', d => yScale(d.MPG))
                .attr('r', 5)
                .attr('fill', d => colorScale(d.Origin))
                .attr('opacity', 0.7)
                // Event handlers for hover behavior and tooltip
                .on('mouseover', (event, d) => {
                    // Enlarge the data point
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('r', 8); // Increase the radius to enlarge

                    // Show tooltip
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    tooltip.html(`<strong>${d.Car}</strong><br>Horsepower: ${d.Horsepower}<br>MPG: ${d.MPG}`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 30) + 'px');
                })
                .on('mouseout', (event, d) => {
                    // Shrink the data point back to its original size
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('r', 5); // Set the radius back to original

                    // Hide tooltip
                    tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });

            // Add regression line
            const regressionData = data.map(d => ({ x: d[selectedFeature], y: d.MPG }));
            const regressionLine = linearRegression(regressionData);
            const line = d3.line()
                .x(d => xScale(d.x))
                .y(d => yScale(regressionLine.slope * d.x + regressionLine.intercept));

            svg.selectAll('.regression-line').remove();

            svg.append('path')
                .datum(regressionData)
                .attr('class', 'regression-line')
                .attr('d', line)
                .attr('stroke', 'black')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5');

            // Update x-axis
            xAxisGroup.call(xAxis);

            // Update y-axis
            yAxisGroup.call(yAxis);
        }

        // Initial update with default feature
        updateChart('Horsepower');

        // Add event listener to dropdown
        d3.select('#filter')
            .on('change', function () {
                const selectedFeature = d3.select(this).property('value');
                updateChart(selectedFeature);
            });
    });

    // Function to calculate linear regression
    function linearRegression(data) {
        const n = data.length;
        let xSum = 0,
            ySum = 0,
            xySum = 0,
            xxSum = 0;
        for (let i = 0; i < n; i++) {
            xSum += data[i].x;
            ySum += data[i].y;
            xySum += data[i].x * data[i].y;
            xxSum += data[i].x * data[i].x;
        }
        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        const intercept = (ySum - slope * xSum) / n;
        return { slope, intercept };
    }

    // Tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
});
