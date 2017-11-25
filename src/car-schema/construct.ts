interface WorldDefinition {
    gravity: any;
    doSleep: boolean;
    floorseed: string;
    maxFloorTiles: number;
    mutable_floor: boolean;
    motorSpeed: number;
    box2dfps: number;
    max_car_health: number;
    tileDimensions: TileDimensions;
}

interface TileDimensions {
    width: number;
    height: number;
}

export function worldDef(): WorldDefinition {
    const box2dfps = 60;
    return {
        box2dfps,
        gravity: {
            y: 0,
        },
        doSleep: true,
        floorseed: 'abc',
        maxFloorTiles: 200,
        mutable_floor: false,
        motorSpeed: 20,
        max_car_health: box2dfps * 10,
        tileDimensions: {
            width: 1.5,
            height: 0.15,
        },
    };
}

export function carConstants() {
    return {
        wheelCount: 2,
        wheelMinRadius: 0.2,
        wheelRadiusRange: 0.5,
        wheelMinDensity: 40,
        wheelDensityRange: 100,
        chassisDensityRange: 300,
        chassisMinDensity: 30,
        chassisMinAxis: 0.1,
        chassisAxisRange: 1.1,
    };
}

export function generateSchema(values) {
    return {
        wheel_radius: {
            type: 'float',
            length: values.wheelCount,
            min: values.wheelMinRadius,
            range: values.wheelRadiusRange,
            factor: 1,
        },
        wheel_density: {
            type: 'float',
            length: values.wheelCount,
            min: values.wheelMinDensity,
            range: values.wheelDensityRange,
            factor: 1,
        },
        chassis_density: {
            type: 'float',
            length: 1,
            min: values.chassisDensityRange,
            range: values.chassisMinDensity,
            factor: 1,
        },
        vertex_list: {
            type: 'float',
            length: 12,
            min: values.chassisMinAxis,
            range: values.chassisAxisRange,
            factor: 1,
        },
        wheel_vertex: {
            type: 'shuffle',
            length: 8,
            limit: 2,
            factor: 1,
        },
    };
}
