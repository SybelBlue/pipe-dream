const Layers = {
    Background: 0,
    TrayBackground: 1,
    Pipe: 3,
    Shadow: 6,
    Data: 7,
    Machine: 10,
    CodeFragment: 13,
    FragmentShape: 14,
    UI: 16,
    Debug: 99,
}

class Renderer {
    static Node = class {
        static get Head() { return new Renderer.Node(0, null, 'Renderer Head'); }
        constructor(key, previous, source) {
            this.key = key;
            this.previous = previous;
            this.source = source;
            this.x = previous ? previous.x : 0;
            this.y = previous ? previous.y : 0;
        }
    }

    static Region = class {
        hovering = false;
        clicked = false;

        constructor(layer, x, y, width, height, blocking) {
            exists(this.layer = layer);
            exists(this.x = x);
            exists(this.y = y);
            exists(this.width = width);
            exists(this.height = height);
            exists(this.blocking = blocking);
        }

        test(x, y) {
            return this.x <= x && x <= this.x + this.width && this.y <= y && y <= this.y + this.height;
        }
    }

    static Renderable = class {
        constructor(layer, draw, translation, regions) {
            this.layer = layer;
            this.draw = draw;
            this.translation = translation;
            this.regions = regions;
        }

        static from(layer, drawCallback, regionStubs) {
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

            return new this(layer, drawCallback, [Renderer.xTranslation, Renderer.yTranslation], regions);
        }
    }

    static _keyCount = 1;
    static stackTop = Renderer.Node.Head;
    static toRender = [];
    static regions = [];

    static keyListeners = [];

    static clearStack() { Renderer.stackTop = Renderer.Node.Head; }

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

    static textHeight(font, size) {
        push();
        textFont(font);
        textSize(size);
        const height = textAscent();
        pop();
        return height;
    }

    static translate(x, y) {
        Renderer.stackTop.x += x;
        Renderer.stackTop.y += y;
    }

    static push(source) {
        if (source == null) throw new Error('null source!');

        const key = Renderer._keyCount++;

        Renderer.stackTop = new Renderer.Node(key, Renderer.stackTop, source);

        // return function () { Renderer.pop(key); } // make pop take key?
    }

    static pop(source) {
        if (source !== Renderer.stackTop.source || Renderer.stackTop.key == 0) {
            throw new Error('Unexpected Pop from ' + source);
        }

        Renderer.stackTop = Renderer.stackTop.previous;
    }

    static temporary(source, xTranslation, yTranslation, callback) {
        Renderer.push(source);
        Renderer.translate(xTranslation, yTranslation);
        callback();
        Renderer.pop(source);
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
        let i = 0;
        while (i < Renderer.toRender.length && Renderer.toRender[i].layer <= layer) {
            i++;
        }

        Renderer.toRender.splice(i, 0, Renderer.Renderable.from(layer, drawCallback, regionStubs));
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

            region.clicked = region.hovering && clickThisFrame;
            results.intercepted = results.intercepted || region.hovering;

            results.found = results.found || (region.hovering && region.blocking);

            return results;
        }, { found: false, intercepted: true });
    }

    static renderAll() {
        const hit = Renderer.recomputeRegions();

        for (const renderable of Renderer.toRender) {
            push();
            translate(renderable.translation[0], renderable.translation[1]);
            renderable.draw(renderable.regions);
            pop();
        }
        Renderer.toRender = [];
        Renderer.regions = [];

        Renderer.stackTop = Renderer.Node.Head;
        Renderer._keyCount = 1;

        return hit;
    }
}