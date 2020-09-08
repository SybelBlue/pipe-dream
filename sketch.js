let editor;
let requestRescaleCanvas = false;
let clickThisFrame = false;

// pallete ideas: 
// orange-yellow-green-dark blue-light blue
// https://coolors.co/ff8360-e8e288-7dce82-3cdbd3-00fff5

function setup() {
    createCanvas(windowWidth, windowHeight);
    editor = new Editor(NumberTipe, NumberTipe, 0, 0, windowWidth, windowHeight);
    editor.pushMachine(MapMachine);
    Renderer.initialize();
}

function draw() {
    if (requestRescaleCanvas) {
        resizeCanvas(editor.x + editor.width, editor.y + editor.minHeight);
        editor.height = editor.minHeight;
    }

    editor.draw();

    Renderer.renderAll();
    Renderer.clearStack();

    clickThisFrame = false;
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight);
    editor.width = windowWidth;
    editor.height = max(editor.minHeight, windowHeight);
}

function mouseMoved() { editor.checkHighlight(); }
function mouseDragged() { editor.checkHighlight(); }
function mouseClicked() { clickThisFrame = true; }
