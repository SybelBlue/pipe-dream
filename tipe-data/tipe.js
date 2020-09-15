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
    static draw(tipedValue) { console.log('draw unimplemented for ' + this.name); }
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
            static streamable = true;
            static new(...values) { return new TipedValue(InnerTipe, { value: values }); }
        }
    }

    static Box(tipe, size) {
        return class InnerTipe extends Tipe {
            static name = `[${size}x${tipe.name}]`
            static innerTipe = tipe;
            static basic = true;
            static size = size;
            static methods = {
                size: new TipeMethod('size', InnerTipe, NumberTipe, () => size)
            };
            static isBoxTipe = true;
            static streamable = true;
            static new(...values) {
                let inner = values.slice(0, size).map(v => tipe.new(v));
                return new TipedValue(InnerTipe, { value: inner });
            }

            static drawShadow() {
                TextTipe.draw(InnerTipe.name, Layers.Shadow);
            }
            static draw() {
                TextTipe.draw(InnerTipe.name);
            }
        }
    }

    static Function(inTipe, outTipe, inputBoxConstructor, args=null) {
        return class InnerTipe extends Tipe {
            static name = `Function(${inTipe.name}) -> ${outTipe.name}`;
            static inTipe = inTipe;
            static outTipe = outTipe;
            static isFunctionTipe = true;
            static get methods() {
                const box = new inputBoxConstructor(args);
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
            static draw() {
                TextTipe.draw(`${inTipe.variableName}→${outTipe.variableName}`);
            }
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

    static new(value=false) { 
        if (value !== false && value !== true) throw new Error('bad value', value);
        return new TipedValue(BooleanTipe, { value: value });
    }
    
    static drawShadow() {
        TextTipe.draw('True/False', Layers.Shadow);
    }

    static draw(tipedBool) {
        TextTipe.draw(tipedBool.value ? 'True' : 'False');
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
    static get methods() {
        return {
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
                Tipe.Function(NumberTipe, BooleanTipe, FloatBox, { defaultText: '0' }),
                function(self) { 
                    return (nVal) => BooleanTipe.new(self.value > nVal)
                }
            ),
            ballWithColor: new TipeMethod(
                'ballWithColor', 
                NumberTipe, 
                Tipe.Function(ColorTipe, BallTipe, ColorPicker),
                function(self) { 
                    return (colorName) => BallTipe.new({ size: self.value, color: ColorTipe.variants[colorName] })
                }
            ),
        }
    }
    static new(value=0) {
        if (typeof(value) !== typeof(0)) throw new Error('bad value', value);
        return new TipedValue(NumberTipe, { value: value });
    }
    static shadowTextWidth = null;
    static shadowText = '#';

    static drawShadow() {
        Renderer.push(this);
        Renderer.translate(0, -textAscent()*0.5);
        NumberTipe.draw(this.shadowText, Layers.Shadow);
        Renderer.pop(this);
    }

    static draw(tipedNum, layer=Layers.Data) {
        let num = tipedNum.value ? tipedNum.value : tipedNum;
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
    static new(value='') { 
        if (!(value instanceof String)) throw new Error('bad value', value);
        return new TipedValue(TextTipe, { value: value });
    }
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

class ColorTipe extends Tipe {
    static name = 'Color';
    static variableName = 'color';
    static get variants() { 
        return {
            red: new TipedValue(ColorTipe, { name: 'red', hexString: '#C1301C' }),
            orange: new TipedValue(ColorTipe, { name: 'orange', hexString: '#C96112' }),
            yellow: new TipedValue(ColorTipe, { name: 'yellow', hexString: '#C4A705' }),
            green: new TipedValue(ColorTipe, { name: 'green', hexString: '#177245' }),
            blue: new TipedValue(ColorTipe, { name: 'blue', hexString: '#0E2753' }),
            purple: new TipedValue(ColorTipe, { name: 'purple', hexString: '#4B2882' }),
        };
    }
    static get methods() {
        return {
            name: new TipeProperty('name', ColorTipe, TextTipe),
            hexString: new TipeProperty('hexString', ColorTipe, TextTipe),
            ballWithSize: new TipeMethod(
                'ballWithSize', 
                ColorTipe, 
                Tipe.Function(NumberTipe, BallTipe, FloatBox, { defaultText: '1.5' }),
                function(self) { 
                    return (nVal) => BallTipe.new({ size: nVal.value, color: {} })
                }
            ),
            isOneOf: new TipeMethod(
                'isOneOf', 
                ColorTipe, 
                Tipe.Function(ColorTipe, BooleanTipe, ColorPicker, true),
                function(self) { 
                    return (selectedColors) => BooleanTipe.new(trace({s: selectedColors, n: self.name, o: selectedColors[self.name.value]}, selectedColors[self.name.value]))
                }
            ),
        }
    }
    static new(variant='blue') {
        if (!(value instanceof String)) throw new Error('bad value', value);
        return ColorTipe.variants[variant];
    }
    static asP5Color(c) { return color(c.hexString.value); }

    static drawShadow() {
        ColorTipe.draw(ColorTipe.new(), Layers.Shadow);
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