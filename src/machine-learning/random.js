const random = {
    shuffleIntegers(prop, generator) {
        return random.mapToShuffle(prop, random.createNormals({
            length: prop.length || 10,
            inclusive: true,
        }, generator));
    },
    createIntegers(prop, generator) {
        return random.mapToInteger(prop, random.createNormals({
            length: prop.length,
            inclusive: true,
        }, generator));
    },
    createFloats(prop, generator) {
        return random.mapToFloat(prop, random.createNormals({
            length: prop.length,
            inclusive: true,
        }, generator));
    },
    createNormals(prop, generator) {
        let l = prop.length;
        let values = [];
        for (let i = 0; i < l; i++) {
            values.push(createNormal(prop, generator));
        }
        return values;
    },
    mutateShuffle(prop, generator, originalValues, mutation_range, chanceToMutate) {
        return random.mapToShuffle(prop, random.mutateNormals(prop, generator, originalValues, mutation_range, chanceToMutate));
    },
    mutateIntegers(prop, generator, originalValues, mutation_range, chanceToMutate) {
        return random.mapToInteger(prop, random.mutateNormals(prop, generator, originalValues, mutation_range, chanceToMutate)
        );
    },
    mutateFloats(prop, generator, originalValues, mutation_range, chanceToMutate) {
        return random.mapToFloat(prop, random.mutateNormals(prop, generator, originalValues, mutation_range, chanceToMutate,
        ));
    },
    mapToShuffle(prop, normals) {
        let offset = prop.offset || 0;
        let limit = prop.limit || prop.length;
        let sorted = normals.slice().sort((a, b) => {
            return a - b;
        });
        return normals.map((val) => {
            return sorted.indexOf(val);
        }).map((i) => {
            return i + offset;
        }).slice(0, limit);
    },
    mapToInteger(prop, normals) {
        prop = {
            min: prop.min || 0,
            range: prop.range || 10,
            length: prop.length,
        };
        return random.mapToFloat(prop, normals).map((float) => {
            return Math.round(float);
        });
    },
    mapToFloat(prop, normals) {
        prop = {
            min: prop.min || 0,
            range: prop.range || 1,
        };
        return normals.map((normal) => {
            var min = prop.min;
            var range = prop.range;
            return min + normal * range
        });
    },
    mutateNormals(prop, generator, originalValues, mutation_range, chanceToMutate) {
        let factor = (prop.factor || 1) * mutation_range;
        return originalValues.map((originalValue) => {
            if (generator() > chanceToMutate) {
                return originalValue;
            }
            return mutateNormal(
                prop, generator, originalValue, factor
            );
        });
    },
};

module.exports = random;

function mutateNormal(prop, generator, originalValue, mutation_range) {
    if (mutation_range > 1) {
        throw new Error('Cannot mutate beyond bounds');
    }
    let newMin = originalValue - 0.5;
    if (newMin < 0) newMin = 0;
    if (newMin + mutation_range > 1) {
        newMin = 1 - mutation_range;
    }
    let rangeValue = createNormal({
        inclusive: true,
    }, generator);
    return newMin + rangeValue * mutation_range;
}

function createNormal(prop, generator) {
    if (!prop.inclusive) {
        return generator();
    }
    return generator() < 0.5 ?
        generator() :
        1 - generator();

}
