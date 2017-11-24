
const cw_drawVirtualPoly = require('./draw-virtual-poly');
const cw_drawCircle = require('./draw-circle');

module.exports = function (car_constants, myCar, camera, ctx) {
    const camera_x = camera.pos.x;
    const zoom = camera.zoom;

    const wheelMinDensity = car_constants.wheelMinDensity;
    const wheelDensityRange = car_constants.wheelDensityRange;

    if (!myCar.alive) {
        return;
    }
    const myCarPos = myCar.getPosition();

    if (myCarPos.x < (camera_x - 5)) {
    // too far behind, don't draw
        return;
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1 / zoom;

    const wheels = myCar.car.car.wheels;

    for (let i = 0; i < wheels.length; i++) {
        const b = wheels[i];
        for (var f = b.GetFixtureList(); f; f = f.m_next) {
            const s = f.GetShape();
            const color = Math.round(255 - (255 * (f.m_density - wheelMinDensity)) / wheelDensityRange).toString();
            const rgbcolor = `rgb(${color},${color},${color})`;
            cw_drawCircle(ctx, b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
        }
    }

    if (myCar.is_elite) {
        ctx.strokeStyle = '#3F72AF';
        ctx.fillStyle = '#DBE2EF';
    } else {
        ctx.strokeStyle = '#F7C873';
        ctx.fillStyle = '#FAEBCD';
    }
    ctx.beginPath();

    const chassis = myCar.car.car.chassis;

    for (f = chassis.GetFixtureList(); f; f = f.m_next) {
        const cs = f.GetShape();
        cw_drawVirtualPoly(ctx, chassis, cs.m_vertices, cs.m_vertexCount);
    }
    ctx.fill();
    ctx.stroke();
};
