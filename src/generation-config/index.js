const carConstruct = require('../car-schema/construct.js');

const carConstants = carConstruct.carConstants();

const schema = carConstruct.generateSchema(carConstants);
const pickParent = require('./pickParent');
const selectFromAllParents = require('./selectFromAllParents');

const constants = {
    generationSize: 20,
    schema,
    championLength: 1,
    mutation_range: 1,
    gen_mutation: 0.05,
};
module.exports = function () {
    const currentChoices = new Map();
    return Object.assign(
        {},
        constants,
        {
            selectFromAllParents,
            generateRandom: require('./generateRandom'),
            pickParent: pickParent.bind(void 0, currentChoices),
        }
    );
};
module.exports.constants = constants;
