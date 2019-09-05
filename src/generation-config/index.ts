import { pickParent } from './pickParent';

const carConstruct = require('../car-schema/construct');

const carConstants = carConstruct.carConstants();

const schema = carConstruct.generateSchema(carConstants);
const selectFromAllParents = require('./selectFromAllParents');
const constants = {
    schema,
    generationSize: 20,
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
        },
    );
};
module.exports.constants = constants;
