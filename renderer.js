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
};

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
        clone() {
            return new Renderer.Node(this.key, this.previous, this.source);
        }
    }

    static Region = class {
        hovering = false;
        clicked = false;

        constructor(layer, x, y, width, height, blocking) {
            exists(this.layer = layer, true);
            exists(this.x = x, true);
            exists(this.y = y, true);
            exists(this.width = width, true);
            exists(this.height = height, true);
            exists(this.blocking = blocking, true);
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

    // must be monospaced!
    static defaultFont = 'Courier New';

    static _keyCount = 1;
    static stackTop = Renderer.Node.Head.clone();
    static toRender = [];
    static regions = [];

    static keyListeners = [];

    static clearStack() { 
        if (Renderer.stackTop.key !== Renderer.Node.Head.key) {
            console.warn('cleared while non-empty render stack');
            Renderer.stackTop = Renderer.Node.Head.clone();
        }
    }

    static get yTranslation() { return Renderer.stackTop.y; }

    static get xTranslation() { return Renderer.stackTop.x; }

    static textBoundMemoized = {};

    // assumes monospaced font!
    static textWidth(text, size, font=this.defaultFont) {
        const key = `w_${font}_${text.length}_${size}`;
        if (!exists(this.textBoundMemoized[key])) {
            push();
            textFont(font);
            textSize(size);
            this.textBoundMemoized[key] = textWidth(text);
            pop();
        }
        return this.textBoundMemoized[key];
    }

    static textHeight(size, font=this.defaultFont) {
        const key = `h_${font}_${size}`;
        if (!exists(this.textBoundMemoized[key])) {
            push();
            textFont(font);
            textSize(size);
            this.textBoundMemoized[key] = textAscent();
            pop();
        }
        return this.textBoundMemoized[key];
    }

    // assumes monospaced font!
    static textToLines(rawText, textSize, maxWidth, font=this.defaultFont) {
        const charsInLine = floor(maxWidth / Renderer.textWidth(' ', textSize, font));
        if (charsInLine <= 1) return null;

        return rawText.split('\n').map(line => line.split(/\s/)).reduce((output, line) => {
            let current = '';
            let i = 0;
            while (i < line.length) {
                const word = line[i];
                if (word.length > charsInLine) {
                    if (current.length > 0) {
                        output.push(current);
                        current = '';
                    }

                    output.push(word.substring(0, charsInLine - 1) + '-');
                    line[i] = word.substring(charsInLine - 1);
                    continue;
                }

                if (current.length + word.length > charsInLine) {
                    output.push(current);
                    current = '';
                    continue;
                }

                current += (current.length > 0 ? ' ' : '') + word;
                i++;
            }
            output.push(current);
            return output;
        }, []);
    }

    static translate(x, y) {
        if (typeof(x) !== typeof(0) || Number.isNaN(x)) throw new Error('Renderer.translate was expecting a numeric first argument');
        if (typeof(y) !== typeof(0) || Number.isNaN(y)) throw new Error('Renderer.translate was expecting a numeric second argument');
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

    static newUIButton(txt, textColor, onClick, margin=10, fontSize=24) {
        const tHeight = Renderer.textHeight(fontSize);
        const height = tHeight + 2 * margin;
        const width = Renderer.textWidth(txt, fontSize) + 2 * margin;
        Renderer.newRenderable(Layers.UI, (regions) => {
            fill(10);
            stroke(regions.button.hovering ? 200 : 0);
            rect(0, 0, width, height, margin/2);

            noStroke();
            fill(textColor);
            textSize(fontSize);
            text(txt, margin, margin + tHeight * 0.8);
            if (regions.button.clicked) onClick();
        }, Renderer.regionStub('button', 0, 0, width, height));
        return { width: width, height: height };
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

        push();
        textFont(this.defaultFont);
        for (const renderable of Renderer.toRender) {
            push();
            translate(renderable.translation[0], renderable.translation[1]);
            renderable.draw(renderable.regions);
            pop();
        }
        pop();
        Renderer.toRender = [];
        Renderer.regions = [];

        Renderer.stackTop = Renderer.Node.Head;
        Renderer._keyCount = 1;

        return hit;
    }
}