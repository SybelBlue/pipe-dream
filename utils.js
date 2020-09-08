Array.last = function (arr) {
    return arr && arr.length ? arr[arr.length - 1] : null;
}

function exists(item, _throw=true) {
    if (item === null || item === undefined) {
        if (_throw) {
            throw new Error('null value!');
        } else {
            return false;
        }
    }
    return true;
}