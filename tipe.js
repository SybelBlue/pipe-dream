function exists(item) {
    if (item === null || item === undefined) {
        throw new Error('null value!');
    }
}

class TipeMethod {
    static height = 25;
    static font = 'Courier New';
    static fontSize = 20;

    constructor(name, inTipe, outTipe, compute) {
        this.name = name;
        this.inTipe = inTipe;
        this.outTipe = outTipe;
        this.compute = compute;
    }

    graftOnto(object, _defaults) {
        object[this.name] = (...args) => this.run(object, ...args);
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
    draw() {
        const width = 
            Renderer.textWidth(this.name, TipeProperty.font, TipeProperty.fontSize) 
            + 10 + Tipe.shapeIndent;
        Renderer.newRenderable(Layers.CodeFragment, 
            (regions) => {
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
        Tipe.drawShape(this.outTipe.color);
        Renderer.pop(this);
    }
}

class TipeProperty extends TipeMethod {
    constructor(name, inTipe, outTipe) {
        super(name, inTipe, outTipe, function(self) { return self[name]; });
    }

    graftOnto(object, defaults) {
        object[this.name] = defaults[this.name] || this.outTipe.new();
    }
}

class TipedValue {
    constructor(tipe, defaults={}) {
        this.tipe = tipe;
        if (tipe.basic) {
            this.value = defaults.value;
        }
        for (const methodName in tipe.methods) {
            const method = tipe.methods[methodName];
            method.graftOnto(this, defaults);
        }
    }
}

class Tipe {
    static shapeIndent = 16;
    static get shapeMidline() { return Tipe.shapeIndent / 2; }
    static get shapeHalfWidth() { return Tipe.shapeMidline * 0.8; }
    static shapeHeight = 8;

    static name = 'top';
    static methods = {};
    static get color() { return color('#3cdbd3') };
    static new() { throw new Error('TopTipe cannot be instantiated') }
    // provide middle top
    static draw(tipe) { console.log('draw unimplemented for ' + name); }
    // provide middle top
    static drawShadow() { console.log('drawShadow unimplemented for ' + name); }
    // provide middle top
    static drawShape(color=null) {
        Renderer.newRenderable(Layers.FragmentTab, () => {
            noStroke();
            fill(0)
            this.shapeOutline(0);
            fill(color || Tipe.color);
            this.shapeOutline(-2);
        });
    }

    static shapeOutline(yOffset) {
        triangle(
            -Tipe.shapeHalfWidth,                        yOffset,
             Tipe.shapeHalfWidth,                        yOffset,
                               0, Tipe.shapeHeight - 2 + yOffset
        );
    }

    static Stream(tipe) {
        return class InnerTipe extends Tipe {
            static name = `Stream<${tipe.name}>`
            static innerTipe = tipe;
            static basic = true;
            static isStreamTipe = true;
            static new() { 
                const out = [];
                out.tipe = InnerTipe;
                return out;
            }
        }
    }
}

class BooleanTipe extends Tipe {
    static name = 'Boolean';
    static variableName = 'boolean';
    static basic = true;
    static isBooleanTipe = true;
    static methods = {
        negate: new TipeMethod('negate', BooleanTipe, BooleanTipe, function(self) { return BooleanTipe.new(!self.value); }),
    };
    static new(value=false) { return new TipedValue(BooleanTipe, { value: value }); }
    
    static drawShadow() {
        TextTipe.draw('True/False', Layers.Shadow);
    }

    static draw(bool) {
        TextTipe.draw(bool ? 'True' : 'False');
    }

    static shapeOutline(yOffset) {
        arc(0, yOffset, Tipe.shapeHalfWidth * 2, Tipe.shapeHeight - 2, 0, PI, OPEN);
    }
}

class NumberTipe extends Tipe {
    static name = 'Number';
    static variableName = 'num';
    static basic = true;
    static isNumberTipe = true;
    static methods = {
        absoluteValue: new TipeMethod('absoluteValue', NumberTipe, NumberTipe, function(self) { return NumberTipe.new(abs(self.value)); }),
        plusOne: new TipeMethod('plusOne', NumberTipe, NumberTipe, function(self) { return NumberTipe.new(self.value + 1); }),
        isPositive: new TipeMethod('isPositive', NumberTipe, BooleanTipe, function(self) { return BooleanTipe.new(self.value > 0); }),
    }
    static new(value=0) { return new TipedValue(NumberTipe, { value: value }); }
    static shadowTextWidth = null;
    static shadowText = '#';

    static drawShadow() {
        Renderer.push(this);
        Renderer.translate(0, -textAscent()*0.5);
        NumberTipe.draw(this.shadowText, Layers.Shadow);
        Renderer.pop(this);
    }

    static draw(num, layer=Layers.Data) {
        if (typeof(num) === typeof(0) && num > 9999) {
            num = 'Big#';
        }
        Renderer.newRenderable(layer, () => {
            textSize(45);
            textFont('Georgia');
            if (!NumberTipe.shadowTextWidth) {
                NumberTipe.shadowTextWidth = textWidth(NumberTipe.shadowText);
            }
            fill(30, 30, 30)
            text('' + num, num == NumberTipe.shadowText ? -NumberTipe.shadowTextWidth/2 : -textWidth(num)/2, textAscent() * 0.7);
        });
    }
}

class TextTipe extends Tipe {
    static name = 'Text';
    static variableName = 'text';
    static basic = true;
    static methods = {
        length: new TipeMethod('length', TextTipe, NumberTipe, function(self) { return NumberTipe.new(self.value.length); }),
        firstLetter: new TipeMethod('firstLetter', TextTipe, TextTipe, function(self) { return TextTipe.new(self.value.substring(0, 1)); }),
        firstWord: new TipeMethod('firstWord', TextTipe, TextTipe, function(self) { return TextTipe.new(self.value.split(' ')[0]); }),
    };
    static new(value='') { return new TipedValue(TextTipe, { value: value }); }
    static shadowTextWidth = null;
    static shadowText = 'text';

    static drawShadow() {
        TextTipe.draw(this.shadowText, Layers.Shadow);
    }

    static draw(str, layer=Layers.Data) {
        if (str.length > 10) {
            str = str.substring(0, 7) + '...';
        }
        Renderer.newRenderable(layer, () => {
            textSize(20);
            textFont('Courier New');
            if (!TextTipe.shadowTextWidth) {
                TextTipe.shadowTextWidth = textWidth(TextTipe.shadowText);
            }
            fill(30, 30, 30)
            text('' + str, str == TextTipe.shadowText ? -TextTipe.shadowTextWidth/2 : -textWidth(str)/2, textAscent() * 0.7);
        });
    }
}

// maybe this should be an enumeration
class ColorTipe extends Tipe {
    static name = 'Color';
    static variableName = 'color';
    static methods = {
        green: new TipeProperty('green', ColorTipe, NumberTipe),
        blue: new TipeProperty('blue', ColorTipe, NumberTipe),
        red: new TipeProperty('red', ColorTipe, NumberTipe),
    }
    static new() { return new TipedValue(ColorTipe); }
    static asP5Color(c) { return color(c.red.value, c.green.value, c.blue.value); }

    static drawShadow() {
        ColorTipe.draw({red: 20, green: 20, blue: 200}, Layers.Shadow);
    }

    static draw(color, layer=Layers.Data) {
        Renderer.newRenderable(layer, () => {
            fill(ColorTipe.asP5Color(color));
            stroke(10);
            rect(-Pipe.mainWidth/3, 0, 2 * Pipe.mainWidth/3, Pipe.mainWidth/4);
        })
    }
}

class IDCardTipe extends Tipe {
    static name = 'IDCard';
    static variableName = 'idCard';
    static methods = {
        name: new TipeProperty('name', IDCardTipe, TextTipe),
        age: new TipeProperty('age', IDCardTipe, NumberTipe),
        eyes: new TipeProperty('eyes', IDCardTipe, ColorTipe),
    }
    static new() { return new TipedValue(IDCardTipe); }
}

class BallTipe extends Tipe {
    static name = 'Ball';
    static variableName = 'ball';
    static methods = {
        size: new TipeProperty('size', BallTipe, NumberTipe),
        color: new TipeProperty('color', BallTipe, ColorTipe),
    }
    static new() { return new TipedValue(BallTipe); }

    // expects top center
    static drawShadow() {
        Renderer.newRenderable(Layers.Shadow, function() {
            const radius = Machine.width / 4;
            const deviation = PI * 0.15;
            fill(150);
            arc(0, -radius * sin(deviation), 2 * radius, 2 * radius, deviation, PI - deviation, CHORD);
        });
    }
    
    static draw(ball) {
        Renderer.newRenderable(Layers.Data, () => {
            let color = ball.color;
            stroke(66);
            fill(ColorTipe.asP5Color(color));
            circle(0, ball.radius, ball.radius * 2);
        });
    }
}