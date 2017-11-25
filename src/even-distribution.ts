import {
    createFloats,
    shuffleIntegers,
    createIntegers,
    mutateShuffle,
    mutateFloats,
    mutateIntegers,
} from './machine-learning/random';

export function createGenerationZero(schema, generator) {
    return Object.keys(schema).reduce(function (instance, key) {
        var schemaProp = schema[key];
        var values;
        switch (schemaProp.type) {
            case 'shuffle' :
                values = shuffleIntegers(schemaProp, generator);
                break;
            case 'float' :
                values = createFloats(schemaProp, generator);
                break;
            case 'integer':
                values = createIntegers(schemaProp, generator);
                break;
            default:
                throw new Error(`Unknown type ${schemaProp.type} of schema for key ${key}`);
        }
        instance[key] = values;
        return instance;
    }, {});
}

export function createCrossBreed(schema, parents, parentChooser) {
    return Object.keys(schema).reduce(function (crossDef, key) {
        var schemaDef = schema[key];
        var values = [];
        for (var i = 0, l = schemaDef.length; i < l; i++) {
            var p = parentChooser(key, parents);
            values.push(parents[p][key][i]);
        }
        crossDef[key] = values;
        return crossDef;
    }, {});
}

export function createMutatedClone(schema, generator, parent, factor) {
    return Object.keys(schema).reduce(function (clone, key) {
        var schemaProp = schema[key];
        var values;
        console.log(key, parent[key]);
        switch (schemaProp.type) {
            case 'shuffle' :
                values = mutateShuffle(
                    schemaProp, generator, parent[key], factor,
                );
                break;
            case 'float' :
                values = mutateFloats(
                    schemaProp, generator, parent[key], factor,
                );
                break;
            case 'integer':
                values = mutateIntegers(
                    schemaProp, generator, parent[key], factor,
                );
                break;
            default:
                throw new Error(`Unknown type ${schemaProp.type} of schema for key ${key}`);
        }
        clone[key] = values;
        return clone;
    }, {});
}
