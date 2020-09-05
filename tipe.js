class TipeProperty {
    constructor(name, inTipe, outTipe) {
        this.name = name;
        this.inTipe = inTipe;
        this.outTipe = outTipe;
    }
}

class Tipe {
    static name = 'top';
    static properties = {};
    static new() { console.log('unimplemented!') }
    // provide middle top
    static draw(tipe) { console.log('draw unimplemented for ' + name); }
    // provide middle top
    static drawShadow() { console.log('drawShadow unimplemented for ' + name); }

    static newFactory(tipe) {
        return function(defaults={}) {
            let out = { tipe: tipe };
            for (const key in tipe.properties) {
                out[key] = defaults[key] || tipe.properties[key].tipe.new();
            }
            return out;
        }
    }

    static of(value) {
        if (typeof(value) === typeof(0)) {
            return NumberTipe;
        }
        return value.tipe;
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

class NumberTipe extends Tipe {
    static name = 'Number';
    static basic = true;
    static isNumberTipe = true;
    static new() { return 0; }
    static shadowTextWidth = null;
    static shadowText = '#';

    static drawShadow() {
        Renderer.push(this);
        Renderer.translate(0, -textAscent()*0.5);
        NumberTipe.draw(this.shadowText, Layers.Shadow);
        Renderer.pop(this);
    }

    static draw(num, layer=Layers.Data) {
        if (num > 9999) {
            num = 'Big#';
        }
        Renderer.renderObject(layer, () => {
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
    static basic = true;
    static new() {
        let obj = new String();
        obj.tipe = TextTipe;
        return obj;
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
        Renderer.renderObject(layer, () => {
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
    static properties = {
        green: new TipeProperty('green', ColorTipe, NumberTipe),
        blue: new TipeProperty('blue', ColorTipe, NumberTipe),
        red: new TipeProperty('red', ColorTipe, NumberTipe),
    }
    static new = Tipe.newFactory(ColorTipe);
    static asP5Color(c) { return color(c.red, c.green, c.blue); }

    static drawShadow() {
        ColorTipe.draw({red: 20, green: 20, blue: 200}, Layers.Shadow);
    }

    static draw(color, layer=Layers.Data) {
        Renderer.renderObject(layer, () => {
            fill(ColorTipe.asP5Color(color));
            stroke(10);
            rect(-Pipe.mainWidth/3, 0, 2 * Pipe.mainWidth/3, Pipe.mainWidth/4);
        })
    }
}

class IDCardTipe extends Tipe {
    static name = 'IDCard';
    static properties = {
        name: new TipeProperty('name', IDCardTipe, TextTipe),
        age: new TipeProperty('age', IDCardTipe, NumberTipe),
        eyes: new TipeProperty('eyes', IDCardTipe, ColorTipe),
    }
    static new = Tipe.newFactory(IDCardTipe);
}

class BallTipe extends Tipe {
    static name = 'Ball';
    static properties = {
        size: new TipeProperty('size', BallTipe, NumberTipe),
        color: new TipeProperty('color', BallTipe, ColorTipe),
    }
    static new = Tipe.newFactory(BallTipe);

    // expects top center
    static drawShadow() {
        Renderer.renderObject(Layers.Shadow, function() {
            const radius = Machine.width / 4;
            const deviation = PI * 0.15;
            fill(150);
            arc(0, -radius * sin(deviation), 2 * radius, 2 * radius, deviation, PI - deviation, CHORD);
        });
    }
    
    static draw(ball) {
        Renderer.renderObject(Layers.Data, () => {
            let color = ball.color;
            stroke(66);
            fill(ColorTipe.asP5Color(color));
            circle(0, ball.radius, ball.radius * 2);
        });
    }
}