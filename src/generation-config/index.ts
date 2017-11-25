import { pickParent } from './pickParent';

var carConstruct = require('../car-schema/construct');

var carConstants = carConstruct.carConstants();

var schema = carConstruct.generateSchema(carConstants);
var selectFromAllParents = require('./selectFromAllParents');
const constants = {
  generationSize: 20,
  schema: schema,
  championLength: 1,
  mutation_range: 1,
  gen_mutation: 0.05,
};
module.exports = function(){
  var currentChoices = new Map();
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
