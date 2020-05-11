var margin = 60;
const width = 1000 - 2 * margin;
const height = 600 - 2 * margin;
var labels;
var label_size = '15px';
var letter_spacing = 1;
var bandwidth;
var keyValueMapper;
var maximumX = 0;
var maximumY = 0;
var xaxis_ticks;
var yaxis_ticks;
var yScale;
var xScale;
var enhanced_xscale;
var hist_data;
var valuesX;
var valuesX_copy;
var valuesY;
var xAxisGen;
var axis_transition_time = 1000;

colors = ["red", "green", "orange", "blue", "yellow", "purple"];

// Renders either bar chart or a histogram
function renderGraph(feature_name, data, type, nBin) {

    // Initializes the label content for the graphs in a map
    initLabels();


    if (type == "CATEGORICAL") {

        // Hide the slider and show bar graph for Categorical features
        hideSlider();
        renderBarGraph(feature_name, data);
    } else if (type == "NUMERICAL") {

        // Show the slider and show histogram graph for Numerical features
        showSlider();
        renderHistogram(feature_name, data, nBin);
    }

}

function initLabels() {
    labels = {
        'Type': {
            'x': 'Avocado Growth Type',
            'y': 'Avocado Count',
            'title': 'Counts of Avocado Grown with a Given Type'
        },
        'Year': {
            'x': 'Avocado Sales Year',
            'y': 'Avocado Sales Count',
            'title': 'Counts of Avocado Sold (2015 - 2020)'
        },
        'City': {
            'x': 'Avocado Sales City',
            'y': 'Avocado Sales Count',
            'title': 'Count of Avocado Sold in a City (2015 - 2020)'
        },
        'Price': {
            'x': 'Average Price of Avocado ($)',
            'y': 'Avocado Sales Count',
            'title': 'Counts of Avocado Sold in a Given Price Range'
        },
        'Total Volume': {
            'x': 'Avocado Count',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Sold in a Given Count Range'
        },
        'Total Bags': {
            'x': 'Avocado Bags Bought',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Bags Bought in a Given Range Bag Count '
        },

        'Rating': {
            'x': 'Avocado Rating',
            'y': 'Rating Frequency',
            'title': 'Avocado Rating (1 to 10) as a Fruit by Markets'
        },
        'Major Size': {
            'x': 'Avocado Size',
            'y': 'Avocado Size Count',
            'title': 'Count of a Given Avocado Size Sold in Markets'
        },
        'Legend': {
            'x': 'City Population Range',
            'y': 'Frequency',
            'title': 'Population Range of Avocado Markets\' City'
        },
        'XLarge Bags': {
            'x': 'Avocado Bags Bought',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Bags (XLarge) Bought in a Given Range Bag Count '
        },
        'Large Bags': {
            'x': 'Avocado Bags Bought',
            'y': 'Frequency',
            'title': 'Frequency of Avocado (Large) Bags Bought in a Given Range Bag Count '
        },
        'PLU4046': {
            'x': 'Avocado Sold',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Size PLU4046 Sold'
        },
        'PLU4225': {
            'x': 'Avocado Sold',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Size PLU4225 Sold'
        },
        'PLU4770': {
            'x': 'Avocado Sold',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Size PLU4770 Sold'
        },
        'Small Bags': {
            'x': 'Avocado Bags Bought',
            'y': 'Frequency',
            'title': 'Frequency of Avocado Bags (Small) Bought in a Given Range Bag Count '
        }

    };
}

function hideSlider() {
    slider = document.getElementById("theSlider");
    if (slider != null && slider != undefined)
        slider.style.visibility = "hidden";
}

function showSlider() {
    slider = document.getElementById("theSlider");
    if (slider != null && slider != undefined)
        slider.style.visibility = "visible";
}


// Called when the slider value changes or the drag functionality is used
function update_histogram(feature_name, data, nBin) {

    var svg = d3.select("svg");

    // Reload the fresh data from csv
    load_data(feature_name, data);

    // Update X Axis details
    update_max_x();
    update_x_axis(feature_name, data, nBin, svg);

    // Add transition to X Axis
    svg.select('#x-axis')
        .transition().duration(axis_transition_time)
        .call(xAxisGen);

    // Update Y Axis details
    yaxis_ticks = svg.select('#y-axis');
    update_y_axis();

    // Re render the bars of the histogram based upon new bin values
    render_histo_bars(nBin);
}


function update_max_x() {
    maximumX = d3.max(hist_data, function (d) { return d; });
}


function load_data(feature_name, data) {

    // Data is loaded into the hist_data array
    hist_data = [];
    data.map(function (d) {
        hist_data.push(+d[feature_name]);
    })

}

function update_y_axis() {

    // Linear scale used to divide the domain on the range on y axis
    yScale = d3.scaleLinear();
    yScale.range([height, 0])
        .domain([0, maximumY + 50]);

    // Y ticks and the y axis are added to the svg
    yaxis_ticks
        .attr('transform', `translate(` + margin + `, 0)`)
        .transition().duration(axis_transition_time)
        .call(d3.axisLeft(yScale));


}

function update_x_axis(feature_name, data, nBin) {
    maximumY = 0;

    // Linear scale used to divide the domain on the range on x axis
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain([0, maximumX]);

    // xMap contains the x locations of the respective x ticks on the svg
    var xMap = axis_scaler(nBin, xScale.range(), xScale.domain());

    // valuesX has the values for the x ticks
    valuesX = Object.keys(xMap);

    // frequency_keyValueMappererX has the y axis count for each of the x axis bin range
    var frequency_keyValueMappererX = d3.nest()
        .key(function (d) { return d[feature_name]; })
        .sortKeys(d3.ascending)
        .rollup(function (leaves) {
            return leaves.length;
        })
        .entries(data)

    valuesY = {};
    // Converts to integer based map
    frequency_keyValueMappererX = getValue(frequency_keyValueMappererX);

    for (i = 0; i < valuesX.length; i++) {
        count = 0;
        for (j = valuesX[i]; j < parseInt(valuesX[i]) + parseInt(bandwidth); j++) {
            if (frequency_keyValueMappererX[parseInt(j)] != undefined) {
                count += parseInt(frequency_keyValueMappererX[parseInt(j)]);
            }
        }

        if (j == maximumX) {
            if (frequency_keyValueMappererX[parseInt(j)] != undefined) {
                count += parseInt(frequency_keyValueMappererX[parseInt(j)]);
            }
        }
        valuesY[valuesX[i]] = count;

        // Finds the max value of frequency to provide it to the y axis
        if (count > maximumY)
            maximumY = count;
    }

    valuesX_copy = valuesX.slice();
    for (i = 1; i <= 3; i++) {
        valuesX_copy.push(parseInt(valuesX_copy[valuesX_copy.length - 1]) + parseInt(bandwidth));
    }

    enhanced_xscale = d3.scaleLinear()
        .range([0, width])
        .domain([0, maximumX + 2 * bandwidth]);


    valuesX_copy.pop()
    xAxisGen = d3.axisBottom(enhanced_xscale);
    xAxisGen.ticks(nBin + 1);
    xAxisGen.tickValues(valuesX_copy);
}


function getValue(frequency_keyValueMappererX) {
    var map = {};
    for (i = 0; i < Object.keys(frequency_keyValueMappererX).length; i++) {
        map[parseInt(frequency_keyValueMappererX[i].key)] = parseInt(frequency_keyValueMappererX[i].value);
    }
    return map;
}

// Re renders the bars in histogram based on the bin values
function render_histo_bars(nBin) {


    d3.select('#ref-line').remove();
    d3.select('#ref-text').remove();
    d3.select('.d3-tip').remove();

    var chart = d3.select('svg').select('g');
    keyValueMapper = [];
    for (i = 0; i < valuesX.length; i++) {
        keyValueMapper[i] = {};
        keyValueMapper[i].key = valuesX[i];
        keyValueMapper[i].value = valuesY[valuesX[i]];
    }


    var rectWidth;
    if (nBin == 1) {
        // Width of a bar is maximum X value for nBin = 1
        rectWidth = Math.ceil(parseInt(enhanced_xscale(maximumX)));
    }
    else {
        // Width of a bar is the xScale value for nBin > 1
        rectWidth = Math.ceil(enhanced_xscale(valuesX[1]));
    }

    var x_bar_val = {};
    var nextVal = 0;
    for (i = 0; i < valuesX.length; i++) {
        x_bar_val[valuesX[i]] = nextVal;
        nextVal += rectWidth;
    }


    // Tip on the bar when hovered upon
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<span style='color:" + colorSchema(d.key) + "'> Range - [" + d.key + ", " + (parseInt(d.key) + parseInt(bandwidth)) + ") <br> Frequency - " + d.value + "</span>";
        })

    chart.call(tip);


    // Remove the existing bars
    d3.selectAll("rect").remove();

    // Render the bars
    chart.selectAll()
        .data(keyValueMapper)
        .enter()
        .append('rect')
        .attr('x', (s) => enhanced_xscale(s.key) + margin)
        .attr('y', (s) => height)
        .attr('height', 0)
        .attr("opacity", 0.8)
        .attr('width', rectWidth)
        .attr("fill", (s) => colorSchema(s.key))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('mouseenter', function (s, i) {
            d3.select(this).raise();

            // Increase width and make it higher
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1)
                .attr('x', (s) => enhanced_xscale(s.key) + margin - 5)
                .attr('y', (s) => yScale(s.value))
                .attr('width', rectWidth + 10)
                .attr('height', (s) => height - yScale(s.value) + 10)
                .style("transform", "scale(1,0.979)");

            // Reference line for y values of rect    
            d3.select('svg').select('g')
                .append('line')
                .attr('id', 'ref-line')
                .attr('x1', 0)
                .attr('y1', yScale(s.value))
                .attr('x2', width)
                .attr('y2', yScale(s.value))
                .attr('transform', 'translate(' + margin + ',0)')
                .attr("stroke-width", 1)
                .attr("stroke", "red");

            // Y value for hovered bar on the right
            d3.select('svg').select('g')
                .append('text')
                .attr('id', 'ref-text')
                .attr('x', width + margin + 5)
                .attr('y', yScale(s.value))
                .style('fill', 'white')
                .text(s.value);

        })
        .on('mouseleave', function (actual, i) {

            // Reset the bar width and height
            d3.select(this)
                .attr("opacity", 0.8)
                .transition()
                .duration(200)
                .attr('x', (s) => enhanced_xscale(s.key) + margin)
                .attr('y', (s) => yScale(s.value))
                .attr('width', rectWidth)
                .attr('height', (s) => height - yScale(s.value))
                .style("transform", "scale(1,1)");

            // Remove ref line
            d3.select('#ref-line').remove();
            d3.select('#ref-text').remove();

        })

    // Add transition when rendering the bars
    t = d3.transition()
        .duration(axis_transition_time);

    chart.selectAll('rect')
        .transition(t)
        .attr('height', (s) => height - yScale(s.value))
        .attr('y', (s) => yScale(s.value));
}

function sliderListener(el) {

    // Updates the slider value for nBins
    var slider = document.getElementById("theSlider");
    nBin = 21 - el.value;
    update_histogram(FEATURE_NAME, DATA, nBin);

}

// Get the slider back to defaults
function resetSlider(bins) {
    document.getElementById("theSlider").value = bins;
}


function renderHistogram(feature_name, data, nBin) {

    // Clear existing graph
    d3.selectAll("svg").remove();
    var vla = 100;
    var whichBtn = -1;
    var oldX;

    var svg = d3.select("#graph_area")
        .append("svg")
        .attr("width", "73.75em")
        .style("border", "1px solid")
        .attr("height", "42em")
        // Mouse events added to implement drag
        .on("mousedown", function () {
            whichBtn = 1;
            oldX = d3.event.pageX;
        })
        .on("mouseup", function () {
            whichBtn = -1;
            document.body.style.cursor = "initial";
        })
        .on("mouseout", function () {
            whichBtn = -1;
            document.body.style.cursor = "initial";
        })
        .on("mousemove", function () {
            // Left click
            if (whichBtn == 1) {
                if (d3.event.pageX < oldX) {
                    // left
                    if (nBin < maxSlider) {
                        document.body.style.cursor = "w-resize";
                        nBin = nBin + 1;
                        if (nBin != undefined)
                            update_histogram(FEATURE_NAME, DATA, nBin);
                    }

                } else {
                    if (nBin > minSlider) {
                        document.body.style.cursor = "e-resize";
                        nBin = nBin - 1;
                        update_histogram(FEATURE_NAME, DATA, nBin);
                    }

                }
                // Update slider value
                document.getElementById("theSlider").value = 21 - nBin;
            }
        });


    var chart = svg.append('g')
        .attr('transform', `translate(${margin}, ${margin})`);

    load_data(feature_name, data);
    update_max_x();

    update_x_axis(feature_name, data, nBin, svg);

    // Append the x axis
    chart.append('g')
        .attr('id', 'x-axis')
        .attr('transform', `translate(` + margin + `, ${height})`)
        .transition().duration(axis_transition_time)
        .call(xAxisGen);

    yaxis_ticks = chart.append('g').attr('id', 'y-axis');
    update_y_axis();

    // Color schema for the bars
    var colorSchema = d3.scaleOrdinal()
        .domain(data.map((s) => s.key))
        .range(d3.schemeSet3);

    // Tip added on bar hover
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<span style='color:" + colorSchema(d.key) + "'> Range - [" + d.key + ", " + (parseInt(d.key) + parseInt(bandwidth)) + ") <br> Frequency - " + d.value + "</span>";
        })

    svg.call(tip);


    keyValueMapper = [];
    for (i = 0; i < valuesX.length; i++) {
        keyValueMapper[i] = {};
        keyValueMapper[i].key = valuesX[i];
        keyValueMapper[i].value = valuesY[valuesX[i]];
    }

    var rectWidth;
    var x_bar_val = {};

    if (nBin == 1)
        // maximum x value for bar width when nBin = 1
        rectWidth = Math.ceil(enhanced_xscale(maximumX));
    else
        // bar width set when nBin > 1
        rectWidth = Math.ceil(enhanced_xscale(valuesX[1]));



    var nextVal = 0;
    for (i = 0; i < valuesX.length; i++) {
        x_bar_val[valuesX[i]] = nextVal;
        nextVal += rectWidth;
    }


    // Render the bars on the svg
    var bars = chart.selectAll()
        .data(keyValueMapper)
        .enter()
        .append('rect')
        .attr('x', (s) => enhanced_xscale(s.key) + margin)
        .attr('y', (s) => height)
        .attr("opacity", 0.8)
        .attr('width', rectWidth)
        .attr('height', 0)
        .attr("fill", (s) => colorSchema(s.key))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('mouseenter', function (s, i) {
            d3.select(this).raise();

            // Increase bar width and height on mouseenter event
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1)
                .attr('x', (s) => enhanced_xscale(s.key) + margin - 5)
                .attr('y', (s) => yScale(s.value))
                .attr('width', rectWidth + 10)
                .attr('height', (s) => height - yScale(s.value) + 10)
                .style("transform", "scale(1,0.979)");

            // Reference line for y values of rect    
            d3.select('svg').select('g')
                .append('line')
                .attr('id', 'ref-line')
                .attr('x1', 0)
                .attr('y1', yScale(s.value))
                .attr('x2', width)
                .attr('y2', yScale(s.value))
                .attr('transform', 'translate(' + margin + ',0)')
                .attr("stroke-width", 1)
                .attr("stroke", "red");

            // Frequency for the given range on the right side
            d3.select('svg').select('g')
                .append('text')
                .attr('id', 'ref-text')
                .attr('x', width + margin + 5)
                .attr('y', yScale(s.value))
                .style('fill', 'white')
                .text(s.value);

        })
        .on('mouseleave', function (actual, i) {

            // Restore the bar width and height on the mouseleave event
            d3.select(this)
                .attr("opacity", 0.8)
                .transition()
                .duration(200)
                .attr('x', (s) => enhanced_xscale(s.key) + margin)
                .attr('y', (s) => yScale(s.value))
                .attr('width', rectWidth)
                .attr('height', (s) => height - yScale(s.value))
                .style("transform", "scale(1,1)");

            // Remove ref line and text
            d3.select('#ref-line').remove();
            d3.select('#ref-text').remove();

        })

    t = d3.transition()
        .duration(750);

    chart.selectAll('rect')
        .transition(t)
        .attr('height', (s) => height - yScale(s.value))
        .attr('y', (s) => yScale(s.value));

    // x-axis label
    svg.append('text')
        .attr('y', (height) + 2 * margin - 20)
        .attr('x', width / 2 + margin)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(labels[feature_name]['x']);

    // title
    svg.append('text')
        .attr('x', width / 2 + margin)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(labels[feature_name]['title'])

    // y-axis label
    svg.append('text')
        .attr('x', - height / 1.5)
        .attr('y', margin / 2.4 + 50)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(labels[feature_name]['y']);

    // y axis marker
    svg.append('text')
        .attr('y', 70)
        .attr('x', -80)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width + 90)
        .attr('y', height + 100)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')

}


function axis_scaler(nBin, range, domain) {
    var phy_unit = Math.ceil(range[1] / domain[1]);
    bandwidth = Math.ceil(domain[1] / nBin);

    var xMap = {};
    for (i = domain[0]; i < domain[1]; i += bandwidth) {
        xMap[parseInt(i)] = phy_unit * parseInt(i);
    }

    return xMap;
}


// Render the bar graph
function renderBarGraph(feature_name, data) {

    // Clear existing graph
    d3.selectAll("svg").remove();

    const width = 800;
    const height = 600 - 2 * margin;

    // Getting counts for unique values of features
    var sample = d3.nest()
        .key(function (d) { return d[feature_name]; })
        .sortKeys(d3.ascending)
        .rollup(function (leaves) { return leaves.length; })
        .entries(data)

    var max_val_x = d3.max(sample, function (d) { return d.value; });

    // Append svg in graph area
    var which = 0;
    var svg = d3.select("#graph_area")
        .append("svg")
        .attr("width", "73.75em")
        .style("height", "42em")
        .style("border", "1px solid")
        .append("g")
        .attr("transform", "translate(" + margin + "," + margin + ")");

    // Mouse drag prevent in bar graph
    d3.select("svg")
        .on("mousedown", function () {
            which = 1;
        })
        .on("mouseup", function () {
            document.body.style.cursor = "initial";
            which = 0;
        })
        .on("mouseout", function () {
            document.body.style.cursor = "initial";
            which = 0;
        })
        .on("mousemove", function () {
            // Left click
            if (which == 1)
                document.body.style.cursor = "not-allowed";

        });

    // Color schema for the bars
    var colorSchema = d3.scaleOrdinal()
        .domain(sample.map((s) => s.key))
        .range(d3.schemeSet3);

    // Tip added on bar hover
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<span style='text-align:center;color:" + colorSchema(d.key) + "'> Value<sub>x</sub> - " + d.key + "<br> Frequency - " + d.value + "</span>";
        })

    svg.call(tip);

    // Linear y scale 
    yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, max_val_x + 50]);

    // Y scale append
    svg.append('g')
        .attr("transform", "translate(" + margin + ", 0)")
        .transition()
        .duration(axis_transition_time)
        .call(d3.axisLeft(yScale));

    // Scale banding the x scale for categorical data
    xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.key))
        .padding(0.2)

    // Append the x axis
    svg.append('g')
        .attr('transform', `translate(` + margin + `, ${height})`)
        .transition().duration(axistransition_time)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style("text-anchor", "end")
        .attr("dx", "-1em")
        .attr("dy", "-.3em")
        .attr("transform", "rotate(-65)");


    // Append bars on svg
    var bars = svg.selectAll()
        .data(sample)
        .enter()
        .append('rect')
        .attr('x', (s) => xScale(s.key) + margin)
        .attr('y', height)
        .attr('height', 0)
        .attr('width', xScale.bandwidth())
        .attr("fill", (s) => colorSchema(s.key))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('mouseenter', function (s, i) {

            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 0.6)
                .attr('x', (s) => xScale(s.key) + margin - 5)
                .attr('y', (s) => yScale(s.value))
                .attr('width', xScale.bandwidth() + 10)
                .attr('height', (s) => height - yScale(s.value) + 10)
                .style("transform", "scale(1,0.979)");

            // Reference line for y values of rect    
            d3.select('svg').select('g')
                .append('line')
                .attr('id', 'ref-line')
                .attr('x1', 0)
                .attr('y1', yScale(s.value))
                .attr('x2', width)
                .attr('y2', yScale(s.value))
                .attr('transform', 'translate(' + margin + ',0)')
                .attr("stroke-width", 1)
                .attr("stroke", "red");

            d3.select('svg').select('g')
                .append('text')
                .attr('id', 'ref-text')
                .attr('x', width + margin + 5)
                .attr('y', yScale(s.value))
                .style('fill', 'white')
                .text(s.value);

        })
        .on('mouseleave', function (actual, i) {
            d3.select(this)
                .attr("opacity", 1)
                .transition()
                .duration(200)
                .attr('x', (s) => xScale(s.key) + margin)
                .attr('y', (s) => yScale(s.value))
                .attr('opacity', 1)
                .attr('width', xScale.bandwidth())
                .attr('height', (s) => height - yScale(s.value))
                .style("transform", "scale(1,1)")

            // Remove ref line
            d3.select('#ref-line').remove();
            d3.select('#ref-text').remove();
        })

    t = d3.transition()
        .duration(axis_transition_time);

    svg.selectAll('rect')
        .transition(t)
        .attr('height', (s) => height - yScale(s.value))
        .attr('y', (s) => yScale(s.value));

    // Labels on axis


    // x-axis label
    svg.append('text')
        .attr('y', (height) + margin + 20)
        .attr('x', width / 2 + margin)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(labels[feature_name]['x']);

    // title
    svg.append('text')
        .attr('x', width / 2 + margin)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(labels[feature_name]['title'])

    // y-axis label
    svg.append('text')
        .attr('x', - height / 2)
        .attr('y', margin / 2.5)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', '3')
        .text(labels[feature_name]['y']);


    // y axis marker
    svg.append('text')
        .attr('y', 20)
        .attr('x', -20)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width + 40)
        .attr('y', height + 50)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')

}





var xVal = [], yVal = [], yScale_line, xScale_line;
function line_chart(dataset, y_label, x_label, title, side, type, plot_type) {
    if (side == "left") {
        $('#left_svg').html('');
    } else {
        $('#right_svg').html('');
    }
    var dotSize = 5;

    if (typeof dataset == "string")
        dataset = JSON.parse(dataset)

    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = $("#" + side + "_svg").innerWidth() - 80;
    var height = $("#" + side + "_svg").innerHeight() - 100;

    xVal = [];
    yVal = [];
    $.each(dataset.x, function (d, i) {
        if (type == 'numeric') {
            xVal.push(Number(i));
        } else {
            xVal.push(i);
        }
    });

    $.each(dataset.y, function (d, i) {
        yVal.push(Number(i));
    });

    if (!plot_type.includes("scatter"))
        yVal = yVal.sort(function (a, b) { return b - a });

    dataset = [];
    for (var i = 0; i < xVal.length; i++) {
        dataset.push({
            "x": xVal[i],
            "y": yVal[i]
        });
    }

    // The number of datapoints
    var xMax = d3.max(xVal) + 1;
    var xMin = d3.min(xVal);
    var yMax = d3.max(yVal) + 1;
    var yMin = d3.min(yVal) - 0.2;
    if (yMin < 0) yMin = 0;

    if (plot_type == "scatter") {
        yMax = 5;
        yMin = -5;
        xMin = -5;
        xMax = 6;
    }

    if (plot_type.includes("euc_mds")) {
        yMax = 6;
        yMin = -6;
        xMin = -6;
        xMax = 6;
    }
    else if (plot_type.includes("corr_mds")) {
        yMax = 1;
        yMin = -1;
        xMin = -1;
        xMax = 1;
    }

    var xScale;
    if (plot_type == "non-scatter") {
        xScale = d3.scaleBand()
            .range([0, width])
            .domain(dataset.map((s) => s.x))
            .padding(1)
    } else {
        dotSize = 2;
        xScale = d3.scaleLinear()
            .range([0, width])
            .domain([xMin, xMax])
    }

    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax]) // input 
        .range([height, 0]); // output 

    yScale_line = yScale;
    xScale_line = xScale;

    // 7. d3's line generator
    var line = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left;
        }) // set the x values for the line generator
        .y(function (d, i) {
            return yScale(d.y) + 50;
        }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line



    // 1. Add the SVG to the page and employ #2
    var svg;
    if (side == "left") {
        svg = d3.select("#left_svg");
    } else {
        svg = d3.select("#right_svg");
    }
    svg
        .append("g")
    // .attr("transform", "translate(" + margin.left + ",500)");

    var margin_top = height + 50;
    if (type == 'numeric') {
        // 3. Call the x axis in a group tag
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + margin_top + ")")
            .call(d3.axisBottom(xScale));
    } else {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + margin.left + "," + margin_top + ")")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-1em")
            .attr("dy", "-.3em")
            .attr("transform", "rotate(-20)");
    }

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",50)")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    if (plot_type == "non-scatter") {
        // 9. Append the path, bind the data, and call the line generator 
        svg.append("path")
            .datum(dataset) // 10. Binds data to the line 
            .attr("class", "line") // Assign a class for styling 
            .attr("d", line); // 11. Calls the line generator 
    }

    var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([0, 0])
    .html(function (d) {
        return "<span style='color:yellow'> " + x_label + " = " + d.x + "<br/> " + y_label + " = " + d.y.toFixed(2) + "</span>";
    });
    svg.call(tip);

    if (plot_type == "non-scatter") {
        x_band = 29.6188;

        // Color schema for the bars
        var colorSchema = d3.scaleOrdinal()
            .domain(dataset.map((s) => s.x))
            .range(d3.schemeSet3);

        // Append bars on svg
        var bars = svg.selectAll()
            .data(dataset)
            .enter()
            .append('rect')
            .attr('x', (d, i) => xScale(d.x) + margin.left - 13)
            .attr('height', (d, i) => 0)
            // .attr('height', (d, i) => height - yScale(d.y))
            .attr('y', (d, i) => height + 50)
            // .attr('y', (d, i) => yScale(d.y) + 50)
            .attr('width', x_band - 5)
            .attr("fill", (d, i) => colorSchema(d.x))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('mouseenter', function (s, i) {

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.6)
                    .attr('y', (d, i) => yScale(d.y) + 40)
                    .attr('width', x_band - 2)
                    .attr('height', (d, i) => height - yScale(d.y) + 10)
            })
            .on('mouseleave', function (actual, i) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 1)
                    .attr('height', (d, i) => height - yScale(d.y))
                    .attr('y', (d, i) => yScale(d.y) + 50)
                    .attr('x', (d, i) => xScale(d.x) + margin.left - 13)
                    .attr('width', x_band - 5)
            })

            t = d3.transition()
            .duration(axis_transition_time);

            svg.selectAll('rect')
            .transition(t)
            .attr('height', (d, i) => height - yScale(d.y))
            .attr('y', (d, i) => yScale(d.y) + 50)
            
    }

   


    if (plot_type == "scatter_stratified") {
        cluster_size = Object.keys(dataset) / 2;

        for (var i = 0; i < cluster_size; i++) {
            xVal = [];
            yVal = [];
            newD = [];

            $.each(dataset["x_" + i], function (d, ind) {
                xVal.push(Number(ind));
            });

            $.each(dataset["y_" + i], function (d, ind) {
                yVal.push(Number(ind));
            });

            for (var j = 0; j < xVal.length; j++) {
                newD.push({
                    "x": xVal[j],
                    "y": yVal[j]
                });
            }

            // 12. Appends a circle for each datapoint 
            svg.selectAll(".dot")
                .data(newD)
                .enter().append("circle") // Uses the enter().append() method
                .attr("class", "dot") // Assign a class for styling
                .attr("cx", function (d, ind) {
                    return xScale(d.x) + margin.left
                })
                .attr("cy", function (d, ind) {
                    return yScale(d.y) + 50
                })
                .attr("r", dotSize)
                .attr("fill", colors[i])
                .attr("stroke", "white")
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);
        }
    } else {
        // 12. Appends a circle for each datapoint 
        svg.selectAll(".dot")
            .data(dataset)
            .enter().append("circle") // Uses the enter().append() method
            .attr("class", "dot") // Assign a class for styling
            .attr("cx", function (d, i) {
                return xScale(d.x) + margin.left
            })
            .attr("cy", function (d, i) {
                return yScale(d.y) + 50
            })
            .attr("r", dotSize)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", - (height / 2) - 50)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr('fill', 'white')
            .style('stroke', 'white')
            .text(y_label);
    }

    // x-axis label
    svg.append('text')
        .attr('y', height + 95)
        .attr('x', width / 2 + 50)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(x_label);

    // title
    svg.append('text')
        .attr('x', width - 3 * margin.left)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(title)

    // y axis marker
    svg.append('text')
        .attr('y', 5)
        .attr('x', - (height / 3) + 40)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width + 40)
        .attr('y', height + 80)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')


}

function add_line_chart_ref_line(cluster_num) {
    // var x_dist = 
    $("#ref-line-x").remove();
    $("#ref-line-y").remove();
    $(".dot").css("fill", "orange");
    $(".dot").css("r", "5");


    d3.select('svg').select('g')
        .append('line')
        .attr('id', 'ref-line-x')
        .attr('x1', xScale_line(0) + 50)
        .attr('y1', yScale_line(yVal[cluster_num - 1]) + 50)
        .attr('x2', xScale_line(xVal[cluster_num - 1]) + 50)
        .attr('y2', yScale_line(yVal[cluster_num - 1]) + 50)
        .attr('transform', 'translate(' + margin.left + ',0)')
        .attr("stroke-width", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke", "red");

    d3.select('svg').select('g')
        .append('line')
        .attr('id', 'ref-line-y')
        .attr('x1', xScale_line(xVal[cluster_num - 1]) + 50)
        .attr('y1', yScale_line(yVal[cluster_num - 1]) + 50)
        .attr('x2', xScale_line(xVal[cluster_num - 1]) + 50)
        .attr('y2', yScale_line.range()[0] + 50)
        // .attr('transform','translate(0,'+margin.top+')')
        .attr("stroke-width", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke", "red");

}



xScale_barplot = [];
yScale_barplot = [];
xVal_barplot = [];
yVal_barplot = [];
margin = [];
x_adjust = 15;

// Render the bar graph
function bar_plot_chart(dataset, y_label, x_label, title) {

    // Clear existing graph
    $('svg').html('');
    dataset = JSON.parse(dataset)
    margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = $("svg").innerWidth() - 80;
    var height = $("svg").innerHeight() - 100;

    xVal = [];
    yVal_var = [];
    yVal_covar = [];
    $.each(dataset.x, function (d, i) {
        xVal.push(Number(i));
    });

    xVal_barplot = xVal;
    $.each(dataset.y_bar, function (d, i) {
        yVal_var.push(Number(i));
    });

    $.each(dataset.y_plot, function (d, i) {
        yVal_covar.push(Number(i));
    });


    sample = [];
    for (var i = 0; i < xVal.length; i++) {
        sample.push({
            "x": xVal[i],
            "y_bar": yVal_var[i],
            "y_plot": yVal_covar[i]
        });
    }

    var max_val_x = d3.max(xVal);

    // The number of datapoints
    var n = d3.max(xVal);
    var yMax = d3.max(yVal_var) - 0.8;
    var yMin = d3.min(yVal_var) - 0.2;
    if (yMin < 0) yMin = 0;

    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(sample.map((s) => s.x))
        .padding(0.2)


    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax + 70]) // input 
        .range([height, 0]); // output 


    xScale_barplot = xScale;
    yScale_barplot = yScale;
    // Append svg in graph area
    var which = 0;
    var svg = d3.select("svg")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Mouse drag prevent in bar graph
    d3.select("svg")
        .on("mousedown", function () {
            which = 1;
        })
        .on("mouseup", function () {
            document.body.style.cursor = "initial";
            which = 0;
        })
        .on("mouseout", function () {
            document.body.style.cursor = "initial";
            which = 0;
        })
        .on("mousemove", function () {
            // Left click
            if (which == 1)
                document.body.style.cursor = "not-allowed";

        });

    // Color schema for the bars
    var colorSchema = d3.scaleOrdinal()
        .domain(sample.map((s) => s.key))
        .range(d3.schemeSet3);

    // Tip added on bar hover
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function (d) {
            return "<span style='color:yellow'> " + x_label + " = " + d.x + "<br/> " + y_label + " = " + d.y_bar.toFixed(2) + "</span>";

        })

    svg.call(tip);

    // Tip added on bar hover
    var tip_plt = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function (d) {
            return "<span style='color:yellow'> " + x_label + " = " + d.x + "<br/> " + y_label + " = " + d.y_plot.toFixed(2) + "</span>";
        })

    svg.call(tip_plt);



    // 7. d3's line generator
    var line = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + x_adjust;
        }) // set the x values for the line generator
        .y(function (d, i) {
            return yScale(d.y_plot);
        }) // set the y values for the line generator 
        .curve(d3.curveMonotoneX) // apply smoothing to the line


    // 9. Append the path, bind the data, and call the line generator 
    svg.append("path")
        .datum(sample) // 10. Binds data to the line 
        .attr("class", "line") // Assign a class for styling 
        .attr("d", line); // 11. Calls the line generator 

    // 12. Appends a circle for each datapoint 
    svg.selectAll(".dot")
        .data(sample)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function (d, i) {
            return xScale(d.x) + x_adjust
        })
        .attr("cy", function (d, i) {
            return yScale(d.y_plot)
        })
        .attr("r", 5)
        .on("mouseover", tip_plt.show)
        .on("mouseout", tip_plt.hide);

    // 3. Call the x axis in a group tag
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

    // 4. Call the y axis in a group tag
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft


    x_band = xScale.bandwidth();
    // Append bars on svg
    var bars = svg.selectAll()
        .data(sample)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(d.x))
        .attr('y', (d, i) => height)
        .attr('height', 0)
        .attr('width', x_band - 5)
        .attr("fill", (d, i) => colorSchema(d.x))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .on('mouseenter', function (s, i) {

            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 0.6)
                .attr('y', (d, i) => yScale(d.y_bar) - 10)
                .attr('width', x_band - 2)
                .attr('height', (d, i) => height - yScale(d.y_bar) + 10)
        })
        .on('mouseleave', function (actual, i) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('opacity', 1)
                .attr('height', (d, i) => height - yScale(d.y_bar))
                .attr('y', (d, i) => yScale(d.y_bar))
                .attr('x', (d, i) => xScale(d.x))
                .attr('width', x_band - 5)
        })

    t = d3.transition()
        .duration(axis_transition_time);

    svg.selectAll('rect')
        .transition(t)
        .attr('height', (d, i) => height - yScale(d.y_bar))
        .attr('y', (d, i) => yScale(d.y_bar));

    // Labels on axis


    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(y_label);

    // x-axis label
    svg.append('text')
        .attr('y', height + margin.bottom - 10)
        .attr('x', width / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(x_label);

    // title
    svg.append('text')
        .attr('x', width - 3.5 * margin.left)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(title)

    // y axis marker
    svg.append('text')
        .attr('y', -40)
        .attr('x', 0)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width)
        .attr('y', height + 40)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')

}


function add_bar_plot_ref_line_75() {
    $("#ref-line-x").remove();
    $("#ref-line-y").remove();
    $("#ref-text").remove();


    $(".dot").css("fill", "orange");
    $(".dot").css("r", "5");

    d3.select('svg').select('g')
        .append('line')
        .attr('id', 'ref-line-x')
        .attr('x1', xScale_barplot(0))
        .attr('y1', yScale_barplot(75))
        .attr('x2', width)
        .attr('y2', yScale_barplot(75))
        .attr('transform', 'translate(0,0)')
        .attr("stroke-width", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke", "red");

    d3.select('svg').select('g')
        .append('line')
        .attr('id', 'ref-line-y')
        .attr('x1', xScale_barplot(xVal_barplot[4]) + x_adjust)
        .attr('y2', yScale_barplot(yVal_barplot[4]))
        .attr('x2', xScale_barplot(xVal_barplot[4]) + x_adjust)
        .attr('y1', yScale_barplot.range()[0])
        .attr("stroke-width", 1)
        .style("stroke-dasharray", ("3, 3"))
        .attr("stroke", "red");

    d3.select('svg').select('g')
        .append('text')
        .attr('id', 'ref-text')
        .attr('x', xScale_barplot(xVal_barplot[4]) + x_adjust)
        .attr('y', yScale_barplot(yVal_barplot[3]))
        .style('fill', 'yellow')
        .text("75 %");

    d3.select('svg').select('g')
        .append('text')
        .attr('id', 'ref-text')
        .attr('x', xScale_barplot(xVal_barplot[4]) + 80)
        .attr('y', yScale_barplot(yVal_barplot[3]))
        .style('fill', 'yellow')
        .text("Cumulative Variance (%)");

}


var xVal = [], yVal = [], yScale_line, xScale_line;
function line_chart_scatter_strat(dataset, y_label, x_label, title, side, type, plot_type) {
    if (side == "left") {
        $('#left_svg').html('');
    } else {
        $('#right_svg').html('');
    }
    var dotSize = 5;
    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = $("#" + side + "_svg").innerWidth() - 80;
    var height = $("#" + side + "_svg").innerHeight() - 100;

    if (typeof dataset == "string")
        parsedDataset = JSON.parse(dataset);
    else
        parsedDataset = dataset;

    var keys = Object.keys(parsedDataset);
    var numClusters = keys.length / 2;
    var perClusterLen = parseInt(250 / numClusters);

    xVal = [];
    yVal = [];

    finalDataset = [];
    for (var index = 0; index < perClusterLen; index++) {
        for (var cid = 0; cid < numClusters; cid++) {
            item = {};
            item["x"] = parsedDataset["x_" + cid][index];
            item["y"] = parsedDataset["y_" + cid][index];
            item["clusterId"] = cid;
            finalDataset.push(item);
        };
    };

    var xMax = 5;
    var xMin = -5;
    var yMax = 5;
    var yMin = -5;

    if (plot_type == "scatter_stratified_mds_euc") {
        yMax = 6;
        yMin = -6;
        xMin = -6;
        xMax = 6;
    } else if (plot_type == "scatter_stratified_mds_corr") {
        yMax = 1;
        yMin = -1;
        xMin = -1;
        xMax = 1;
    }


    var xScale;
    dotSize = 2;
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain([xMin, xMax])

    var yScale = d3.scaleLinear()
        .domain([yMin, yMax])
        .range([height, 0]);

    var svg;
    if (side == "left") {
        svg = d3.select("#left_svg");
    } else {
        svg = d3.select("#right_svg");
    }
    svg
        .append("g")

    var margin_top = height + 50;
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + margin_top + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",50)")
        .call(d3.axisLeft(yScale));

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function (d) {
            return "<span style='color:yellow'> " + x_label + " = " + d.x + "<br/> " + y_label + " = " + d.y.toFixed(2) + "</span>";
        });
    svg.call(tip);

    cluster_size = numClusters;

    svg.selectAll(".dot")
        .data(finalDataset)
        .enter().append("circle")
        .attr("cx", function (d, ind) {
            return xScale(d.x) + margin.left
        })
        .attr("cy", function (d, ind) {
            return yScale(d.y) + 50
        })
        .attr("r", dotSize)
        .attr("fill", function (d, ind) {
            return colors[d.clusterId]
        })
        .attr("stroke", function (d, ind) {
            return colors[d.clusterId]
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // x-axis label
    svg.append('text')
        .attr('y', height + 100)
        .attr('x', width / 2 + 50)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(x_label);

    // title
    svg.append('text')
        .attr('x', width - 3 * margin.left)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(title)

    svg.append('text')
        .attr('x', - height / 1.5)
        .attr('y', 20)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(y_label);

    // y axis marker
    svg.append('text')
        .attr('y', 20)
        .attr('x', - (height / 3) + 40)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width + 40)
        .attr('y', height + 80)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')
}

var xVal = [], yVal = [], yScale_line, xScale_line;
function line_chart_comparison_1(dataset, y_label, x_label, title, side, type, plot_type) {
    if (side == "left") {
        $('#left_svg').html('');
    } else {
        $('#right_svg').html('');
    }
    var dotSize = 5;

    if (typeof dataset == "string")
        dataset = JSON.parse(dataset)

    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = 500;
    var height = $("#" + side + "_svg").innerHeight() - 100;


    xVal = [];
    $.each(dataset.x, function (d, i) {
        if (type == 'numeric') {
            xVal.push(Number(i));
        } else {
            xVal.push(i);
        }
    });

    yVal_org = [];
    yVal_random = [];
    yVal_strat = [];

    $.each(dataset.y_org, function (d, i) {
        yVal_org.push(Number(i));
    });

    $.each(dataset.y_random, function (d, i) {
        yVal_random.push(Number(i));
    });

    $.each(dataset.y_strat, function (d, i) {
        yVal_strat.push(Number(i));
    });

    yVal_org = yVal_org.sort(function (a, b) { return b - a });
    yVal_random = yVal_random.sort(function (a, b) { return b - a });
    yVal_strat = yVal_strat.sort(function (a, b) { return b - a });

    dataset = [];
    for (var i = 0; i < xVal.length; i++) {
        dataset.push({
            "x": xVal[i],
            "y_org": yVal_org[i],
            "y_random": yVal_random[i],
            "y_strat": yVal_strat[i]
        });
    }

    // The number of datapoints
    var xMax = 10;
    var xMin = 0;
    var yMax = 4;
    var yMin = 0;


    dotSize = 2;
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain([xMin, xMax])


    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax]) // input 
        .range([height, 0]); // output 


    var line1 = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left;
        })
        .y(function (d, i) {
            return yScale(d.y_org) + 50;
        })
        .curve(d3.curveMonotoneX)

    var line2 = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left;
        })
        .y(function (d, i) {
            return yScale(d.y_random) + 50;
        })
        .curve(d3.curveMonotoneX)

    var line3 = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left;
        })
        .y(function (d, i) {
            return yScale(d.y_strat) + 50;
        })
        .curve(d3.curveMonotoneX)



    var svg;
    if (side == "left") {
        svg = d3.select("#left_svg");
    } else {
        svg = d3.select("#right_svg");
    }
    svg
        .append("g")

    var margin_top = height + 50;
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + margin_top + ")")
        .call(d3.axisBottom(xScale));


    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",50)")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dataset)
        .attr("class", "line1")
        .attr("d", line1);

    svg.append("path")
        .datum(dataset)
        .attr("class", "line2")
        .attr("d", line2);

    svg.append("path")
        .datum(dataset)
        .attr("class", "line3")
        .attr("d", line3);



    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", - (height / 2) - 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(y_label);


    // x-axis label
    svg.append('text')
        .attr('y', height + 90)
        .attr('x', width / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(x_label);

    // title
    svg.append('text')
        .attr('x', width/2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(title)

    // y axis marker
    svg.append('text')
        .attr('y', 5)
        .attr('x', - (height / 3) + 40)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width + 40)
        .attr('y', height + 80)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')



    label_size_1 = '10px';
    // Legend - Original
    svg.append('text')
        .attr('x', 80)
        .attr('y', 60)
        .attr('fill', colors[0])
        .style('stroke', colors[0])
        .style('font-size', label_size_1)
        .style('letter-spacing', letter_spacing)
        .text('Original')


    svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 58)
        .attr("r", 4)
        .attr("fill", colors[0])
        .attr("stroke", colors[0]);



    // Legend - Random
    svg.append('text')
        .attr('x', 80)
        .attr('y', 80)
        .attr('fill', colors[1])
        .style('stroke', colors[1])
        .style('font-size', label_size_1)
        .style('letter-spacing', letter_spacing)
        .text('Random')



    svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 78)
        .attr("r", 4)
        .attr("fill", colors[1])
        .attr("stroke", colors[1]);



    // Legend - Stratified
    svg.append('text')
        .attr('x', 80)
        .attr('y', 98)
        .attr('fill', colors[2])
        .style('stroke', colors[2])
        .style('font-size', label_size_1)
        .style('letter-spacing', letter_spacing)
        .text('Stratified')


    svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 95)
        .attr("r", 4)
        .attr("fill", colors[2])
        .attr("stroke", colors[2]);


}


function line_chart_comparison_2(dataset, y_label, x_label, title, side, type, plot_type) {
    if (side == "left") {
        $('#left_svg').html('');
    } else {
        $('#right_svg').html('');
    }
    var dotSize = 5;

    if (typeof dataset == "string")
        dataset = JSON.parse(dataset)

    var margin = { top: 50, right: 50, bottom: 50, left: 50 };
    var width = 450;
    var height = $("#" + side + "_svg").innerHeight() - 100;


    xVal = [];
    $.each(dataset.x, function (d, i) {
        if (type == 'numeric') {
            xVal.push(Number(i));
        } else {
            xVal.push(i);
        }
    });

    yVal_cum_org = [];
    yVal_cum_random = [];
    yVal_cum_strat = [];

    $.each(dataset.y_cum_org, function (d, i) {
        yVal_cum_org.push(Number(i));
    });

    $.each(dataset.y_cum_random, function (d, i) {
        yVal_cum_random.push(Number(i));
    });

    $.each(dataset.y_cum_strat, function (d, i) {
        yVal_cum_strat.push(Number(i));
    });


    yVal_var_org = [];
    yVal_var_random = [];
    yVal_var_strat = [];

    $.each(dataset.y_var_org, function (d, i) {
        yVal_var_org.push(Number(i));
    });

    $.each(dataset.y_var_random, function (d, i) {
        yVal_var_random.push(Number(i));
    });

    $.each(dataset.y_var_strat, function (d, i) {
        yVal_var_strat.push(Number(i));
    });

    yVal_var_org = yVal_var_org.sort(function (a, b) { return b - a });
    yVal_var_random = yVal_var_random.sort(function (a, b) { return b - a });
    yVal_var_strat = yVal_var_strat.sort(function (a, b) { return b - a });

    dataset = [];
    for (var i = 0; i < xVal.length; i++) {
        dataset.push({
            "x": xVal[i],
            "y_var_org": yVal_var_org[i],
            "y_var_random": yVal_var_random[i],
            "y_var_strat": yVal_var_strat[i],
            "y_cum_org": yVal_cum_org[i],
            "y_cum_random": yVal_cum_random[i],
            "y_cum_strat": yVal_cum_strat[i]
        });
    }

    // The number of datapoints
    var xMax = 10;
    var xMin = 0;
    var yMax = 110;
    var yMin = 0;


    dotSize = 2;
    K = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var xScale = d3.scaleBand()
        .range([0, width])
        .domain(K)
        .padding(0.2)


    // 6. Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear()
        .domain([yMin, yMax]) // input 
        .range([height, 0]); // output 


    var line1 = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left + 10;
        })
        .y(function (d, i) {
            return yScale(d.y_cum_org) + 50;
        })
        .curve(d3.curveMonotoneX)

    var line2 = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left + 10;
        })
        .y(function (d, i) {
            return yScale(d.y_cum_random) + 50;
        })
        .curve(d3.curveMonotoneX)

    var line3 = d3.line()
        .x(function (d, i) {
            return xScale(d.x) + margin.left + 10;
        })
        .y(function (d, i) {
            return yScale(d.y_cum_strat) + 50;
        })
        .curve(d3.curveMonotoneX)



    var svg;
    if (side == "left") {
        svg = d3.select("#left_svg");
    } else {
        svg = d3.select("#right_svg");
    }
    svg
        .append("g")

    var margin_top = height + 50;
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + margin_top + ")")
        .call(d3.axisBottom(xScale));


    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + margin.left + ",50)")
        .call(d3.axisLeft(yScale));

    svg.append("path")
        .datum(dataset)
        .attr("class", "line1")
        .attr("d", line1);

    svg.append("path")
        .datum(dataset)
        .attr("class", "line2")
        .attr("d", line2);

    svg.append("path")
        .datum(dataset)
        .attr("class", "line3")
        .attr("d", line3);


    x_band = xScale.bandwidth();
    // Append bars on svg
    var bars = svg.selectAll()
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(d.x) + margin.left)
        .attr('height', (d, i) => height - yScale(d.y_var_org))
        .attr('y', (d, i) => yScale(d.y_var_org) + 50)
        .attr('width', x_band - 5)
        .attr("fill", (d, i) => colors[0]);


    x_band = xScale.bandwidth();
    // Append bars on svg
    var bars_random = svg.selectAll()
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(d.x) + margin.left)
        // .attr('height', (d,i) =>  height - yScale(d.y_var_org + d.y_var_random))
        // .attr('y', (d,i) =>   yScale(d.y_var_org + d.y_var_random))
        .attr('height', (d, i) => height - yScale(d.y_var_random))
        .attr('y', (d, i) => yScale(d.y_var_random) + 50)
        .attr('width', x_band - 5)
        .attr("fill", (d, i) => colors[1]);



    x_band = xScale.bandwidth();
    // Append bars on svg
    var bars_strat = svg.selectAll()
        .data(dataset)
        .enter()
        .append('rect')
        .attr('x', (d, i) => xScale(d.x) + margin.left)
        // .attr('height', (d,i) =>  height - yScale(d.y_var_org + d.y_var_random + d.y_var_strat))
        // .attr('y', (d,i) =>   yScale(d.y_var_org + d.y_var_random + d.y_var_strat))
        .attr('height', (d, i) => height - yScale(d.y_var_strat))
        .attr('y', (d, i) => yScale(d.y_var_strat) + 50)
        .attr('width', x_band - 5)
        .attr("fill", (d, i) => colors[2]);

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0)
        .attr("x", - (height / 2) - 50)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(y_label);


    // x-axis label
    svg.append('text')
        .attr('y', height + 90)
        .attr('x', width / 2)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .text(x_label);

    // title
    svg.append('text')
        .attr('x', width/2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', label_size)
        .style('letter-spacing', letter_spacing)
        .text(title)

    // y axis marker
    svg.append('text')
        .attr('y', 5)
        .attr('x', - (height / 3) + 40)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('y -->')

    // x axis marker
    svg.append('text')
        .attr('x', width + 40)
        .attr('y', height + 80)
        .attr('fill', 'white')
        .style('stroke', 'white')
        .style('font-size', "10px")
        .text('x -->')



    label_size_1 = '10px';
    // Legend - Original
    svg.append('text')
        .attr('x', 80)
        .attr('y', 60)
        .attr('fill', colors[0])
        .style('stroke', colors[0])
        .style('font-size', label_size_1)
        .style('letter-spacing', letter_spacing)
        .text('Original')


    svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 58)
        .attr("r", 4)
        .attr("fill", colors[0])
        .attr("stroke", colors[0]);



    // Legend - Random
    svg.append('text')
        .attr('x', 80)
        .attr('y', 80)
        .attr('fill', colors[1])
        .style('stroke', colors[1])
        .style('font-size', label_size_1)
        .style('letter-spacing', letter_spacing)
        .text('Random')



    svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 78)
        .attr("r", 4)
        .attr("fill", colors[1])
        .attr("stroke", colors[1]);



    // Legend - Stratified
    svg.append('text')
        .attr('x', 80)
        .attr('y', 98)
        .attr('fill', colors[2])
        .style('stroke', colors[2])
        .style('font-size', label_size_1)
        .style('letter-spacing', letter_spacing)
        .text('Stratified')


    svg.append("circle")
        .attr("cx", 70)
        .attr("cy", 95)
        .attr("r", 4)
        .attr("fill", colors[2])
        .attr("stroke", colors[2]);
}


function moveToCenter(){
    $("#stratified_section_right").remove();
    $("#stratified_section_left").css("margin-left","25%");
    $("#left_part").css("width","43em");
    $("#left_part").css("width","41em");
}



function scatter_plot_matrix(chart_data, isStratified, plot_text) {

    moveToCenter();
    d3.select('#chart').remove();
    var jdata = chart_data;

    if(typeof chart_data == "string"){
        jdata = JSON.parse(chart_data);
    } 

    var traits = Object.keys(jdata);

    var width = 960;
    var size = 170;
    var padding = 10;

    var chart_width = 1300;
    var chart_height = 560;

    var x = d3.scaleLinear()
            .range([padding/2, size - padding/2])

    var y = d3.scaleLinear()
            .range([size - padding/2, padding/2]);

    data = {};
    data[traits[0]] = jdata[traits[0]];
    data[traits[1]] = jdata[traits[1]];
    data[traits[2]] = jdata[traits[2]];

    var domainByTrait = {};
    var traits = d3.keys(data).filter(function(d) { return d !== "clusterid"; });
    var n = traits.length;

    var xAxis = d3.axisBottom(x).ticks(6);
    var yAxis = d3.axisLeft(y).ticks(6);

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(d3.values(data[trait]));
    });

    var svg = d3.select("svg")
      .attr("id", "chart")
      .attr("width", chart_width)
      .attr("height", chart_height)
      .append("g")
      .attr("transform", "translate(20,0)");

    svg.selectAll(".x.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "x_axis_scatter")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

     svg.selectAll(".y.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "y_axis_scatter")
      .attr("transform", function(d, i) { return "translate(5," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });


      var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

      svg.append("text")
        .attr("class", "scree_name")
        .attr("text-anchor", "middle")
        .style("fill","white")
        .attr("transform", "translate(180,0)")
        .text("Scatter Plot");

      cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .style("fill","lawngreen")
      .text(function(d) { return d.x; });


      function plot(p) {
          var cell = d3.select(this);
          x.domain(domainByTrait[String(p.x)]);
          y.domain(domainByTrait[String(p.y)]);

          cell.append("rect")
              .attr("class", "frame")
              .attr("x", padding / 2)
              .attr("y", padding / 2)
              .attr("width", size - padding)
              .attr("height", size - padding);

          first_comp = data[String(p.x)];
          second_comp = data[String(p.y)];
          result_array = []
          second = d3.values(second_comp)
          cluster = jdata['clusterId']

          var count = 0;
          d3.values(first_comp).forEach(function(item, index) {
              temp_map = {};
              temp_map["x"] = item;
              temp_map["y"] = second[index];
              
              if(isStratified){
                temp_map['cluster'] = cluster[index]
              }

              result_array.push(temp_map);
          });

          if(isStratified){
            cell.selectAll("circle")
            .data(result_array)
            .enter().append("circle")
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y); })
            .attr("r", 3) 
            .style("fill", function(d) { return colors[d.cluster]});
          } else {
            cell.selectAll("circle")
            .data(result_array)
            .enter().append("circle")
            .attr("cx", function(d) { return x(d.x); })
            .attr("cy", function(d) { return y(d.y); })
            .attr("r", 3) 
            .style("fill","orange");
          }
          
      }
}

function cross(trait_a, trait_b) {
  var ret_mat = [], len_a = trait_a.length, len_b = trait_b.length, i, j;
  for (i = 0; i < len_a; i++)
    for (j = 0; j < len_b; j++)
      ret_mat.push(
        {x: trait_a[i], i: i,
          y: trait_b[j], j: j});
  return ret_mat;
}
