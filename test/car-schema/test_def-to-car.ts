import { expect } from 'chai';
import 'mocha';

import { createChassisPart } from '../../src/car-schema/parts-creation';

describe('createChassisPart function', () => {
    it('should return predefined values', () => {
        expect(typeof createChassisPart).to.equal('function');
    });
});
