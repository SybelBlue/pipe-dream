const model = {};
let requestRescaleCanvas = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    model.editor = new Editor(NumberTipe, NumberTipe, 0, 0, windowWidth, windowHeight);
    model.editor.pushMachine(MapMachine);
    Renderer.initialize();
}

function draw() {
    if (requestRescaleCanvas) {
        resizeCanvas(model.editor.x + model.editor.width, model.editor.y + model.editor.minHeight);
        model.editor.height = model.editor.minHeight;
    }

    model.editor.draw();

    Renderer.renderAll();
    Renderer.clearStack();
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight);
    model.editor.width = windowWidth;
    model.editor.height = windowHeight;
}

function mouseMoved() { model.editor.checkHighlight(); }
function mouseDragged() { model.editor.checkHighlight(); }
function mouseClicked() { model.editor.pushMachine(Machine, color('#EC4E20'), 'machine' + model.editor.pipeline.length) }
