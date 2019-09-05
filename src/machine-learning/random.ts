export function shuffleIntegers(prop, generator) {
    return random.mapToShuffle(prop, random.createNormals({
        length: prop.length || 10,
        inclusive: true,
    }, generator));
}

export function createIntegers(prop, generator) {
    return random.mapToInteger(prop, random.createNormals({
        length: prop.length,
        inclusive: true,
    }, generator));
}

export function createFloats(prop, generator) {
    return random.mapToFloat(prop, random.createNormals({
        length: prop.length,
        inclusive: true,
    }, generator));
}

export function createNormals(prop, generator) {
    var l = prop.length;
    var values = [];
    for (var i = 0; i < l; i++) {
        values.push(
            createNormal(prop, generator),
        );
    }
    return values;
}

export function mutateShuffle(prop, generator, originalValues, mutation_range, chanceToMutate) {
    return random.mapToShuffle(prop, random.mutateNormals(
        prop, generator, originalValues, mutation_range, chanceToMutate,
    ));
}

export function mutateIntegers(prop, generator, originalValues, mutation_range, chanceToMutate) {
    return random.mapToInteger(prop, random.mutateNormals(
        prop, generator, originalValues, mutation_range, chanceToMutate,
    ));
}

export function mutateFloats(prop, generator, originalValues, mutation_range, chanceToMutate) {
    return random.mapToFloat(prop, random.mutateNormals(
        prop, generator, originalValues, mutation_range, chanceToMutate,
    ));
}

export function mapToShuffle(prop, normals) {
    var offset = prop.offset || 0;
    var limit = prop.limit || prop.length;
    var sorted = normals.slice().sort(function (a, b) {
        return a - b;
    });
    return normals.map(function (val) {
        return sorted.indexOf(val);
    }).map(function (i) {
        return i + offset;
    }).slice(0, limit);
}

export function mapToInteger(prop, normals) {
    prop = {
        min: prop.min || 0,
        range: prop.range || 10,
        length: prop.length,
    };
    return random.mapToFloat(prop, normals).map(function (float) {
        return Math.round(float);
    });
}

export function mapToFloat(prop, normals) {
    prop = {
        min: prop.min || 0,
        range: prop.range || 1,
    };
    return normals.map(function (normal) {
        var min = prop.min;
        var range = prop.range;
        return min + normal * range;
    });
}

export function mutateNormals(prop, generator, originalValues, mutation_range, chanceToMutate) {
    var factor = (prop.factor || 1) * mutation_range;
    return originalValues.map(function (originalValue) {
        if (generator() > chanceToMutate) {
            return originalValue;
        }
        return mutateNormal(
            prop, generator, originalValue, factor,
        );
    });
}

function mutateNormal(prop, generator, originalValue, mutation_range) {
    if (mutation_range > 1) {
        throw new Error('Cannot mutate beyond bounds');
    }
    var newMin = originalValue - 0.5;
    if (newMin < 0) {
        newMin = 0;
    }
    if (newMin + mutation_range > 1) {
        newMin = 1 - mutation_range;
    }
    var rangeValue = createNormal({
        inclusive: true,
    }, generator);
    return newMin + rangeValue * mutation_range;
}

function createNormal(prop, generator) {
    if (!prop.inclusive) {
        return generator();
    } else {
        return generator() < 0.5 ?
               generator() :
               1 - generator();
    }
}
