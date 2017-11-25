const debugbox = document.getElementById('debug');

function debug(str, clear) {
    if (clear) {
        debugbox.innerHTML = '';
    }
    debugbox.innerHTML += `${str}<br />`;
}

module.exports = debug;
