function drawDynamicBarChart() {
    d3.json('data/a1-cars.json').then(data => {
        console.log(data);

        const width = 800;
        const height = 600;
        const padding = {
            top: 60,
            right: 60,
            bottom: 60,
            left: 100
        }
        const svg = d3.select('svg');
        svg.selectAll('*').remove(); // Clear previous drawings

        // Data cleaning
        data = data.filter(d => d.Horsepower && d.Manufacturer && d.Cylinders);

        const manufacturers = Array.from(new Set(data.map(d => d.Manufacturer))); // Get unique manufacturers

        const colorScale = d3.scaleOrdinal()
            .domain(manufacturers)
            .range(d3.schemeTableau10); // Use Tableau color scheme for more vibrant colors

        const averageHorsepowerByManufacturer = manufacturers.map(manufacturer => {
            const filteredData = data.filter(d => d.Manufacturer === manufacturer);
            const averageHorsepower = d3.mean(filteredData, d => d.Horsepower);
            const averageCylinders = d3.mean(filteredData, d => d.Cylinders);
            return { manufacturer, averageHorsepower, averageCylinders };
        });

        const yScale = d3.scaleBand()
            .domain(averageHorsepowerByManufacturer.map(d => d.manufacturer))
            .range([padding.top, height - padding.bottom])
            .padding(0.1);

        const xScale = d3.scaleLinear()
            .domain([0, d3.max(averageHorsepowerByManufacturer, d => d.averageHorsepower)])
            .range([padding.left, width - padding.right]);

        // Draw bars
        svg.selectAll('.bar')
            .data(averageHorsepowerByManufacturer)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', padding.left)
            .attr('y', d => yScale(d.manufacturer))
            .attr('width', d => xScale(d.averageHorsepower) - padding.left)
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.manufacturer))
            .style('cursor', 'pointer')
            .on('mouseover', function (evt, d) {
                d3.select(this)
                    .attr('fill', '#FFA500'); // Change color to orange on hover

                // Display average horsepower and cylinders dynamically
                svg.append('text')
                    .attr('class', 'info-text')
                    .attr('x', xScale(d.averageHorsepower) + 10)
                    .attr('y', yScale(d.manufacturer) + yScale.bandwidth() / 2)
                    .text(`Avg HP: ${d3.format('.2f')(d.averageHorsepower)}, Avg Cylinders: ${d3.format('.2f')(d.averageCylinders)}`)
                    .style('font-size', 10)
                    .style('fill', 'black');
            })
            .on('mouseout', function (evt, d) {
                d3.select(this)
                    .attr('fill', d => colorScale(d.manufacturer)); // Revert to original color

                // Remove the dynamically displayed data
                svg.selectAll('.info-text').remove();
            });

        // Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('transform', `translate(0, ${height - padding.bottom})`)
            .call(xAxis);
        svg.append('g')
            .attr('transform', `translate(${padding.left}, 0)`)
            .call(yAxis);

        // Labels
        svg.append('text')
            .text('Average Horsepower')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .style('text-anchor', 'middle')
            .style('font-size', 12);
        svg.append('text')
            .text('Manufacturer')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', 12);

        svg.append('text')
            .text('Cylinders')
            .attr('x', -height / 2)
            .attr('y', 40)
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', 12);
    });
}




function drawBarchart() {
    d3.json('data/a1-cars.json').then(data => {
        // Create histogram
        const hist = {}
        for (let d of data) {
            if (d.Cylinders in hist) {
                hist[d.Cylinders]++;
            } else {
                hist[d.Cylinders] = 1;
            }
        }

        const padding = {
            top: 60,
            right: 60,
            bottom: 60,
            left: 60
        }
        const width = 800;
        const height = 600;
        const svg = d3.select('svg');
        const xScale = d3.scaleBand()
            .domain(Object.keys(hist)) // [3, 4, 5, 6, 8]
            .range([padding.left, width - padding.right])
            .padding(0.3);
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(Object.values(hist))])
            .range([height - padding.bottom, padding.top]);

        svg.selectAll('rect')
            .data(Object.entries(hist)) // {3: 4, 4: 204, 5: 103, 6: 84, 8: 103} = > [[3, 4], [4, 204], [5, 103], [6, 84], [8, 103]]
            .join('rect')
            .attr('x', d => xScale(d[0]))
            .attr('y', d => yScale(d[1]))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - padding.bottom - yScale(d[1]))
            .attr('fill', 'steelblue')
            .attr('stroke', 'black')
            .style('cursor', 'pointer')
            .on('click', function (evt, d) {
                console.log(evt);
            })
            .on('mouseover', function (evt, d) {
                d3.select(this)
                    .transition().duration(100)
                    .attr('fill', 'orange');
            })
            .on('mouseout', function (evt, d) {
                d3.select(this)
                    .transition().duration(100)
                    .attr('fill', 'steelblue');
            });
        
        // Axes
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);
        svg.append('g')
            .attr('transform', `translate(0, ${height - padding.bottom})`)
            .call(xAxis);
        svg.append('g')
            .attr('transform', `translate(${padding.left}, 0)`)
            .call(yAxis);

        // Labels
        svg.append('text')
            .text('Cylinders')
            .attr('x', width / 2)
            .attr('y', height - 10)
            .style('text-anchor', 'middle')
            .style('font-size', 12);
        svg.append('text')
            .text('Count')
            .attr('x', -height / 2)
            .attr('y', 20)
            .attr('transform', 'rotate(-90)')
            .style('text-anchor', 'middle')
            .style('font-size', 12);
    })
}

window.addEventListener('load', drawDynamicBarChart);
