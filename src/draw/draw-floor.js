const cw_drawVirtualPoly = require('./draw-virtual-poly');

module.exports = function (ctx, camera, cw_floorTiles) {
    const camera_x = camera.pos.x;
    const zoom = camera.zoom;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#777';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();

    let k;
    if (camera.pos.x - 10 > 0) {
        k = Math.floor((camera.pos.x - 10) / 1.5);
    } else {
        k = 0;
    }

    // console.log(k);

    outer_loop:
    for (k; k < cw_floorTiles.length; k++) {
        const b = cw_floorTiles[k];
        for (let f = b.GetFixtureList(); f; f = f.m_next) {
            const s = f.GetShape();
            const shapePosition = b.GetWorldPoint(s.m_vertices[0]).x;
            if ((shapePosition > (camera_x - 5)) && (shapePosition < (camera_x + 10))) {
                cw_drawVirtualPoly(ctx, b, s.m_vertices, s.m_vertexCount);
            }
            if (shapePosition > camera_x + 10) {
                break outer_loop;
            }
        }
    }
    ctx.fill();
    ctx.stroke();
};
