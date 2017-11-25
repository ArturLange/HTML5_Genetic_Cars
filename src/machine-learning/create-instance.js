const random = require('./random.js');

module.exports = {
    createGenerationZero(schema, generator) {
        return Object.keys(schema).reduce((instance, key) => {
            const schemaProp = schema[key];
            const values = random.createNormals(schemaProp, generator);
            instance[key] = values;
            return instance;
        }, { id: Math.random().toString(32) });
    },
    createCrossBreed(schema, parents, parentChooser) {
        const id = Math.random().toString(32);
        return Object.keys(schema).reduce((crossDef, key) => {
            const schemaDef = schema[key];
            const values = [];
            for (let i = 0, l = schemaDef.length; i < l; i++) {
                const p = parentChooser(id, key, parents);
                values.push(parents[p][key][i]);
            }
            crossDef[key] = values;
            return crossDef;
        }, {
            id,
            ancestry: parents.map(parent => ({
                id: parent.id,
                ancestry: parent.ancestry,
            })),
        });
    },
    createMutatedClone(schema, generator, parent, factor, chanceToMutate) {
        return Object.keys(schema).reduce((clone, key) => {
            const schemaProp = schema[key];
            const originalValues = parent[key];
            const values = random.mutateNormals(schemaProp, generator, originalValues, factor, chanceToMutate);
            clone[key] = values;
            return clone;
        }, {
            id: parent.id,
            ancestry: parent.ancestry,
        });
    },
    applyTypes(schema, parent) {
        return Object.keys(schema).reduce((clone, key) => {
            const schemaProp = schema[key];
            const originalValues = parent[key];
            let values;
            switch (schemaProp.type) {
            case 'shuffle':
                values = random.mapToShuffle(schemaProp, originalValues);
                break;
            case 'float':
                values = random.mapToFloat(schemaProp, originalValues);
                break;
            case 'integer':
                values = random.mapToInteger(schemaProp, originalValues);
                break;
            default:
                throw new Error(`Unknown type ${schemaProp.type} of schema for key ${key}`);
            }
            clone[key] = values;
            return clone;
        }, {
            id: parent.id,
            ancestry: parent.ancestry,
        });
    },
};
