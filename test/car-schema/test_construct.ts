import { worldDef, carConstants, generateSchema } from '../../src/car-schema/construct';
import { expect } from 'chai';
import 'mocha';

describe('worldDef function', () => {
    it('should return predefined values', () => {
        const expected = {
            gravity: {
                y: 0,
            },
            doSleep: true,
            floorseed: 'abc',
            maxFloorTiles: 200,
            mutable_floor: false,
            motorSpeed: 20,
            box2dfps: 60,
            max_car_health: 60 * 10,
            tileDimensions: {
                width: 1.5,
                height: 0.15,
            },
        };
        expect(worldDef()).to.deep.equal(expected);
    });
});

describe('carConstants function', () => {
    it('should return predefined values', () => {
        const expected = {
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
        expect(carConstants()).to.deep.equal(expected);
    });
});

describe('generateSchema function', () => {
    it('should return predefined values with some substitutions', () => {
        const argument = {
            wheelCount: 3,
            wheelMinRadius: 0.15,
            wheelRadiusRange: 0.7,
            wheelMinDensity: 35,
            wheelDensityRange: 100,
            chassisDensityRange: 250,
            chassisMinDensity: 30,
            chassisMinAxis: 0.2,
            chassisAxisRange: 1.2,
        };
        const expected = {
            wheel_radius: {
                type: 'float',
                length: 3,
                min: 0.15,
                range: 0.7,
                factor: 1,
            },
            wheel_density: {
                type: 'float',
                length: 3,
                min: 35,
                range: 100,
                factor: 1,
            },
            chassis_density: {
                type: 'float',
                length: 1,
                min: 250,
                range: 30,
                factor: 1,
            },
            vertex_list: {
                type: 'float',
                length: 12,
                min: 0.2,
                range: 1.2,
                factor: 1,
            },
            wheel_vertex: {
                type: 'shuffle',
                length: 8,
                limit: 2,
                factor: 1,
            },
        };
        expect(generateSchema(argument)).to.deep.equal(expected);
    });
});