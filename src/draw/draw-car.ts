import { drawCircle } from './draw-circle';
import { drawVirtualPoly } from './draw-virtual-poly';

export function drawCar(carConstants, myCar, camera, ctx) {
    const wheelMinDensity = carConstants.wheelMinDensity;
    const wheelDensityRange = carConstants.wheelDensityRange;

    if (!myCar.alive) {
        return;
    }
    const myCarPos = myCar.getPosition();

    if (myCarPos.x < (camera.pos.x - 5)) {
        // too far behind, don't draw
        return;
    }

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1 / camera.zoom;

    const wheels = myCar.car.car.wheels;

    for (let i = 0; i < wheels.length; i += 1) {
        const b = wheels[i];
        for (let f = b.GetFixtureList(); f; f = f.m_next) {
            const s = f.GetShape();
            const color = Math.round(255 - (255 * (f.m_density - wheelMinDensity)) / wheelDensityRange).toString();
            const rgbcolor = 'rgb(' + color + ',' + color + ',' + color + ')';
            drawCircle(ctx, b, s.m_p, s.m_radius, b.m_sweep.a, rgbcolor);
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

    for (let f = chassis.GetFixtureList(); f; f = f.m_next) {
        const cs = f.GetShape();
        drawVirtualPoly(ctx, chassis, cs.m_vertices, cs.m_vertexCount);
    }
    ctx.fill();
    ctx.stroke();
}
