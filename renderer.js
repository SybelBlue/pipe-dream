class TranslationNode {
    constructor(previous, source, previousX, previousY) {
        this.previous = previous;
        this.source = source;
        this.x = previousX;
        this.y = previousY;
    }
}

class Renderable {
    constructor(drawCallback, layer, x, y) {
        this.draw = drawCallback;
        this.layer = layer;
        this.translation = [x, y];
    }
}

const Layers = {
    Background: 0,
    Pipe: 3,
    Shadow: 6,
    Data: 7,
    Machine: 10,
}

class Renderer {
    static translationStack = null;
    static stackTop = null;
    static toRender = [];
    
    static initialize() { this.clearStack(); }
    static clearStack() { 
        Renderer.translationStack = [(Renderer.stackTop = new TranslationNode(null, 'Renderer Head', 0, 0))];
    }

    static translate(x, y) {
        this.stackTop.x += x;
        this.stackTop.y += y;
    }

    static push(source) {
        if (source == null) throw new Error('null source!');

        const node = new TranslationNode(this.stackTop, source, this.stackTop.x, this.stackTop.y);
        Renderer.translationStack.push(node);
        Renderer.stackTop = node;
    }
    
    static pop(source) {
        if (source !== this.stackTop.source) throw new Error('Unexpected Pop from ' + source);

        Renderer.stackTop = Renderer.translationStack.pop().previous;
    }
    
    static renderObject(layer, drawCallback) {
        const renderable = new Renderable(drawCallback, layer, this.stackTop.x, this.stackTop.y);
        for (let i = 0; i < this.toRender.length; i++) {
            const element = this.toRender[i];
            if (element.layer > layer) {
                this.toRender.splice(i, 0, renderable);
                return;
            }
        }
        this.toRender.push(renderable);
    }
    
    static renderAll() {
        for (const renderable of this.toRender) {
            push();
            translate(renderable.translation[0], renderable.translation[1]);
            renderable.draw();
            pop();
        }
        this.toRender = [];
    }
}