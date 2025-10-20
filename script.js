// Wait for the page to load
window.onload = function() {
    console.log("Page loaded, initializing graph...");

    // Graph data
    const graphData = {
        nodes: [
            { id: "0", label: "Main Square" },
            { id: "1", label: "Central Hospital" },
            { id: "2", label: "City Park" },
            { id: "3", label: "Shopping Mall" },
            { id: "4", label: "Train Station" },
            { id: "5", label: "University" }
        ],
        links: [
            { source: "0", target: "1", weight: 4, traffic: "low" },
            { source: "0", target: "2", weight: 2, traffic: "medium" },
            { source: "1", target: "2", weight: 5, traffic: "high" },
            { source: "1", target: "3", weight: 3, traffic: "low" },
            { source: "2", target: "3", weight: 4, traffic: "medium" },
            { source: "2", target: "4", weight: 6, traffic: "high" },
            { source: "3", target: "4", weight: 3, traffic: "low" },
            { source: "3", target: "5", weight: 2, traffic: "medium" },
            { source: "4", target: "5", weight: 4, traffic: "low" }
        ]
    };

// Initialize D3 graph
const container = document.getElementById('graph-container');
const width = container.clientWidth || 800; // Fallback width if container is not ready
const height = 400; // Increased height for better visibility

const svg = d3.select("#graph-container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Create force simulation
const simulation = d3.forceSimulation(graphData.nodes)
    .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX(width / 2).strength(0.1))
    .force("y", d3.forceY(height / 2).strength(0.1))
    .force("collision", d3.forceCollide().radius(40));

// Draw links with traffic colors
const link = svg.append("g")
    .selectAll("line")
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("stroke-width", 2)
    .style("stroke", d => {
        switch(d.traffic) {
            case "low": return "#22c55e";
            case "medium": return "#eab308";
            case "high": return "#ef4444";
            default: return "#94a3b8";
        }
    });

// Draw link labels with traffic info
const linkLabel = svg.append("g")
    .selectAll("text")
    .data(graphData.links)
    .enter()
    .append("text")
    .attr("class", "link-label")
    .text(d => `${d.weight}min (${d.traffic})`)
    .attr("text-anchor", "middle")
    .attr("dy", -8);

// Draw nodes with tooltips
const nodeGroup = svg.append("g");
const node = nodeGroup
    .selectAll("circle")
    .data(graphData.nodes)
    .enter()
    .append("circle")
    .attr("class", "node")
    .attr("r", 20)
    .attr("fill", "#cbd5e1");

// Add tooltips to nodes
node.append("title")
    .text(d => d.label);

// Draw node labels with background for better visibility
const labelGroup = svg.append("g");

// Add white background for text
const labelBackground = labelGroup
    .selectAll("rect")
    .data(graphData.nodes)
    .enter()
    .append("rect")
    .attr("fill", "white")
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("opacity", 0.8);

// Add text labels
const nodeLabel = labelGroup
    .selectAll("text")
    .data(graphData.nodes)
    .enter()
    .append("text")
    .attr("class", "node-label")
    .text(d => d.id) // Show ID by default, will show label on hover
    .attr("text-anchor", "middle")
    .attr("dy", 5)
    .each(function(d) {
        const bbox = this.getBBox();
        const padding = 2;
        d.labelWidth = bbox.width + 2 * padding;
        d.labelHeight = bbox.height + 2 * padding;
    });

// Update background rectangles based on text size
labelBackground
    .attr("width", d => d.labelWidth)
    .attr("height", d => d.labelHeight)
    .attr("x", d => -d.labelWidth / 2)
    .attr("y", d => -d.labelHeight / 2);

// Update positions on each tick
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    linkLabel
        .attr("x", d => (d.source.x + d.target.x) / 2)
        .attr("y", d => (d.source.y + d.target.y) / 2);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    nodeLabel
        .attr("x", d => d.x)
        .attr("y", d => d.y);
});

// Dijkstra's Algorithm Implementation
function dijkstra(graph, startNode, endNode) {
    console.log('Running Dijkstra with:', { startNode, endNode, graph }); // Debug output
    
    const nodes = new Set(graph.nodes.map(n => n.id));
    const distances = {};
    const previous = {};
    const steps = [];

    // Initialize distances
    nodes.forEach(node => {
        distances[node] = Infinity;
        previous[node] = null;
    });
    distances[startNode] = 0;

    while (nodes.size > 0) {
        // Find node with minimum distance
        let minNode = null;
        for (let node of nodes) {
            if (minNode === null || distances[node] < distances[minNode]) {
                minNode = node;
            }
        }

        if (distances[minNode] === Infinity) break;
        nodes.delete(minNode);

        // Record the step
        steps.push({
            current: minNode,
            distances: { ...distances }
        });

        // Get neighboring nodes
        const neighbors = graph.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return sourceId === minNode || targetId === minNode;
        });

        for (let { source, target, weight } of neighbors) {
            const sourceId = typeof source === 'object' ? source.id : source;
            const targetId = typeof target === 'object' ? target.id : target;
            const neighbor = sourceId === minNode ? targetId : sourceId;
            
            if (!nodes.has(neighbor)) continue;

            const alt = distances[minNode] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = minNode;
            }
        }
    }

    // Construct the path
    const path = [];
    let current = endNode;
    while (current !== null) {
        path.unshift(current);
        current = previous[current];
    }

    return {
        path,
        distances,
        steps
    };
}

// UI Event Handlers
document.getElementById('run-btn').addEventListener('click', () => {
    const startNode = document.getElementById('start-node').value;
    const endNode = document.getElementById('end-node').value;
    
    console.log('Selected nodes:', startNode, endNode); // Debug output
    
    if (!startNode || !endNode || startNode === endNode) {
        alert('Please select different start and end nodes');
        return;
    }

    // Reset previous visualization
    node.attr('fill', '#cbd5e1')
        .classed('current-node', false)
        .classed('visited-node', false)
        .classed('final-path-node', false);
    link.classed('highlighted-path', false);

    // Run Dijkstra's algorithm
    const result = dijkstra(graphData, startNode, endNode);

    // Display the results
    const distancesDiv = document.getElementById('distances');
    distancesDiv.innerHTML = '';
    Object.entries(result.distances).forEach(([node, distance]) => {
        const div = document.createElement('div');
        div.textContent = `${graphData.nodes.find(n => n.id === node).label}: ${distance === Infinity ? '∞' : distance} minutes`;
        distancesDiv.appendChild(div);
    });

    // Display the path
    const pathDiv = document.getElementById('path-result');
    const pathNodesDiv = document.getElementById('path-nodes');
    if (result.path.length > 1) {
        pathDiv.classList.remove('hidden');
        const pathWithLabels = result.path.map(id => {
            const node = graphData.nodes.find(n => n.id === id);
            return node.label;
        });
        pathNodesDiv.textContent = pathWithLabels.join(' → ');

        // Highlight the path
        console.log('Path to highlight:', result.path); // Debug output
        
        result.path.forEach(nodeId => {
            node.filter(d => d.id === nodeId)
                .classed('final-path-node', true)
                .each(d => console.log('Highlighting node:', d)); // Debug output
        });

        // Highlight the links in the path
        for (let i = 0; i < result.path.length - 1; i++) {
            const source = result.path[i];
            const target = result.path[i + 1];
            console.log('Looking for link:', source, '->', target); // Debug output
            link.filter(d => {
                const match = (d.source.id === source && d.target.id === target) ||
                            (d.source.id === target && d.target.id === source);
                if (match) console.log('Found matching link:', d); // Debug output
                return match;
            }).classed('highlighted-path', true);
        }
    }

    // Display algorithm steps
    const stepsDiv = document.getElementById('algorithm-steps');
    stepsDiv.innerHTML = '';
    result.steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'algorithm-step';
        const nodeName = graphData.nodes.find(n => n.id === step.current).label;
        stepDiv.innerHTML = `
            <p><strong>Step ${index + 1}:</strong> Processing ${nodeName}</p>
            <p>Current travel times: ${Object.entries(step.distances)
                .map(([node, dist]) => {
                    const name = graphData.nodes.find(n => n.id === node).label;
                    return `${name}: ${dist === Infinity ? '∞' : dist + ' min'}`;
                })
                .join(', ')}</p>
        `;
        stepsDiv.appendChild(stepDiv);
    });
});

// Add hover effects
node.on('mouseover', function(event, d) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 25);

    // Show location name
    nodeLabel.filter(label => label.id === d.id)
        .transition()
        .duration(200)
        .style('font-size', '16px')
        .text(d.label);

    // Show traffic information for connected links
    link.style('stroke-width', l => 
        (l.source.id === d.id || l.target.id === d.id) ? 4 : 2
    );
}).on('mouseout', function(event, d) {
    d3.select(this)
        .transition()
        .duration(200)
        .attr('r', 20);

    // Reset node label
    nodeLabel.filter(label => label.id === d.id)
        .transition()
        .duration(200)
        .style('font-size', '14px')
        .text(d.id);

    // Reset link appearance
    link.style('stroke-width', 2);
});

    // Initialize with default values
    resetGraph();
};
