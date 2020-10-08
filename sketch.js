let editor;
let requestRescaleCanvas = false;
let clickThisFrame = false;

const config = (function() {
    const urlParams = new URLSearchParams(window.location.search);
    const c  = {
        level: urlParams.get('l') || 1,
        prompt: !urlParams.get('p') || true,
        unsafe: Boolean(urlParams.get('u')),
    };
    c.level = _min(_max(0, Number.parseInt(c.level)), levels.length - 1);
    c.prompt = !!c.prompt;
    return c;
})();

// pallete ideas: 
// orange-yellow-green-dark blue-light blue
// https://coolors.co/ff8360-e8e288-7dce82-3cdbd3-00fff5
// 0B4F6C

function setup() {
    createCanvas(windowWidth, windowHeight);

    SceneManager.unsafeMode = config.unsafe;
    editor = SceneManager.startLevel(levels[config.level], config.prompt);
}

function draw() {
    if (requestRescaleCanvas) {
        resizeCanvas(editor.width, SceneManager.minHeight);
        editor.height = SceneManager.minHeight;
    }

    SceneManager.draw();

    clickThisFrame = false;
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight);
    editor.width = windowWidth;
    editor.height = max(SceneManager.minHeight, windowHeight);
}

function mouseClicked() { clickThisFrame = true; }