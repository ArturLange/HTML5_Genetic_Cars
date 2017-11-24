const getInbreedingCoefficient = require('./inbreeding-coefficient');

module.exports = simpleSelect;

function simpleSelect(parents) {
    const totalParents = parents.length;
    const r = Math.random();
    if (r === 0) { return 0; }
    return Math.floor(-Math.log(r) * totalParents) % totalParents;
}

function selectFromAllParents(parents, parentList, previousParentIndex) {
    const previousParent = parents[previousParentIndex];
    const validParents = parents.filter((parent, i) => {
        if (previousParentIndex === i) {
            return false;
        }
        if (!previousParent) {
            return true;
        }
        const child = {
            id: Math.random().toString(32),
            ancestry: [previousParent, parent].map(p => ({
                id: p.def.id,
                ancestry: p.def.ancestry,
            })),
        };
        const iCo = getInbreedingCoefficient(child);
        console.log('inbreeding coefficient', iCo);
        if (iCo > 0.25) {
            return false;
        }
        return true;
    });
    if (validParents.length === 0) {
        return Math.floor(Math.random() * parents.length);
    }
    const totalScore = validParents.reduce((sum, parent) => sum + parent.score.v, 0);
    let r = totalScore * Math.random();
    for (var i = 0; i < validParents.length; i++) {
        const score = validParents[i].score.v;
        if (r > score) {
            r -= score;
        } else {
            break;
        }
    }
    return i;
}
