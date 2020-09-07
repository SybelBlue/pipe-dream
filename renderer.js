const Layers = {
    Background: 0,
    Pipe: 3,
    Shadow: 6,
    Data: 7,
    Machine: 10,
    CodeFragment: 13,
}

class Renderer {
    static Node = class {
        constructor(previous, source) {
            this.previous = previous;
            this.source = source;
            this.x = previous ? previous.x : 0;
            this.y = previous ? previous.y : 0;
        }
    }

    static Region = class {
        constructor(layer, x, y, width, height, blocking) {
            this.layer = layer;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.blocking = blocking;
            this.hovering = false;
        }
    
        test(x, y) {
            return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
        }
    }
    static translationStack = null;
    static stackTop = null;
    static toRender = [];
    static regions = [];

    static clearStack() { 
        Renderer.translationStack = [(Renderer.stackTop = new Renderer.Node(null, 'Renderer Head'))];
    }

    static initialize = Renderer.clearStack;

    static get yTranslation() { return Renderer.stackTop.y; }

    static get xTranslation() { return Renderer.stackTop.x; }

    static textWidth(text, font, size) {
        push();
        textFont(font);
        textSize(size);
        const width = textWidth(text);
        pop();
        return width;
    }

    static translate(x, y) {
        Renderer.stackTop.x += x;
        Renderer.stackTop.y += y;
    }

    static push(source) {
        if (source == null) throw new Error('null source!');

        const node = new Renderer.Node(Renderer.stackTop, source);
        Renderer.translationStack.push(node);
        Renderer.stackTop = node;
    }
    
    static pop(source) {
        if (source !== Renderer.stackTop.source) throw new Error('Unexpected Pop from ' + source);

        Renderer.stackTop = Renderer.translationStack.pop().previous;
    }

    static regionStub(name, x, y, width, height, blocking=true) {
        return {
            name: name,
            x: x,
            y: y,
            width: width,
            height: height,
            blocking: blocking
        };
    }
    
    static newRenderable(layer, drawCallback, ...regionStubs) {
        const regions = {};

        regionStubs.forEach((stub) => { 
            const region = new Renderer.Region(
                layer, 
                Renderer.xTranslation + stub.x, 
                Renderer.yTranslation + stub.y, 
                stub.width, 
                stub.height, 
                stub.blocking
            );
            Renderer.registerRegion(region);
            regions[stub.name] = region;
        });

        const renderable = {
            draw: drawCallback,
            layer: layer,
            translation: [Renderer.xTranslation, Renderer.yTranslation],
            regions: regions,
        };

        let i = 0;
        while (i < Renderer.toRender.length && Renderer.toRender[i].layer <= layer) {
            i++;
        }

        Renderer.toRender.splice(i, 0, renderable);
    }

    static registerRegion(region) {
        let i = 0;
        while (i < Renderer.regions.length && Renderer.regions[i].layer > region.layer) {
            i++;
        }
        
        Renderer.regions.splice(i, 0, region);
    }

    static recomputeRegions() {
        return Renderer.regions.reduce(function(results, region) {
            region.hovering = !results.found && region.test(mouseX, mouseY);
            results.intercepted = results.intercepted || region.hovering;
            results.found = results.found || (region.hovering && region.blocking);
            return results;
        }, { found: false, intercepted: true });
    }

    static renderAll() {
        Renderer.recomputeRegions();
        for (const renderable of Renderer.toRender) {
            push();
            translate(renderable.translation[0], renderable.translation[1]);
            renderable.draw(renderable.regions);
            pop();
        }
        Renderer.toRender = [];
        Renderer.regions = [];
    }
}