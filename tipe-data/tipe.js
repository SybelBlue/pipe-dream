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
    static draw(tipe) { console.log('draw unimplemented for ' + this.name); }
    // provide middle top
    static drawShadow() { console.log('drawShadow unimplemented for ' + this.name); }
    // provide middle top
    static drawShape(color=null) {
        Renderer.newRenderable(Layers.FragmentShape, () => {
            noStroke();
            fill(0)
            this.shapeOutline(0);
            fill(color || this.color);
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
            static name = `Stream(${tipe.name})`
            static innerTipe = tipe;
            static basic = true;
            static isStreamTipe = true;
            static new(...values) { return new TipedValue(InnerTipe, { value: values }); }
        }
    }

    static Function(inTipe, outTipe, inputBoxConstructor, startingValue) {
        return class InnerTipe extends Tipe {
            static name = `Function(${inTipe.name}) -> ${outTipe.name}`;
            static inTipe = inTipe;
            static outTipe = outTipe;
            static isFunctionTipe = true;
            static get methods() {
                const box = new inputBoxConstructor({ defaultText: startingValue });
                return { 
                    getInput: new UIMethod(
                        'getInput', 
                        InnerTipe, 
                        outTipe, 
                        box, 
                        self => self.value(box.value)
                    )
                }
            };
            static basic = true;
            static new(func) { return new TipedValue(InnerTipe, { value: func })}
            
            static drawShadow() {
                TextTipe.draw(`${inTipe.variableName}→${outTipe.variableName}`, Layers.Shadow);
            }
            static draw = InnerTipe.drawShadow;
        }
    }
}

class BooleanTipe extends Tipe {
    static name = 'Boolean';
    static variableName = 'bool';
    static basic = true;
    static isBooleanTipe = true;
    static methods = {
        negate: new TipeMethod('negate', BooleanTipe, BooleanTipe, self => !self.value),
    };

    static new(value=false) { return new TipedValue(BooleanTipe, { value: value }); }
    
    static drawShadow() {
        TextTipe.draw('True/False', Layers.Shadow);
    }

    static draw(bool) {
        TextTipe.draw(bool ? 'True' : 'False');
    }

    static shapeOutline(yOffset) {
        const halfWidth = Tipe.shapeHalfWidth * 0.8 + yOffset/2;
        rect(-halfWidth, yOffset, halfWidth * 2, Tipe.shapeHeight * 0.8);
    }
}

class NumberTipe extends Tipe {
    static name = 'Number';
    static variableName = 'num';
    static basic = true;
    static isNumberTipe = true;
    static methods = {
        absoluteValue: new TipeMethod('absoluteValue', NumberTipe, NumberTipe, self => abs(self.value)),
        plusOne: new TipeMethod('plusOne', NumberTipe, NumberTipe, self => self.value + 1),
        isPositive: new TipeMethod(
            'isPositive', 
            NumberTipe, 
            BooleanTipe, 
            self => self.value > 0),
        greaterThan: new TipeMethod(
            'greaterThan', 
            NumberTipe, 
            Tipe.Function(NumberTipe, BooleanTipe, FloatBox, '0'),
            function(self) { 
                return (nVal) => BooleanTipe.new(self.value > nVal.value)
            }
        )
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
        length: new TipeMethod('length', TextTipe, NumberTipe, self => self.value.length),
        firstLetter: new TipeMethod('firstLetter', TextTipe, TextTipe, self => self.value.substring(0, 1)),
        firstWord: new TipeMethod('firstWord', TextTipe, TextTipe, self => self.value.split(' ')[0]),
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
    static new(defaults={}) { return new TipedValue(ColorTipe, defaults); }
    static asP5Color(c) { return color(c.red.value, c.green.value, c.blue.value); }

    static drawShadow() {
        ColorTipe.draw(ColorTipe.new({red: 20, green: 20, blue: 200}), Layers.Shadow);
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
    static variableName = 'id';
    static methods = {
        name: new TipeProperty('name', IDCardTipe, TextTipe),
        age: new TipeProperty('age', IDCardTipe, NumberTipe),
        eyes: new TipeProperty('eyes', IDCardTipe, ColorTipe),
    }
    static new(defaults={}) { return new TipedValue(IDCardTipe, defaults); }
}

class BallTipe extends Tipe {
    static name = 'Ball';
    static variableName = 'ball';
    static methods = {
        size: new TipeProperty('size', BallTipe, NumberTipe),
        color: new TipeProperty('color', BallTipe, ColorTipe),
    }
    static new(defaults={}) { return new TipedValue(BallTipe, defaults); }

    // expects top center
    static drawShadow() {
        Renderer.newRenderable(Layers.Shadow, function() {
            const radius = Machine.width / 4;
            const deviation = PI * 0.15;
            fill(150);
            arc(0, -radius * sin(deviation), 2 * radius, 2 * radius, deviation, PI - deviation, CHORD);
        });
    }
    
    static draw(ball, layer=Layers.Data) {
        Renderer.newRenderable(layer, () => {
            stroke(66);
            fill(ColorTipe.asP5Color(ball.color));
            circle(0, ball.size.value, ball.size.value * 2);
        });
    }
}