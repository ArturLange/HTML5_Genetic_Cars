function ghostGetChassis(chassis) {
    const ghostChassis = [];

    for (let f = chassis.GetFixtureList(); f; f = f.m_next) {
        const shape = f.GetShape();

        const p = {
            vtx: [],
            num: 0,
        };

        p.num = shape.m_vertexCount;

        for (let i = 0; i < shape.m_vertexCount; i++) {
            p.vtx.push(chassis.GetWorldPoint(shape.m_vertices[i]));
        }

        ghostChassis.push(p);
    }

    return ghostChassis;
}

function ghostGetWheel(wheel) {
    const ghostWheels = [];

    for (let f = wheel.GetFixtureList(); f; f = f.m_next) {
        const shape = f.GetShape();

        const c = {
            pos: wheel.GetWorldPoint(shape.m_p),
            rad: shape.m_radius,
            ang: wheel.m_sweep.a,
        };

        ghostWheels.push(c);
    }

    return ghostWheels;
}


module.exports = function (car) {
    const out = {
        chassis: ghostGetChassis(car.chassis),
        wheels: [],
        pos: {
            x: car.chassis.GetPosition().x,
            y: car.chassis.GetPosition().y
        },
    };

    for (let i = 0; i < car.wheels.length; i++) {
        out.wheels[i] = ghostGetWheel(car.wheels[i]);
    }

    return out;
};
