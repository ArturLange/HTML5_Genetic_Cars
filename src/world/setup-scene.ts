import { b2World } from '../../lib/box2d';

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

export function setupScene(worldDef) {

    var world = new b2World(worldDef.gravity, worldDef.doSleep);
    var floorTiles = cw_createFloor(
        world,
        worldDef.floorseed,
        worldDef.tileDimensions,
        worldDef.maxFloorTiles,
        worldDef.mutable_floor,
    );

    var lastTile = floorTiles[
    floorTiles.length - 1
        ];
    var lastFixture = lastTile.GetFixtureList();
    var tilePosition = lastTile.GetWorldPoint(
        lastFixture.GetShape().m_vertices[3],
    );
    world.finishLine = tilePosition.x;
    return {
        world,
        floorTiles,
        finishLine: tilePosition.x,
    };
};

function cw_createFloor(world, floorseed, dimensions, maxFloorTiles, mutable_floor) {
    var last_tile = null;
    var tile_position = new b2Vec2(-5, 0);
    var cw_floorTiles = [];
    Math.seedrandom(floorseed);
    for (var k = 0; k < maxFloorTiles; k++) {
        if (!mutable_floor) {
            // keep old impossible tracks if not using mutable floors
            last_tile = cw_createFloorTile(
                world, dimensions, tile_position, (Math.random() * 3 - 1.5) * 1.5 * k / maxFloorTiles,
            );
        } else {
            // if path is mutable over races, create smoother tracks
            last_tile = cw_createFloorTile(
                world, dimensions, tile_position, (Math.random() * 3 - 1.5) * 1.2 * k / maxFloorTiles,
            );
        }
        cw_floorTiles.push(last_tile);
        var last_fixture = last_tile.GetFixtureList();
        tile_position = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    }
    return cw_floorTiles;
}

function cw_createFloorTile(world, dim, position, angle) {
    var body_def = new b2BodyDef();

    body_def.position.Set(position.x, position.y);
    var body = world.CreateBody(body_def);
    var fix_def = new b2FixtureDef();
    fix_def.shape = new b2PolygonShape();
    fix_def.friction = 0.5;

    var coords = new Array();
    coords.push(new b2Vec2(0, 0));
    coords.push(new b2Vec2(0, -dim.y));
    coords.push(new b2Vec2(dim.x, -dim.y));
    coords.push(new b2Vec2(dim.x, 0));

    var center = new b2Vec2(0, 0);

    var newcoords = cw_rotateFloorTile(coords, center, angle);

    fix_def.shape.SetAsArray(newcoords);

    body.CreateFixture(fix_def);
    return body;
}

function cw_rotateFloorTile(coords, center, angle) {
    return coords.map(function (coord) {
        return {
            x: Math.cos(angle) * (coord.x - center.x) - Math.sin(angle) * (coord.y - center.y) + center.x,
            y: Math.sin(angle) * (coord.x - center.x) + Math.cos(angle) * (coord.y - center.y) + center.y,
        };
    });
}
