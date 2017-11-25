// http://sunmingtao.blogspot.com/2016/11/inbreeding-coefficient.html

function getInbreedingCoefficient(child) {
    const nameIndex = new Map();
    const flagged = new Set();
    const convergencePoints = new Set();
    createAncestryMap(child, []);

    const storedCoefficients = new Map();

    return Array.from(convergencePoints.values()).reduce((sum, point) => {
        const iCo = getCoefficient(point);
        return sum + iCo;
    }, 0);

    function createAncestryMap(initNode) {
        let itemsInQueue = [{ node: initNode, path: [] }];

        function processItem(node, path) {
            const newAncestor = !nameIndex.has(node.id);
            if (newAncestor) {
                nameIndex.set(node.id, {
                    parents: (node.ancestry || []).map(parent => parent.id),
                    id: node.id,
                    children: [],
                    convergences: [],
                });
            } else {
                flagged.add(node.id);
                nameIndex.get(node.id).children.forEach((childIdentifier) => {
                    const offsets = findConvergence(childIdentifier.path, path);
                    if (!offsets) {
                        return;
                    }
                    const childID = path[offsets[1]];
                    convergencePoints.add(childID);
                    nameIndex.get(childID).convergences.push({
                        parent: node.id,
                        offsets,
                    });
                });
            }

            if (path.length) {
                nameIndex.get(node.id).children.push({
                    child: path[0],
                    path,
                });
            }

            if (!newAncestor) {
                return;
            }
            if (!node.ancestry) {
                return;
            }
            return true;
        }

        do {
            const item = itemsInQueue.shift();
            if (processItem(item.node, item.path)) {
                const nextPath = [item.node.id].concat(item.path);
                itemsInQueue = itemsInQueue.concat(item.node.ancestry.map(parent => ({
                    node: parent,
                    path: nextPath,
                })));
            }
        } while (itemsInQueue.length);
    }

    function getCoefficient(id) {
        if (storedCoefficients.has(id)) {
            return storedCoefficients.get(id);
        }
        const node = nameIndex.get(id);
        const val = node.convergences.reduce((sum, point) => sum + Math.pow(1 / 2, point.offsets.reduce((sum, value) => sum + value, 1)) * (1 + getCoefficient(point.parent)), 0);
        storedCoefficients.set(id, val);

        return val;
    }
    function findConvergence(listA, listB) {
        let ci,
            cj,
            li,
            lj;
        outerloop:
        for (ci = 0, li = listA.length; ci < li; ci++) {
            for (cj = 0, lj = listB.length; cj < lj; cj++) {
                if (listA[ci] === listB[cj]) {
                    break outerloop;
                }
            }
        }
        if (ci === li) {
            return false;
        }
        return [ci, cj];
    }
}

module.exports = getInbreedingCoefficient;
