import { worldDef } from '../../src/car-schema/construct';
import { expect } from 'chai';
import 'mocha';

describe('worldDef function', () => {
    it('should return predefined values', () => {
        const expected = {
            gravity: {y: 0},
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