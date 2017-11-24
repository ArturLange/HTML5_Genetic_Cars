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

module.exports = function (world_def) {
  let world = new b2World(world_def.gravity, world_def.doSleep);
  let floorTiles = cw_createFloor(
    world,
    world_def.floorseed,
    world_def.tileDimensions,
    world_def.maxFloorTiles,
    world_def.mutableFloor
  );

  let last_tile = floorTiles[
    floorTiles.length - 1
  ];
  let last_fixture = last_tile.GetFixtureList();
  let tile_position = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3],
  );
  world.finishLine = tile_position.x;
  return {
    world,
    floorTiles,
    finishLine: tile_position.x,
  };
};

function cw_createFloor(world, floorseed, dimensions, maxFloorTiles, mutable_floor) {
  let last_tile = null;
  let tile_position = new b2Vec2(-5, 0);
  let cw_floorTiles = [];
  Math.seedrandom(floorseed);
  for (let k = 0; k < maxFloorTiles; k++) {
    if (!mutable_floor) {
      // keep old impossible tracks if not using mutable floors
      last_tile = cw_createFloorTile(world, dimensions, tile_position, (Math.random() * 3 - 1.5) * 1.5 * k / maxFloorTiles,
      );
    } else {
      // if path is mutable over races, create smoother tracks
      last_tile = cw_createFloorTile(world, dimensions, tile_position, (Math.random() * 3 - 1.5) * 1.2 * k / maxFloorTiles,
      );
    }
    cw_floorTiles.push(last_tile);
    let last_fixture = last_tile.GetFixtureList();
    tile_position = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
  }
  return cw_floorTiles;
}


function cw_createFloorTile(world, dim, position, angle) {
  let body_def = new b2BodyDef();

  body_def.position.Set(position.x, position.y);
  let body = world.CreateBody(body_def);
  let fix_def = new b2FixtureDef();
  fix_def.shape = new b2PolygonShape();
  fix_def.friction = 0.5;

  let coords = new Array();
  coords.push(new b2Vec2(0, 0));
  coords.push(new b2Vec2(0, -dim.y));
  coords.push(new b2Vec2(dim.x, -dim.y));
  coords.push(new b2Vec2(dim.x, 0));

  let center = new b2Vec2(0, 0);

  let newcoords = cw_rotateFloorTile(coords, center, angle);

  fix_def.shape.SetAsArray(newcoords);

  body.CreateFixture(fix_def);
  return body;
}

function cw_rotateFloorTile(coords, center, angle) {
  return coords.map((coord) => {
    return {
      x: Math.cos(angle) * (coord.x - center.x) - Math.sin(angle) * (coord.y - center.y) + center.x,
      y: Math.sin(angle) * (coord.x - center.x) + Math.cos(angle) * (coord.y - center.y) + center.y,
    };
  });
}
