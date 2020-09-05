const model = {};

function setup() {
    createCanvas(windowWidth, windowHeight);
    model.editor = new Editor(0, 0, windowWidth, windowHeight);
    model.editor.pushMachine(new Machine(color('#EC4E20'), 'machine'));
}

function draw() {
    model.editor.draw();
}

function windowResized() { 
    resizeCanvas(windowWidth, windowHeight);
    model.editor.width = windowWidth;
    model.editor.height = windowHeight;
}

function mouseMoved() { model.editor.checkHighlight(); }
function mouseDragged() { model.editor.checkHighlight(); }
function mouseClicked() { model.editor.pushMachine(new Machine(color('#EC4E20'), 'machine' + model.editor.pipeline.length)) }
