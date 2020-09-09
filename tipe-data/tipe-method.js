class TipeMethod {
    static height = 25;
    static font = 'Courier New';
    static fontSize = 20;

    get width() {
        return Renderer.textWidth(this.name, TipeProperty.font, TipeProperty.fontSize) + 10 + Tipe.shapeIndent;
    }
    constructor(name, inTipe, outTipe, compute, prewrapped=false) {
        this.name = name;
        this.inTipe = inTipe;
        this.outTipe = outTipe;
        this.compute = prewrapped ? compute : 
            function(tipedValue) { return outTipe.new(compute(tipedValue)); }
    }

    graftOnto(object, _defaults) {
        object[this.name] = (tipedValue) => this.run(object, tipedValue);
        object[this.name].outTipe = this.outTipe;
        object[this.name].inTipe = this.inTipe;
    }
    
    run(tipedValue) {
        if (tipedValue.tipe.name !== this.inTipe.name) {
            throw new Error('mismatched in tipes!', tipedValue, this);
        }
        const out = this.compute(tipedValue);
        if (out.tipe.name !== this.outTipe.name) {
            throw new Error('mismatched out tipes!', out, this);
        }
        return out;
    }

    // expects upper left corner is baseline
    draw(onClick) {
        const width = this.width;
            
        Renderer.newRenderable(Layers.CodeFragment, 
            (regions) => {
                if (clickThisFrame && regions.fragment.hovering && onClick) onClick();

                stroke(regions.fragment.hovering ? 255 : 0, 0, 0);
                fill(this.outTipe.color);
                textFont(TipeMethod.font);
                textSize(TipeMethod.fontSize);
                rect(0, 0, width, TipeMethod.height, 0, 10, 10, 0);
                fill(0);
                text(this.name, Tipe.shapeIndent + 5, textAscent());
            },
            Renderer.regionStub('fragment', 0, 0, width, TipeMethod.height)
        );

        Renderer.push(this);
        Renderer.translate(Tipe.shapeMidline, TipeMethod.height);
        this.outTipe.drawShape(this.outTipe.color);
        Renderer.pop(this);
    }
}

class TipeProperty extends TipeMethod {
    constructor(name, inTipe, outTipe) {
        super(name, inTipe, outTipe, function(self) { return self[name]; }, true);
    }

    graftOnto(object, defaults) {
        object[this.name] = defaults[this.name] || this.outTipe.new();
    }
}

class TipeUserMethod extends TipeMethod {
    static gap = 5;
    get height() {
        return super.height + 8;
    }
    get width() {
        return this.inputBox.width + TipeUserMethod.gap + super.width;
    }

    constructor(name, inTipe, outTipe, textBox, compute) {
        super(name, inTipe, outTipe, compute);
        this.inputBox = textBox;
    }

    draw() {
        super.draw();
        Renderer.push(this);
        Renderer.translate(super.width + TipeUserMethod.gap, 0);
        this.inputBox.draw();
        Renderer.pop(this);
    }
}
