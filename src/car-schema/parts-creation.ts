import {
    B2Vec2,
    B2Body,
    B2BodyDef,
    B2FixtureDef,
    B2PolygonShape,
    B2CircleShape,
} from '../../lib/box2d-wrapper';

export function createChassisPart(body, vertex1, vertex2, density) {
    const vertexList = [];
    vertexList.push(vertex1);
    vertexList.push(vertex2);
    vertexList.push(B2Vec2.Make(0, 0));
    const fixtureDef = new B2FixtureDef();
    fixtureDef.shape = new B2PolygonShape();
    fixtureDef.density = density;
    fixtureDef.friction = 10;
    fixtureDef.restitution = 0.2;
    fixtureDef.filter.groupIndex = -1;
    fixtureDef.shape.SetAsArray(vertexList, 3);

    body.CreateFixture(fixtureDef);
}

export function createChassis(world, vertices, density) {

    const vertexList = [];
    vertexList.push(new B2Vec2(vertices[0], 0));
    vertexList.push(new B2Vec2(vertices[1], vertices[2]));
    vertexList.push(new B2Vec2(0, vertices[3]));
    vertexList.push(new B2Vec2(-vertices[4], vertices[5]));
    vertexList.push(new B2Vec2(-vertices[6], 0));
    vertexList.push(new B2Vec2(-vertices[7], -vertices[8]));
    vertexList.push(new B2Vec2(0, -vertices[9]));
    vertexList.push(new B2Vec2(vertices[10], -vertices[11]));

    const bodyDef = new B2BodyDef();
    bodyDef.type = B2Body.b2_dynamicBody;
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

export function createWheel(world, radius, density) {
    const bodyDef = new B2BodyDef();
    bodyDef.type = B2Body.b2_dynamicBody;
    bodyDef.position.Set(0, 0);

    const body = world.CreateBody(bodyDef);

    const fixtureDef = new B2FixtureDef();
    fixtureDef.shape = new B2CircleShape(radius);
    fixtureDef.density = density;
    fixtureDef.friction = 1;
    fixtureDef.restitution = 0.2;
    fixtureDef.filter.groupIndex = -1;

    body.CreateFixture(fixtureDef);
    return body;
}
