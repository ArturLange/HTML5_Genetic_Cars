module.exports.svg = function svg(container, frame) {
    return `
    <svg viewBox="${[
        (Math.round(frame.pos.x * 10) / 10) - 2,
        (Math.round(frame.pos.y * 10) / 10) - 2,
        (Math.round(frame.pos.x * 10) / 10) + 2,
        (Math.round(frame.pos.y * 10) / 10) + 2,
    ]} ">
      ${renderWheels(frame.wheels)}
      ${renderChassis(frame.chassis)}
    </svg>
  `;

    function renderWheels(wheels) {
        return wheels.map(wheelList => wheelList.map((wheel) => {
            const fillStyle = '#eee';
            const strokeStyle = '#aaa';
            const center = wheel.pos;
            const radius = wheel.rad;
            const angle = wheel.ang;
            return `
          <circle
            cx="${center.x}"
            cy="${center.y}"
            r="${radius}"
            stroke="${strokeStyle}"
            stroke-width="1"
            fill="${fillStyle}"
          />
          <line
            x1="${center.x}"
            y1="${center.y}"
            x2="${center.x + radius * Math.cos(angle)}"
            y2="${center.y + radius * Math.sin(angle)}"
            stroke="${strokeStyle}"
            stroke-width="2"
          />
        `;
        }).join('\n')).join('\n');
    }

    function renderChassis(chassis) {
        const strokeStyle = '#aaa';
        const fillStyle = '#eee';

        return chassis.map(polyList => `
        <polygon
          points="${
            polyList.vtx.map(pos => `${pos.x},${pos.y}`).join(' ')
            }"
          stroke-width="1"
          stroke="${strokeStyle}"
          fill="${fillStyle}"
          style="fill:lime;stroke:purple;stroke-width:1"
        />
      `).join('\n');
    }
};

module.exports = function (ctx, zoom, frame) {
    // wheel style
    ctx.fillStyle = '#eee';
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1 / zoom;

    for (let i = 0; i < frame.wheels.length; i++) {
        for (const w in frame.wheels[i]) {
            ghostDrawCircle(ctx, frame.wheels[i][w].pos, frame.wheels[i][w].rad, frame.wheels[i][w].ang);
        }
    }

    // chassis style
    ctx.strokeStyle = '#aaa';
    ctx.fillStyle = '#eee';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (const c in frame.chassis) {
        ghostDrawPoly(ctx, frame.chassis[c].vtx, frame.chassis[c].num);
    }
    ctx.fill();
    ctx.stroke();
};


function ghostDrawPoly(ctx, vtx, nVtx) {
    ctx.moveTo(vtx[0].x, vtx[0].y);
    for (let i = 1; i < nVtx; i++) {
        ctx.lineTo(vtx[i].x, vtx[i].y);
    }
    ctx.lineTo(vtx[0].x, vtx[0].y);
}

function ghostDrawCircle(ctx, center, radius, angle) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);

    ctx.moveTo(center.x, center.y);
    ctx.lineTo(
        center.x + (radius * Math.cos(angle)),
        center.y + (radius * Math.sin(angle))
    );

    ctx.fill();
    ctx.stroke();
}
