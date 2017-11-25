/* globals b2World b2Vec2 b2BodyDef b2FixtureDef b2PolygonShape */

/*

world_def = {
  gravity: {x, y},
  doSleep: boolean,
  floorseed: string,
  tileDimensions,
  maxFloorTiles,
  mutable_floor: boolean
}

*/

function cwCreateFloor(world, floorseed, dimensions, maxFloorTiles, mutableFloor) {
    let lastTile = null;
    let tilePosition = new b2Vec2(-5, 0);
    const cwFloorTiles = [];
    Math.seedrandom(floorseed);
    for (let k = 0; k < maxFloorTiles; k++) {
        if (!mutableFloor) {
            // keep old impossible tracks if not using mutable floors
            lastTile = cwCreateFloorTile(world, dimensions, tilePosition, (Math.random() * 3 - 1.5) * 1.5 * k / maxFloorTiles);
        } else {
            // if path is mutable over races, create smoother tracks
            lastTile = cwCreateFloorTile(world, dimensions, tilePosition, (Math.random() * 3 - 1.5) * 1.2 * k / maxFloorTiles);
        }
        cwFloorTiles.push(lastTile);
        const lastFixture = lastTile.GetFixtureList();
        tilePosition = lastTile.GetWorldPoint(lastFixture.GetShape().m_vertices[3]);
    }
    return cwFloorTiles;
}

function cwRotateFloorTile(coords, center, angle) {
    return coords.map(coord => ({
        x: Math.cos(angle) * (coord.x - center.x) - Math.sin(angle) * (coord.y - center.y) + center.x,
        y: Math.sin(angle) * (coord.x - center.x) + Math.cos(angle) * (coord.y - center.y) + center.y,
    }));
}


function cwCreateFloorTile(world, dim, position, angle) {
    const bodyDef = new b2BodyDef();

    bodyDef.position.Set(position.x, position.y);
    const body = world.CreateBody(bodyDef);
    const fixDef = new b2FixtureDef();
    fixDef.shape = new b2PolygonShape();
    fixDef.friction = 0.5;

    const coords = [];
    coords.push(new b2Vec2(0, 0));
    coords.push(new b2Vec2(0, -dim.y));
    coords.push(new b2Vec2(dim.x, -dim.y));
    coords.push(new b2Vec2(dim.x, 0));

    const center = new b2Vec2(0, 0);

    const newcoords = cwRotateFloorTile(coords, center, angle);

    fixDef.shape.SetAsArray(newcoords);

    body.CreateFixture(fixDef);
    return body;
}


module.exports = function (worldDef) {
    const world = new b2World(worldDef.gravity, worldDef.doSleep);
    const floorTiles = cwCreateFloor(
        world,
        worldDef.floorseed,
        worldDef.tileDimensions,
        worldDef.maxFloorTiles,
        worldDef.mutableFloor
    );

    const lastTile = floorTiles[
        floorTiles.length - 1
    ];
    const lastFixture = lastTile.GetFixtureList();
    const tilePosition = lastTile.GetWorldPoint(lastFixture.GetShape().m_vertices[3]);
    world.finishLine = tilePosition.x;
    return {
        world,
        floorTiles,
        finishLine: tilePosition.x,
    };
};
