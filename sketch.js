const model = {};

function setup() {
    createCanvas(windowWidth, windowHeight);
    model.editor = new Editor(NumberTipe, 0, 0, windowWidth, windowHeight);
    model.editor.pushMachine(new Machine(color('#EC4E20'), 'machine'));
    Renderer.initialize();
}

function draw() {
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
function mouseClicked() { model.editor.pushMachine(new Machine(color('#EC4E20'), 'machine' + model.editor.pipeline.length)) }
