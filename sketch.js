let requestRescaleCanvas = false;
let clickThisFrame = false;
let dimensions = null;

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

function setup() {
    createCanvas(windowWidth, windowHeight);
    dimensions = { width: windowWidth, height: windowHeight };

    SceneManager.unsafeMode = config.unsafe;
    SceneManager.startLevel(levels[config.level], config.prompt);

    if (!SceneManager.unsafeMode) {
        try {
            SceneManager.loadFromCache();
        } catch {
            alert('Something went wrong loading stored session data, clearing.')
            SceneManager.clear();
        }
    }
}

function draw() {
    if (requestRescaleCanvas) {
        resizeCanvas(SceneManager.editor.width, SceneManager.minHeight);
        SceneManager.editor.height = SceneManager.minHeight;
        dimensions.height = SceneManager.editor.height;
    }

    SceneManager.draw();

    clickThisFrame = false;
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight);
    SceneManager.editor.width = windowWidth;
    SceneManager.editor.height = max(SceneManager.minHeight, windowHeight);
    dimensions = { width: windowWidth, height: SceneManager.editor.height };
}

function mouseClicked() { clickThisFrame = true; }