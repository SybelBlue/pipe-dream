const Tipe = {
    get maxDrawWidth() { return Pipe.innerWidth - 10; },

    shapeIndent: 16,
    get shapeMidline() { return this.shapeIndent / 2; },
    get shapeHalfWidth() { return this.shapeMidline * 0.8; },
    shapeHeight: 8,

    name: 'top',
    get variableName() { return this.name; },
    get methods() { return {}; },
    get color() { return color('#3cdbd3') },
    new() { throw new Error('TopTipe cannot be instantiated') },
    // provide middle top
    draw(tipedValue) { console.log('draw unimplemented for ' + this.name); },
    // provide middle top
    drawShadow() { console.log('drawShadow unimplemented for ' + this.name); },
    // provide middle top
    drawShape(color=null) {
        Renderer.newRenderable(Layers.FragmentShape, () => {
            noStroke();
            fill(0)
            this.shapeOutline(0);
            fill(color || this.color);
            this.shapeOutline(-2);
        });
    },

    shapeOutline(yOffset) {
        triangle(
            -Tipe.shapeHalfWidth,                        yOffset,
             Tipe.shapeHalfWidth,                        yOffset,
                               0, Tipe.shapeHeight - 2 + yOffset
        );
    },

    equals(other) {
        return exists(other) && other.name === this.name;
    },

    asString(_value) {
        return this.name;
    }
}

// equivalent to a haskell List
Tipe.Stream = function(tipe) {
    return extendLiteral(Tipe, {
        name: `Stream(${tipe.name})`,
        innerTipe: tipe,
        basic: true,
        isStream: true,
        streamable: true,
        new(values) { return new TipedValue(this, { value: values }); },
        of(...values) { return this.new(values); }
    });
}

// equivalent to haskell Maybe tipe
Tipe.Boxed = function(tipe) {
    return extendLiteral(Tipe, {
        name: `Box(${tipe.name})`,
        innerTipe: tipe,
        basic: true,
        isStreamTipe: true,
        streamable: true,
        get methods() {
            const bxTipe = this;
            return {
                isEmpty: new TipeMethod('isEmpty', bxTipe, BooleanTipe, self => Boolean(self.value)),
                // unwrapOr: needs constructors
                // unwrap: needs errors
            }
        },
        new(value) { return new TipedValue(this, { value: value }); }
    });
}



Tipe.Function = function(inTipe, outTipe, inputBoxConstructor, args=null) {
    return extendLiteral(Tipe, {
        name: `Function(${inTipe.name}) -> ${outTipe.name}`,
        variableName: `f(${inTipe.variableName}) -> ${outTipe.variableName}`,
        inTipe: inTipe,
        outTipe: outTipe,
        isFunctionTipe: true,
        basic: true,
        get methods() {
            const box = new inputBoxConstructor(args);
            const fnTipe = this;
            return { 
                getInput: new UIMethod(
                    'getInput',
                    fnTipe,
                    outTipe,
                    box,
                    self => self.value(box.value)
                )
            }
        },

        new(func) { return new TipedValue(this, { value: func }); },

        drawShadow() {
            TextTipe.draw(`${inTipe.variableName}→${outTipe.variableName}`, Layers.Shadow);
        },

        draw() {
            TextTipe.draw(`${inTipe.variableName}→${outTipe.variableName}`);
        }
    });
}



// equivalent to a statically sized Rust array
Tipe.Array = function(tipe, size) {
    return extendLiteral(Tipe, {
        name: `[${size}x${tipe.name}]`,
        innerTipe: tipe,
        basic: true,
        size: size,
        isBoxTipe: true,
        streamable: true,
        get methods() {
            const arrTipe = this;
            return {
                size: new TipeMethod('size', arrTipe, NumberTipe, () => size)
            };
        },
        
        new(...values) {
            return new TipedValue(this, { value: values.slice(0, size).map(v => tipe.new(v)) });
        },

        drawShadow() { TextTipe.draw(this.name, Layers.Shadow); },

        draw() { TextTipe.draw(this.name); }
    });
}

const BooleanTipe = extendLiteral(Tipe, {
    name: 'Boolean',
    variableName: 'bool',
    basic: true,
    isBooleanTipe: true,
    get methods() {
        return {
           negate: new TipeMethod('negate', BooleanTipe, BooleanTipe, self => !self.value),
        }
    },

    get reductions() {
        return {
            all: new TipeReduction('all', BooleanTipe, (prev, curr) => curr.value && prev.value, true),
            // needs lazy! (needs to close pipeline after a certain input)
            any: new TipeReduction('any', BooleanTipe, (prev, curr) => curr.value || prev.value, true)
        }
    },

    new(value=false) { 
        if (value !== false && value !== true) throw new Error('bad value: ' + value);
        return new TipedValue(BooleanTipe, { value: value });
    },

    drawShadow() { TextTipe.draw('True/False', Layers.Shadow); },

    draw(tipedBool) { TextTipe.draw(tipedBool.asString()); },

    asString(tipedBool) { return tipedBool.value ? 'True' : 'False'; },

    shapeOutline(yOffset) {
        const halfWidth = Tipe.shapeHalfWidth * 0.8 + yOffset/2;
        rect(-halfWidth, yOffset, halfWidth * 2, Tipe.shapeHeight * 0.8);
    }
});

const NumberTipe = extendLiteral(Tipe, {
    name: 'Number',
    variableName: 'num',
    basic: true,
    isNumberTipe: true,

    get shadowTextWidth() { return Renderer.textWidth(this.shadowText, 45, 'Georgia'); },
    shadowText: '#',

    get reductions() {
        return {
            sum: new TipeReduction('sum', NumberTipe, (prev, curr) => curr.value + prev.value, 0),
        }
    },

    get methods() {
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
                    return (colorName) => BallTipe.new({ size: self.value, color: colorName })
                }
            ),
        }
    },
    new(value=0) {
        if (typeof(value) !== typeof(0)) throw new Error('bad value: ' + value);
        return new TipedValue(NumberTipe, { value: value });
    },

    drawShadow() {
        Renderer.temporary(this, 0, -textAscent()/2, () => this.draw(this.shadowText, Layers.Shadow));
    },

    asString(tipedNum) { return '' + tipedNum.value; },

    draw(tipedNum, layer=Layers.Data) {
        let num = exists(tipedNum.value) ? tipedNum.value : tipedNum;
        if (typeof(num) === typeof(0) && num > 9999) {
            num = 'Big#';
        }
        Renderer.newRenderable(layer, () => {
            textSize(45);
            textFont('Georgia');
            fill(30, 30, 30)
            text('' + num, num == this.shadowText ? -this.shadowTextWidth/2 : -Renderer.textWidth('' + num, 45, 'Georgia')/2, textAscent() * 0.7);
        });
    }
});

const TextTipe = extendLiteral(Tipe, {
    name: 'Text',
    variableName: 'text',
    basic: true,

    get methods() {
        return {
            length: new TipeMethod('length', TextTipe, NumberTipe, self => self.value.length),
            firstLetter: new TipeMethod('firstLetter', TextTipe, TextTipe, self => self.value.substring(0, 1)),
            firstWord: new TipeMethod('firstWord', TextTipe, TextTipe, self => self.value.split(' ')[0]),
            equals: new TipeMethod(
                'equals', 
                TextTipe, 
                Tipe.Function(TextTipe, BooleanTipe, InputBox, { defaultText: 'hello' }),
                function(self) { 
                    return (text) => BooleanTipe.new(self.value.trim() == text)
                }
            ),
        }
    },

    get reductions() {
        return {
            join: new TipeReduction('join', TextTipe, (prev, curr) => curr.value + prev.value, ''),
            unwords: new TipeReduction('unwords', TextTipe, (prev, curr) => curr.value + ' ' + prev.value, ''),
        }
    },

    get shadowTextWidth() { return Renderer.textWidth(this.shadowText, 20) },
    shadowText: 'text',

    new(value='') { 
        if (typeof(value) !== typeof('')) throw new Error('bad value: ' + value);
        return new TipedValue(TextTipe, { value: value });
    },

    drawShadow() { this.draw(this.shadowText, Layers.Shadow); },

    asString(tipedStr) { return tipedStr.value; },

    draw(str, layer=Layers.Data) {
        str = str.value ? str.value : str;
        if (str.length > 10) {
            str = str.substring(0, 9) + '…';
        }
        Renderer.newRenderable(layer, () => {
            textSize(20);
            fill(30, 30, 30)
            text('' + str, str == this.shadowText ? -this.shadowTextWidth/2 : -textWidth(str)/2, textAscent() * 0.7);
        });
    }
});

const ColorTipe = extendLiteral(Tipe, {
    name: 'Color',
    variableName: 'color',
    get variants() { 
        return {
            red: new TipedValue(ColorTipe, { name: 'red', hexString: '#C1301C' }),
            orange: new TipedValue(ColorTipe, { name: 'orange', hexString: '#C96112' }),
            yellow: new TipedValue(ColorTipe, { name: 'yellow', hexString: '#C4A705' }),
            green: new TipedValue(ColorTipe, { name: 'green', hexString: '#177245' }),
            blue: new TipedValue(ColorTipe, { name: 'blue', hexString: '#0E2753' }),
            purple: new TipedValue(ColorTipe, { name: 'purple', hexString: '#4B2882' }),
        };
    },
    get methods() {
        return {
            name: new TipeProperty('name', ColorTipe, TextTipe),
            hexString: new TipeProperty('hexString', ColorTipe, TextTipe),
            ballWithSize: new TipeMethod(
                'ballWithSize', 
                ColorTipe, 
                Tipe.Function(NumberTipe, BallTipe, FloatBox, { defaultText: '1.5' }),
                function(self) { 
                    return (nVal) => BallTipe.new({ size: nVal, color: self })
                }
            ),
            isOneOf: new TipeMethod(
                'isOneOf', 
                ColorTipe, 
                Tipe.Function(ColorTipe, BooleanTipe, ColorPicker, true),
                function(self) { 
                    return (selectedColors) => BooleanTipe.new(selectedColors[self.name.value])
                }
            ),
        }
    },
    
    new(variant='blue') {
        if (typeof(variant) !== typeof('')) throw new Error('bad variant: ' + variant);
        return ColorTipe.variants[variant];
    },
    
    asP5Color(c) { return color(c.hexString.value); },

    drawShadow() { ColorTipe.draw(ColorTipe.new(), Layers.Shadow); },

    asString(tipedColor) { return tipedColor.name.asString(); },

    draw(color, layer=Layers.Data) {
        Renderer.newRenderable(layer, () => {
            fill(ColorTipe.asP5Color(color));
            stroke(10);
            rect(-Pipe.mainWidth/3, 0, 2 * Pipe.mainWidth/3, Pipe.mainWidth/4);
        });
    }
});

// const IDCardTipe = extendLiteral(Tipe, {
//     name: 'IDCard',
//     variableName: 'id',
//     get methods() {
//         return {
//             name: new TipeProperty('name', IDCardTipe, TextTipe),
//             age: new TipeProperty('age', IDCardTipe, NumberTipe),
//             eyes: new TipeProperty('eyes', IDCardTipe, ColorTipe),
//         }
//     },

//     new(defaults={}) { return new TipedValue(IDCardTipe, defaults); }
// });

const BallTipe = extendLiteral(Tipe, {
    name: 'Ball',
    variableName: 'ball',
    get methods() {
        return {
            size: new TipeProperty('size', BallTipe, NumberTipe),
            color: new TipeProperty('color', BallTipe, ColorTipe),
            // changeColor: new TipeMethod(
            //     'changeColor', 
            //     BallTipe, 
            //     Tipe.Function(ColorTipe, BallTipe, ColorPicker),
            //     function(self) { 
            //         return (colorName) => BallTipe.new({ size: self.size.value, color: colorName })
            //     }
            // ),
            // changeSize: new TipeMethod(
            //     'changeSize', 
            //     BallTipe, 
            //     Tipe.Function(NumberTipe, BallTipe, FloatBox, { defaultText: '1.5' }),
            //     function(self) { 
            //         return (nVal) => BallTipe.new({ size: nVal, color: self.color.name.value })
            //     }
            // ),
        }
    },

    new(defaults={ size: 50, color: 'blue' }) { 
        defaults.size = exists(defaults.size) ? (1 > defaults.size ? 1 : defaults.size) : 50;
        return new TipedValue(BallTipe, defaults);
    },

    // expects top center
    drawShadow() {
        Renderer.newRenderable(Layers.Shadow, function() {
            const radius = Machine.width / 4;
            const deviation = PI * 0.15;
            fill(150);
            arc(0, -radius * sin(deviation), 2 * radius, 2 * radius, deviation, PI - deviation, CHORD);
        });
    },

    asString(ball) { return `Ball(${ball.size.asString()}, "${ball.color.asString()}")`; },

    draw(ball, layer=Layers.Data) {
        Renderer.newRenderable(layer, () => {
            stroke(66);
            fill(ColorTipe.asP5Color(ball.color));
            circle(0, ball.size.value * Tipe.maxDrawWidth / 200, ball.size.value * Tipe.maxDrawWidth / 100);
        });
    }
});