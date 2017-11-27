import { applyTypes } from '../machine-learning/create-instance';
import { createChassis, createWheel } from './parts-creation';
import { B2RevoluteJointDef } from '../../lib/box2d-wrapper';

export function defToCar(normalDef, world, constants) {
    var car_def = applyTypes(constants.schema, normalDef);
    let instance = {};
    instance.chassis = createChassis(world, car_def.vertex_list, car_def.chassis_density);

    const wheelCount = car_def.wheel_radius.length;

    instance.wheels = [];
    for (let i = 0; i < wheelCount; i += 1) {
        instance.wheels[i] = createWheel(
            world,
            car_def.wheel_radius[i],
            car_def.wheel_density[i],
        );
    }

    var carMass = instance.chassis.GetMass();
    for (let i = 0; i < wheelCount; i += 1) {
        carMass += instance.wheels[i].GetMass();
    }

    var jointDef = new B2RevoluteJointDef();

    for (let i = 0; i < wheelCount; i += 1) {
        var torque = (carMass * -constants.gravity.y) / car_def.wheel_radius[i];

        var randvertex = instance.chassis.vertex_list[car_def.wheel_vertex[i]];
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


