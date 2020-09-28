const TipeLit = {
    get maxDrawWidth() { return Pipe.innerWidth - 10; },

    shapeIndent: 16,
    shapeMidline: Tipe.shapeIndent / 2,
    shapeHalfWidth: Tipe.shapeMidline * 0.8,
    shapeHeight: 8,

    name: 'top',
    methods: {},
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

    // equivalent to a haskell List
    // static Stream(tipe) {
    //     return class StreamTipe extends Tipe {
    //         static name = `Stream(${tipe.name})`;
    //         static innerTipe = tipe;
    //         static basic = true;
    //         static isStream = true;
    //         static streamable = true;
    //         static new(...values) { return new TipedValue(StreamTipe, { value: values }); }
    //     }
    // }

    // // equivalent to haskell Maybe tipe
    // static Boxed(tipe) {
    //     return class BoxedTipe extends Tipe {
    //         static name = `Box(${tipe.name})`;
    //         static innerTipe = tipe;
    //         static basic = true;
    //         static isStreamTipe = true;
    //         static streamable = true;
    //         static methods = {
    //             isEmpty: new TipeMethod('isEmpty', BoxedTipe, BooleanTipe, self => Boolean(self.value)),
    //             // unwrapOr: needs constructors
    //             // unwrap: needs errors
    //         };
    //         static new(value) { return new TipedValue(BoxedTipe, { value: value }); }
    //     }
    // }

    // // equivalent to a statically sized Rust array
    // static Array(tipe, size) {
    //     return class ArrayTipe extends Tipe {
    //         static name = `[${size}x${tipe.name}]`
    //         static innerTipe = tipe;
    //         static basic = true;
    //         static size = size;
    //         static methods = {
    //             size: new TipeMethod('size', ArrayTipe, NumberTipe, () => size)
    //         };
    //         static isBoxTipe = true;
    //         static streamable = true;

    //         static new(...values) {
    //             return new TipedValue(ArrayTipe, { value: values.slice(0, size).map(v => tipe.new(v)) });
    //         }

    //         static drawShadow() { TextTipe.draw(ArrayTipe.name, Layers.Shadow); }

    //         static draw() { TextTipe.draw(ArrayTipe.name); }
    //     }
    // }

    // static Function(inTipe, outTipe, inputBoxConstructor, args=null) {
    //     return class FunctionTipe extends Tipe {
    //         static name = `Function(${inTipe.name}) -> ${outTipe.name}`;
    //         static inTipe = inTipe;
    //         static outTipe = outTipe;
    //         static isFunctionTipe = true;
    //         static get methods() {
    //             const box = new inputBoxConstructor(args);
    //             return { 
    //                 getInput: new UIMethod(
    //                     'getInput',
    //                     FunctionTipe,
    //                     outTipe,
    //                     box,
    //                     self => self.value(box.value)
    //                 )
    //             }
    //         };
    //         static basic = true;

    //         static new(func) { return new TipedValue(FunctionTipe, { value: func }); }

    //         static drawShadow() {
    //             TextTipe.draw(`${inTipe.variableName}→${outTipe.variableName}`, Layers.Shadow);
    //         }
    //         static draw() {
    //             TextTipe.draw(`${inTipe.variableName}→${outTipe.variableName}`);
    //         }
    //     }
    // }
}

const BooleanLit = extendLiteral(TipeLit, {
    name: 'Boolean',
    variableName: 'bool',
    basic: true,
    isBooleanTipe: true,
    methods: {
        negate: new TipeMethod('negate', BooleanTipe, BooleanTipe, self => !self.value),
    },

    new(value=false) { 
        if (value !== false && value !== true) throw new Error('bad value: ' + value);
        return new TipedValue(BooleanTipe, { value: value });
    },

    drawShadow() { TextTipe.draw('True/False', Layers.Shadow); },

    draw(tipedBool) { TextTipe.draw(tipedBool.value ? 'True' : 'False'); },

    shapeOutline(yOffset) {
        const halfWidth = Tipe.shapeHalfWidth * 0.8 + yOffset/2;
        rect(-halfWidth, yOffset, halfWidth * 2, Tipe.shapeHeight * 0.8);
    }
});

const NumberLit = extendLiteral(TipeLit, {
    name: 'Number',
    variableName: 'num',
    basic: true,
    isNumberTipe: true,

    get shadowTextWidth() { return Renderer.textWidth(this.shadowText, 45, 'Georgia'); },
    shadowText: '#',

    get methods() {
        return {
            absoluteValue: new TipeMethod('absoluteValue', this, this, self => abs(self.value)),
            plusOne: new TipeMethod('plusOne', this, this, self => self.value + 1),
            isPositive: new TipeMethod(
                'isPositive', 
                this, 
                BooleanTipe, 
                self => self.value > 0),
            greaterThan: new TipeMethod(
                'greaterThan', 
                this, 
                Tipe.Function(this, BooleanTipe, FloatBox, { defaultText: '0' }),
                function(self) { 
                    return (nVal) => BooleanTipe.new(self.value > nVal)
                }
            ),
            ballWithColor: new TipeMethod(
                'ballWithColor', 
                this, 
                Tipe.Function(ColorTipe, BallTipe, ColorPicker),
                function(self) { 
                    return (colorName) => BallTipe.new({ size: self.value, color: colorName })
                }
            ),
        }
    },
    new(value=0) {
        if (typeof(value) !== typeof(0)) throw new Error('bad value: ' + value);
        return new TipedValue(this, { value: value });
    },

    drawShadow() {
        Renderer.temporary(this, 0, -textAscent()/2, () => this.draw(this.shadowText, Layers.Shadow));
    },

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

// class TextTipe extends Tipe {
//     static name = 'Text';
//     static variableName = 'text';
//     static basic = true;

//     static methods = {
//         length: new TipeMethod('length', TextTipe, NumberTipe, self => self.value.length),
//         firstLetter: new TipeMethod('firstLetter', TextTipe, TextTipe, self => self.value.substring(0, 1)),
//         firstWord: new TipeMethod('firstWord', TextTipe, TextTipe, self => self.value.split(' ')[0]),
//     };
//     static new(value='') { 
//         if (typeof(value) !== typeof('')) throw new Error('bad value: ' + value);
//         return new TipedValue(TextTipe, { value: value });
//     }

//     static shadowTextWidth = null;
//     static shadowText = 'text';

//     static drawShadow() {
//         TextTipe.draw(TextTipe.shadowText, Layers.Shadow);
//     }

//     static draw(str, layer=Layers.Data) {
//         if (str.length > 10) {
//             str = str.substring(0, 9) + '…';
//         }
//         Renderer.newRenderable(layer, () => {
//             textSize(20);
//             if (!TextTipe.shadowTextWidth) {
//                 TextTipe.shadowTextWidth = textWidth(TextTipe.shadowText);
//             }
//             fill(30, 30, 30)
//             text('' + str, str == TextTipe.shadowText ? -TextTipe.shadowTextWidth/2 : -textWidth(str)/2, textAscent() * 0.7);
//         });
//     }
// }

// class ColorTipe extends Tipe {
//     static name = 'Color';
//     static variableName = 'color';
//     static get variants() { 
//         return {
//             red: new TipedValue(ColorTipe, { name: 'red', hexString: '#C1301C' }),
//             orange: new TipedValue(ColorTipe, { name: 'orange', hexString: '#C96112' }),
//             yellow: new TipedValue(ColorTipe, { name: 'yellow', hexString: '#C4A705' }),
//             green: new TipedValue(ColorTipe, { name: 'green', hexString: '#177245' }),
//             blue: new TipedValue(ColorTipe, { name: 'blue', hexString: '#0E2753' }),
//             purple: new TipedValue(ColorTipe, { name: 'purple', hexString: '#4B2882' }),
//         };
//     }
//     static get methods() {
//         return {
//             name: new TipeProperty('name', ColorTipe, TextTipe),
//             hexString: new TipeProperty('hexString', ColorTipe, TextTipe),
//             ballWithSize: new TipeMethod(
//                 'ballWithSize', 
//                 ColorTipe, 
//                 Tipe.Function(NumberTipe, BallTipe, FloatBox, { defaultText: '1.5' }),
//                 function(self) { 
//                     return (nVal) => BallTipe.new({ size: nVal, color: self })
//                 }
//             ),
//             isOneOf: new TipeMethod(
//                 'isOneOf', 
//                 ColorTipe, 
//                 Tipe.Function(ColorTipe, BooleanTipe, ColorPicker, true),
//                 function(self) { 
//                     return (selectedColors) => BooleanTipe.new(selectedColors[self.name.value])
//                 }
//             ),
//         }
//     }
//     static new(variant='blue') {
//         if (typeof(variant) !== typeof('')) throw new Error('bad variant: ' + variant);
//         return ColorTipe.variants[variant];
//     }
//     static asP5Color(c) { return color(c.hexString.value); }

//     static drawShadow() {
//         ColorTipe.draw(ColorTipe.new(), Layers.Shadow);
//     }

//     static draw(color, layer=Layers.Data) {
//         Renderer.newRenderable(layer, () => {
//             fill(ColorTipe.asP5Color(color));
//             stroke(10);
//             rect(-Pipe.mainWidth/3, 0, 2 * Pipe.mainWidth/3, Pipe.mainWidth/4);
//         });
//     }
// }

// class IDCardTipe extends Tipe {
//     static name = 'IDCard';
//     static variableName = 'id';
//     static methods = {
//         name: new TipeProperty('name', IDCardTipe, TextTipe),
//         age: new TipeProperty('age', IDCardTipe, NumberTipe),
//         eyes: new TipeProperty('eyes', IDCardTipe, ColorTipe),
//     }
//     static new(defaults={}) { return new TipedValue(IDCardTipe, defaults); }
// }

// class BallTipe extends Tipe {
//     static name = 'Ball';
//     static variableName = 'ball';
//     static methods = {
//         size: new TipeProperty('size', BallTipe, NumberTipe),
//         color: new TipeProperty('color', BallTipe, ColorTipe),
//         withColor: new TipeMethod(
//             'withColor', 
//             BallTipe, 
//             Tipe.Function(ColorTipe, BallTipe, ColorPicker),
//             function(self) { 
//                 return (colorName) => BallTipe.new({ size: self.size.value, color: colorName })
//             }
//         ),
//         withSize: new TipeMethod(
//             'withSize', 
//             BallTipe, 
//             Tipe.Function(NumberTipe, BallTipe, FloatBox, { defaultText: '1.5' }),
//             function(self) { 
//                 return (nVal) => BallTipe.new({ size: nVal, color: self.color.name.value })
//             }
//         ),
//     }
//     static new(defaults={ size: 50, color: 'blue' }) { 
//         defaults.size = exists(defaults.size) ? (1 > defaults.size ? 1 : defaults.size) : 50;
//         return new TipedValue(BallTipe, defaults);
//     }

//     // expects top center
//     static drawShadow() {
//         Renderer.newRenderable(Layers.Shadow, function() {
//             const radius = Machine.width / 4;
//             const deviation = PI * 0.15;
//             fill(150);
//             arc(0, -radius * sin(deviation), 2 * radius, 2 * radius, deviation, PI - deviation, CHORD);
//         });
//     }

//     static draw(ball, layer=Layers.Data) {
//         Renderer.newRenderable(layer, () => {
//             stroke(66);
//             fill(ColorTipe.asP5Color(ball.color));
//             circle(0, ball.size.value * Tipe.maxDrawWidth / 200, ball.size.value * Tipe.maxDrawWidth / 100);
//         });
//     }
// }