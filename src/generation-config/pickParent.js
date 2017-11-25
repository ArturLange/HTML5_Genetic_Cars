const nAttributes = 15;

function pickParent(currentChoices, chooseId, key /* , parents */) {
    if (!currentChoices.has(chooseId)) {
        currentChoices.set(chooseId, initializePick());
    }
    // console.log(chooseId);
    const state = currentChoices.get(chooseId);
    // console.log(state.curparent);
    state.i++;
    if (['wheel_radius', 'wheel_vertex', 'wheel_density'].indexOf(key) > -1) {
        state.curparent = cwChooseParent(state);
        return state.curparent;
    }
    state.curparent = cwChooseParent(state);
    return state.curparent;

    function cwChooseParent(state) {
        const curparent = state.curparent;
        const attributeIndex = state.i;
        const swapPoint1 = state.swapPoint1;
        const swapPoint2 = state.swapPoint2;
        // console.log(swapPoint1, swapPoint2, attributeIndex)
        if ((swapPoint1 === attributeIndex) || (swapPoint2 === attributeIndex)) {
            return curparent === 1 ? 0 : 1;
        }
        return curparent;
    }

    function initializePick() {
        const curparent = 0;

        const swapPoint1 = Math.floor(Math.random() * (nAttributes));
        let swapPoint2 = swapPoint1;
        while (swapPoint2 === swapPoint1) {
            swapPoint2 = Math.floor(Math.random() * (nAttributes));
        }
        const i = 0;
        return {
            curparent,
            i,
            swapPoint1,
            swapPoint2,
        };
    }
}

module.exports = pickParent;
