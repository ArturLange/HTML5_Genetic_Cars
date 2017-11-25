const random = require('./machine-learning/random.js');

module.exports = {
    createGenerationZero(schema, generator) {
        return Object.keys(schema).reduce((instance, key) => {
            const schemaProp = schema[key];
            let values;
            switch (schemaProp.type) {
            case 'shuffle':
                values = random.shuffleIntegers(schemaProp, generator);
                break;
            case 'float':
                values = random.createFloats(schemaProp, generator);
                break;
            case 'integer':
                values = random.createIntegers(schemaProp, generator);
                break;
            default:
                throw new Error(`Unknown type ${schemaProp.type} of schema for key ${key}`);
            }
            instance[key] = values;
            return instance;
        }, {});
    },
    createCrossBreed(schema, parents, parentChooser) {
        return Object.keys(schema).reduce((crossDef, key) => {
            const schemaDef = schema[key];
            const values = [];
            for (let i = 0, l = schemaDef.length; i < l; i++) {
                const p = parentChooser(key, parents);
                values.push(parents[p][key][i]);
            }
            crossDef[key] = values;
            return crossDef;
        }, {});
    },
    createMutatedClone(schema, generator, parent, factor) {
        return Object.keys(schema).reduce((clone, key) => {
            const schemaProp = schema[key];
            let values;
            console.log(key, parent[key]);
            switch (schemaProp.type) {
            case 'shuffle':
                values = random.mutateShuffle(schemaProp, generator, parent[key], factor);
                break;
            case 'float':
                values = random.mutateFloats(schemaProp, generator, parent[key], factor);
                break;
            case 'integer':
                values = random.mutateIntegers(schemaProp, generator, parent[key], factor);
                break;
            default:
                throw new Error(`Unknown type ${schemaProp.type} of schema for key ${key}`);
            }
            clone[key] = values;
            return clone;
        }, {});
    },
};
