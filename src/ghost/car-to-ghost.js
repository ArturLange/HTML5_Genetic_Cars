function ghostGetChassis(c) {
    const gc = [];

    for (let f = c.GetFixtureList(); f; f = f.m_next) {
        const s = f.GetShape();

        const p = {
            vtx: [],
            num: 0,
        };

        p.num = s.m_vertexCount;

        for (let i = 0; i < s.m_vertexCount; i++) {
            p.vtx.push(c.GetWorldPoint(s.m_vertices[i]));
        }

        gc.push(p);
    }

    return gc;
}

function ghostGetWheel(w) {
    const gw = [];

    for (let f = w.GetFixtureList(); f; f = f.m_next) {
        const s = f.GetShape();

        const c = {
            pos: w.GetWorldPoint(s.m_p),
            rad: s.m_radius,
            ang: w.m_sweep.a,
        };

        gw.push(c);
    }

    return gw;
}


module.exports = function (car) {
    const out = {
        chassis: ghostGetChassis(car.chassis),
        wheels: [],
        pos: { x: car.chassis.GetPosition().x, y: car.chassis.GetPosition().y },
    };

    for (let i = 0; i < car.wheels.length; i++) {
        out.wheels[i] = ghostGetWheel(car.wheels[i]);
    }

    return out;
};
