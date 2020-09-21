Array.last = function (arr) {
    return arr && arr.length ? arr[arr.length - 1] : null;
}

Array.sum = function (arr) {
    return arr ? arr.reduce(function(sum, next) { return sum + next}, 0) : 0;
}

function exists(item, _throw=false) {
    if (item === null || item === undefined) {
        if (_throw) {
            throw new Error('null value!');
        } else {
            return false;
        }
    }
    return true;
}

function assert(bool, msg, _throw=true) {
    if (!bool) {
        if (_throw) {
            throw new Error(msg);
        } else {
            console.warn(msg);
        }
    }
    return bool;
}

function trace(msg, obj) {
    console.log(msg, obj);
    return obj;
}

function _min(a, b) { return a < b ? a : b; }
function _max(a, b) { return a > b ? a : b; }