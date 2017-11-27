import {
    getInitialState,
    getStatus,
    hasFailed,
    hasSuccess,
    calculateScore,
} from '../../src/car-schema/run';
import { expect } from 'chai';
import 'mocha';

describe('getInitialState function', () => {
    it('should return predefined valueswith health given from worldDef', () => {
        const worldDefMock = {
            max_car_health: 57,
        };
        const expected = {
            frames: 0,
            health: 57,
            maxPositiony: 0,
            minPositiony: 0,
            maxPositionx: 0,
        };
        expect(getInitialState(worldDefMock)).to.deep.equal(expected);
    });
});

describe('getStatus function', () => {
    it('should return -1 when given state health is zero', () => {
        const stateMock = {
            health: 0,
        };
        const constantsMock = {};
        expect(getStatus(stateMock, constantsMock)).to.equal(-1);
    });

    it('should return -1 when given state health is below zero', () => {
        const stateMock = {
            health: -128,
        };
        const constantsMock = {};
        expect(getStatus(stateMock, constantsMock)).to.equal(-1);
    });

    it('should return 1 when success conditions are met', () => {
        const stateMock = {
            health: 12,
            maxPositionx: 2,
        };
        const constantsMock = {
            finishLine: 1,
        };
        expect(getStatus(stateMock, constantsMock)).to.equal(1);
    });
});

describe('hasFailed function', () => {
    it('should return true when state health is zero', () => {
        const stateMock = {
            health: 0,
        };
        expect(hasFailed(stateMock)).to.equal(true);
    });

    it('should return true when state health is below zero', () => {
        const stateMock = {
            health: -5,
        };
        expect(hasFailed(stateMock)).to.equal(true);
    });

    it('should return false when state health is above zero', () => {
        const stateMock = {
            health: 5,
        };
        expect(hasFailed(stateMock)).to.equal(false);
    });
});

describe('hasSuccess function', () => {
    it('should return true when state maxPositionx is greater than constants.finishLine', () => {
        const stateMock = {
            maxPositionx: 5,
        };
        const constantsMock = {
            finishLine: 1,
        };
        expect(hasSuccess(stateMock, constantsMock)).to.equal(true);
    });

    it('should return false when state maxPositionx is less than constants.finishLine', () => {
        const stateMock = {
            maxPositionx: 5,
        };
        const constantsMock = {
            finishLine: 6,
        };
        expect(hasSuccess(stateMock, constantsMock)).to.equal(false);
    });
});

describe('calculateScore function', () => {
    it('should return object with score values', () => {
        const stateMock = {
            maxPositionx: 5,
            maxPositiony: 12,
            minPositiony: 3,
            frames: 30,
        };
        const constantsMock = {
            finishLine: 1,
            box2dfps: 60,
        };
        const expected = {
            s: 10,
            x: 5,
            v: 15,
            y: 12,
            y2: 3,
        };
        expect(calculateScore(stateMock, constantsMock)).to.deep.equal(expected);
    });

});
