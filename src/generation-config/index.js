let carConstruct = require('../car-schema/construct.js');

let carConstants = carConstruct.carConstants();

let schema = carConstruct.generateSchema(carConstants);
let pickParent = require('./pickParent');
let selectFromAllParents = require('./selectFromAllParents');

const constants = {
  generationSize: 20,
  schema,
  championLength: 1,
  mutation_range: 1,
  gen_mutation: 0.05,
};
module.exports = function () {
  let currentChoices = new Map();
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
