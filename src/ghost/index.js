
const ghostGetFrame = require('./car-to-ghost.js');

const enableGhost = true;

function ghostCreateReplay() {
    if (!enableGhost) { return null; }

    return {
        num_frames: 0,
        frames: [],
    };
}

function ghostCreateGhost() {
    if (!enableGhost) { return null; }

    return {
        replay: null,
        frame: 0,
        dist: -100,
    };
}

function ghostResetGhost(ghost) {
    if (!enableGhost) { return; }
    if (ghost === null) { return; }
    ghost.frame = 0;
}

function ghostPause(ghost) {
    if (ghost !== null) { ghost.old_frame = ghost.frame; }
    ghostResetGhost(ghost);
}

function ghostResume(ghost) {
    if (ghost !== null) { ghost.frame = ghost.old_frame; }
}

function ghostGetPosition(ghost) {
    if (!enableGhost) { return; }
    if (ghost === null) { return; }
    if (ghost.frame < 0) { return; }
    if (ghost.replay === null) { return; }
    const frame = ghost.replay.frames[ghost.frame];
    return frame.pos;
}

function ghostCompareToReplay(replay, ghost, max) {
    if (!enableGhost) { return; }
    if (ghost === null) { return; }
    if (replay === null) { return; }

    if (ghost.dist < max) {
        ghost.replay = replay;
        ghost.dist = max;
        ghost.frame = 0;
    }
}

function ghostMoveFrame(ghost) {
    if (!enableGhost) { return; }
    if (ghost === null) { return; }
    if (ghost.replay === null) { return; }
    ghost.frame++;
    if (ghost.frame >= ghost.replay.num_frames) { ghost.frame = ghost.replay.num_frames - 1; }
}

function ghostAddReplayFrame(replay, car) {
    if (!enableGhost) { return; }
    if (replay === null) { return; }

    const frame = ghostGetFrame(car);
    replay.frames.push(frame);
    replay.num_frames++;
}

function ghostDrawPoly(ctx, vtx, nVtx) {
    ctx.moveTo(vtx[0].x, vtx[0].y);
    for (let i = 1; i < nVtx; i++) {
        ctx.lineTo(vtx[i].x, vtx[i].y);
    }
    ctx.lineTo(vtx[0].x, vtx[0].y);
}

function ghostDrawFrame(ctx, ghost, camera) {
    const zoom = camera.zoom;
    if (!enableGhost) { return; }
    if (ghost === null) { return; }
    if (ghost.frame < 0) { return; }
    if (ghost.replay === null) { return; }

    const frame = ghost.replay.frames[ghost.frame];

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
}

function ghostDrawCircle(ctx, center, radius, angle) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);

    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + (radius * Math.cos(angle)), center.y + (radius * Math.sin(angle)));

    ctx.fill();
    ctx.stroke();
}

module.exports = {
    ghostCreateReplay,
    ghostCreateGhost,
    ghostPause,
    ghostResume,
    ghostGetPosition,
    ghostCompareToReplay,
    ghostMoveFrame,
    ghostAddReplayFrame,
    ghostDrawFrame,
    ghostResetGhost,
};
