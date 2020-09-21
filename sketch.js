let editor;
let requestRescaleCanvas = false;
let clickThisFrame = false;

// pallete ideas: 
// orange-yellow-green-dark blue-light blue
// https://coolors.co/ff8360-e8e288-7dce82-3cdbd3-00fff5
// 0B4F6C

function setup() {
    createCanvas(windowWidth, windowHeight);
    editor = SceneManager.startLevel(levels[4]);
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

function keyTyped() { 
    if (/[\S ]+/.test(key)) {
        InputBox.keyListeners.forEach(l => l.keyDown(key)); 
    }
}

function keyPressed() { 
    switch (keyCode) {
        case BACKSPACE:
            InputBox.keyListeners.forEach(l => l.backspaceDown()); 
            break;
        case ESCAPE:
            InputBox.keyListeners.forEach(l => l.reject());
            break;
        case ENTER:
        case RETURN:
            InputBox.keyListeners.forEach(l => l.accept());
            break;
    }
}