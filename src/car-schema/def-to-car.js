/*
  globals b2RevoluteJointDef b2Vec2 b2BodyDef b2Body b2FixtureDef b2PolygonShape b2CircleShape
*/

const createInstance = require('../machine-learning/create-instance');

module.exports = defToCar;

function defToCar(normalDef, world, constants) {
    const carDef = createInstance.applyTypes(constants.schema, normalDef);
    const instance = {};
    instance.chassis = createChassis(world, carDef.vertex_list, carDef.chassis_density);
    let i;

    const wheelCount = carDef.wheel_radius.length;

    instance.wheels = [];
    for (i = 0; i < wheelCount; i++) {
        instance.wheels[i] = createWheel(world, carDef.wheel_radius[i], carDef.wheel_density[i]);
    }

    let carmass = instance.chassis.GetMass();
    for (i = 0; i < wheelCount; i++) {
        carmass += instance.wheels[i].GetMass();
    }

    const jointDef = new b2RevoluteJointDef();

    for (i = 0; i < wheelCount; i++) {
        const torque = carmass * -constants.gravity.y / carDef.wheel_radius[i];

        const randvertex = instance.chassis.vertex_list[carDef.wheel_vertex[i]];
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

function createChassis(world, vertexs, density) {
    const vertexList = [];
    vertexList.push(new b2Vec2(vertexs[0], 0));
    vertexList.push(new b2Vec2(vertexs[1], vertexs[2]));
    vertexList.push(new b2Vec2(0, vertexs[3]));
    vertexList.push(new b2Vec2(-vertexs[4], vertexs[5]));
    vertexList.push(new b2Vec2(-vertexs[6], 0));
    vertexList.push(new b2Vec2(-vertexs[7], -vertexs[8]));
    vertexList.push(new b2Vec2(0, -vertexs[9]));
    vertexList.push(new b2Vec2(vertexs[10], -vertexs[11]));

    const bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(0.0, 4.0);

    const body = world.CreateBody(bodyDef);

    createChassisPart(body, vertexList[0], vertexList[1], density);
    createChassisPart(body, vertexList[1], vertexList[2], density);
    createChassisPart(body, vertexList[2], vertexList[3], density);
    createChassisPart(body, vertexList[3], vertexList[4], density);
    createChassisPart(body, vertexList[4], vertexList[5], density);
    createChassisPart(body, vertexList[5], vertexList[6], density);
    createChassisPart(body, vertexList[6], vertexList[7], density);
    createChassisPart(body, vertexList[7], vertexList[0], density);

    body.vertex_list = vertexList;

    return body;
}


function createChassisPart(body, vertex1, vertex2, density) {
    const vertexList = [];
    vertexList.push(vertex1);
    vertexList.push(vertex2);
    vertexList.push(b2Vec2.Make(0, 0));
    const fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    fixDef.density = density;
    fixDef.friction = 10;
    fixDef.restitution = 0.2;
    fixDef.filter.groupIndex = -1;
    fixDef.shape.SetAsArray(vertexList, 3);

    body.CreateFixture(fixDef);
}

function createWheel(world, radius, density) {
    const bodyDef = new b2BodyDef();
    bodyDef.type = b2Body.b2_dynamicBody;
    bodyDef.position.Set(0, 0);

    const body = world.CreateBody(bodyDef);

    const fixDef = new b2FixtureDef();
    fixDef.shape = new b2CircleShape(radius);
    fixDef.density = density;
    fixDef.friction = 1;
    fixDef.restitution = 0.2;
    fixDef.filter.groupIndex = -1;

    body.CreateFixture(fixDef);
    return body;
}
