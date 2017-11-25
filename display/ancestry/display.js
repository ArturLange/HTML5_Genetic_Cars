/* globals d3 window */

module.exports = function (container, def) {
    const graph = prepareGraph(container);
    return updateGraph(graph, def);
};
module.exports.prepareGraph = prepareGraph;
module.exports.updateGraph = updateGraph;


function prepareGraph(container) {
    container.innerHTML = '';
    const style = window.getComputedStyle(container, null);
    const height = style.getPropertyValue('height');
    const width = style.getPropertyValue('width');

    // ************** Generate the tree diagram *****************

    return {
        tree: d3.layout.tree().size([height, width]),

        diagonal: d3.svg.diagonal()
            .projection(d => [d.y, d.x]),

        svg: d3.select(container).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g'),
        height,
        width
    };
}

function updateGraph(graphInfo, def) {
    const tree = graphInfo.tree;
    const svg = graphInfo.svg;
    const diagonal = graphInfo.diagonal;
    const height = graphInfo.height;

    let i = 0,
        duration = 500;

    const treeData = defToAncestryTree(def);
    const root = treeData[0];

    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    function update(source) {
        // Compute the new tree layout.
        let nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach((d) => {
            d.y = d.depth * 180;
        });

        // Update the nodes…
        const node = svg.selectAll('g.node')
            .data(nodes, d => d.id || (d.id = ++i));

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', (/* d */) => `translate(${source.y0},${source.x0})`)
            .on('click', click);

        nodeEnter.append('circle')
            .attr('r', 1e-6)
            .style('fill', d => (d._children ? 'lightsteelblue' : '#fff'));

        nodeEnter.append('text')
            .attr('x', d => (d.children || d._children ? -13 : 13))
            .attr('dy', '.35em')
            .attr('text-anchor', d => (d.children || d._children ? 'end' : 'start'))
            .text(d => d.name)
            .style('fill-opacity', 1e-6);

        // Transition nodes to their new position.
        const nodeUpdate = node.transition()
            .duration(duration)
            .attr('transform', d => `translate(${d.y},${d.x})`);

        nodeUpdate.select('circle')
            .attr('r', 10)
            .style('fill', d => (d._children ? 'lightsteelblue' : '#fff'));

        nodeUpdate.select('text')
            .style('fill-opacity', 1);

        // Transition exiting nodes to the parent's new position.
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr('transform', (/* d */) => `translate(${source.y},${source.x})`)
            .remove();

        nodeExit.select('circle')
            .attr('r', 1e-6);

        nodeExit.select('text')
            .style('fill-opacity', 1e-6);

        // Update the links…
        const link = svg.selectAll('path.link')
            .data(links, d => d.target.id);

        // Enter any new links at the parent's previous position.
        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', (/* d */) => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal({ source: o, target: o });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr('d', diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr('d', (/* d */) => {
                const o = { x: source.x, y: source.y };
                return diagonal({ source: o, target: o });
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}

function defToAncestryTree(def) {
    return [
        {
            name: def.id,
            children: reduceAncestors(def.ancestry)
        }
    ];

    function reduceAncestors(ancestry) {
        const init = [];
        ancestry.reduce((children, maybeAncestor) => {
            if (typeof maybeAncestor === 'string') {
                const next = [];
                children.push({
                    name: maybeAncestor,
                    children: next
                });
                return next;
            }
            if (Array.isArray(maybeAncestor)) {
                maybeAncestor.forEach((ancestor) => {
                    children.push({
                        name: ancestor[0],
                        children: reduceAncestors(ancestor.slice(1))
                    });
                });
            }
        }, init);
        return init;
    }
}
