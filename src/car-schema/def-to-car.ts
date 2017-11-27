import { applyTypes } from '../machine-learning/create-instance';
import { createChassis, createWheel } from './parts-creation';
import { B2RevoluteJointDef } from '../../lib/box2d-wrapper';

export function defToCar(normalDef, world, constants) {
    const carDef = applyTypes(constants.schema, normalDef);
    const instance = {
        chassis: createChassis(world, carDef.vertex_list, carDef.chassis_density),
        wheels: [],
    };

    const wheelCount = carDef.wheel_radius.length;

    for (let i = 0; i < wheelCount; i += 1) {
        instance.wheels[i] = createWheel(
            world,
            carDef.wheel_radius[i],
            carDef.wheel_density[i],
        );
    }

    let carMass = instance.chassis.GetMass();
    for (let i = 0; i < wheelCount; i += 1) {
        carMass += instance.wheels[i].GetMass();
    }

    const jointDef = new B2RevoluteJointDef();

    for (let i = 0; i < wheelCount; i += 1) {
        var torque = (carMass * -constants.gravity.y) / carDef.wheel_radius[i];

        var randvertex = instance.chassis.vertex_list[carDef.wheel_vertex[i]];
        jointDef.localAnchorA.Set(randvertex.x, randvertex.y);
        jointDef.localAnchorB.Set(0, 0);
        jointDef.maxMotorTorque = torque;
        jointDef.motorSpeed = -constants.motorSpeed;
        jointDef.enableMotor = true;
        jointDef.bodyA = instance.chassis;
        jointDef.bodyB = instance.wheels[i];
        world.CreateJoint(jointDef);
    }

    return instance;
}


