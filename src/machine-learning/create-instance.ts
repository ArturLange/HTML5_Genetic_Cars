import { createNormals, mutateNormals, mapToInteger, mapToFloat, mapToShuffle } from './random';

export function createGenerationZero(schema, generator) {
    return Object.keys(schema).reduce((instance, key) => {
        const schemaProp = schema[key];
        instance[key] = createNormals(schemaProp, generator);
        return instance;
    }, {
        id: Math.random().toString(32),
    });
}

export function createCrossBreed(schema, parents, parentChooser) {
    const id = Math.random().toString(32);
    return Object.keys(schema).reduce((crossDef, key) => {
        const schemaDef = schema[key];
        const values = [];
        for (let i = 0, l = schemaDef.length; i < l; i += 1) {
            const p = parentChooser(id, key, parents);
            values.push(parents[p][key][i]);
        }
        crossDef[key] = values;
        return crossDef;
    }, {
        id,
        ancestry: parents.map((parent) => {
            return {
                id: parent.id,
                ancestry: parent.ancestry,
            };
        }),
    });
}

export function createMutatedClone(schema, generator, parent, factor, chanceToMutate) {
    return Object.keys(schema).reduce((clone, key) => {
        const schemaProp = schema[key];
        const originalValues = parent[key];
        var values = mutateNormals(
            schemaProp, generator, originalValues, factor, chanceToMutate,
        );
        clone[key] = values;
        return clone;
    }, {
        id: parent.id,
        ancestry: parent.ancestry,
    });
}

export function applyTypes(schema, parent) {
    return Object.keys(schema).reduce((clone, key) => {
            const schemaProp = schema[key];
            const originalValues = parent[key];
            let values;
            switch (schemaProp.type) {
                case 'shuffle' :
                    values = mapToShuffle(schemaProp, originalValues);
                    break;
                case 'float' :
                    values = mapToFloat(schemaProp, originalValues);
                    break;
                case 'integer':
                    values = mapToInteger(schemaProp, originalValues);
                    break;
                default:
                    throw new Error(`Unknown type ${schemaProp.type} of schema for key ${key}`);
            }
            clone[key] = values;
            return clone;
        },
        {
            id: parent.id,
            ancestry: parent.ancestry,
        });
}
