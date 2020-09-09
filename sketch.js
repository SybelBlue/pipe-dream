let editor;
let requestRescaleCanvas = false;
let clickThisFrame = false;

let textbox;

// pallete ideas: 
// orange-yellow-green-dark blue-light blue
// https://coolors.co/ff8360-e8e288-7dce82-3cdbd3-00fff5

function setup() {
    createCanvas(windowWidth, windowHeight);
    editor = new Editor(NumberTipe, NumberTipe, 0, 0, windowWidth, windowHeight);
    editor.pushMachine(MapMachine);
    Renderer.initialize();
    textbox = new NumberBox({ defaultText: 'float' });
}

function draw() {
    if (requestRescaleCanvas) {
        resizeCanvas(editor.x + editor.width, editor.y + editor.minHeight);
        editor.height = editor.minHeight;
    }

    editor.draw();

    textbox.draw(Layers.Debug);

    const focused = Renderer.renderAll().found;

    if (!focused && clickThisFrame) {
        editor.tray.loadMachineOptions();
    }
    Renderer.clearStack();

    clickThisFrame = false;
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight);
    editor.width = windowWidth;
    editor.height = max(editor.minHeight, windowHeight);
}

function mouseClicked() { clickThisFrame = true; }

function keyTyped() { 
    if (/[\S ]+/.test(key)) {
        TextBox.keyListeners.forEach(l => l.keyDown(key)); 
    }
}
function keyPressed() { 
    switch (keyCode) {
        case BACKSPACE:
            TextBox.keyListeners.forEach(l => l.backspaceDown()); 
            break;
        case ESCAPE:
            TextBox.keyListeners.forEach(l => l.reject());
            break;
        case ENTER:
        case RETURN:
            TextBox.keyListeners.forEach(l => l.accept());
            break;
    }
}