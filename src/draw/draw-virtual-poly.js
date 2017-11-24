

module.exports = function (ctx, body, vtx, n_vtx) {
    // set strokestyle and fillstyle before call
    // call beginPath before call

    const p0 = body.GetWorldPoint(vtx[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < n_vtx; i++) {
        const p = body.GetWorldPoint(vtx[i]);
        ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(p0.x, p0.y);
};
