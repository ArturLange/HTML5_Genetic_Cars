import { ghostGetFrame } from './car-to-ghost';

const enableGhost = true;

export function ghost_create_replay() {
    if (!enableGhost) {
        return null;
    }

    return {
        num_frames: 0,
        frames: [],
    };
}

export function ghost_create_ghost() {
    if (!enableGhost) {
        return null;
    }

    return {
        replay: null,
        frame: 0,
        dist: -100,
    };
}

export function ghost_reset_ghost(ghost) {
    if (!enableGhost) {
        return;
    }
    if (ghost == null) {
        return;
    }
    ghost.frame = 0;
}

export function ghost_pause(ghost) {
    if (ghost != null) {
        ghost.old_frame = ghost.frame;
    }
    ghost_reset_ghost(ghost);
}

export function ghost_resume(ghost) {
    if (ghost != null) {
        ghost.frame = ghost.old_frame;
    }
}

export function ghost_get_position(ghost) {
    if (!enableGhost) {
        return;
    }
    if (ghost == null) {
        return;
    }
    if (ghost.frame < 0) {
        return;
    }
    if (ghost.replay == null) {
        return;
    }
    var frame = ghost.replay.frames[ghost.frame];
    return frame.pos;
}

export function ghost_compare_to_replay(replay, ghost, max) {
    if (!enableGhost) {
        return;
    }
    if (ghost == null) {
        return;
    }
    if (replay == null) {
        return;
    }

    if (ghost.dist < max) {
        ghost.replay = replay;
        ghost.dist = max;
        ghost.frame = 0;
    }
}

export function ghost_move_frame(ghost) {
    if (!enableGhost) {
        return;
    }
    if (ghost == null) {
        return;
    }
    if (ghost.replay == null) {
        return;
    }
    ghost.frame++;
    if (ghost.frame >= ghost.replay.num_frames) {
        ghost.frame = ghost.replay.num_frames - 1;
    }
}

export function ghost_add_replay_frame(replay, car) {
    if (!enableGhost) {
        return;
    }
    if (replay == null) {
        return;
    }

    var frame = ghostGetFrame(car);
    replay.frames.push(frame);
    replay.num_frames++;
}

export function ghost_draw_frame(ctx, ghost, camera) {
    const zoom = camera.zoom;
    if (!enableGhost) {
        return;
    }
    if (ghost == null) {
        return;
    }
    if (ghost.frame < 0) {
        return;
    }
    if (ghost.replay == null) {
        return;
    }

    const frame = ghost.replay.frames[ghost.frame];

    // wheel style
    ctx.fillStyle = '#eee';
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1 / zoom;

    for (let i = 0; i < frame.wheels.length; i += 1) {
        for (const w in frame.wheels[i]) {
            ghost_draw_circle(
                ctx,
                frame.wheels[i][w].pos,
                frame.wheels[i][w].rad,
                frame.wheels[i][w].ang,
            );
        }
    }

    // chassis style
    ctx.strokeStyle = '#aaa';
    ctx.fillStyle = '#eee';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (const c in frame.chassis) {
        ghost_draw_poly(ctx, frame.chassis[c].vtx, frame.chassis[c].num);
    }
    ctx.fill();
    ctx.stroke();
}

function ghost_draw_poly(ctx, vtx, nVtx) {
    ctx.moveTo(vtx[0].x, vtx[0].y);
    for (let i = 1; i < nVtx; i += 1) {
        ctx.lineTo(vtx[i].x, vtx[i].y);
    }
    ctx.lineTo(vtx[0].x, vtx[0].y);
}

function ghost_draw_circle(ctx, center, radius, angle) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, true);

    ctx.moveTo(center.x, center.y);
    ctx.lineTo(center.x + radius * Math.cos(angle), center.y + radius * Math.sin(angle));

    ctx.fill();
    ctx.stroke();
}
