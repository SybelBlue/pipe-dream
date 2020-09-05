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
    static draw(tipe) { console.log('draw unimplemented for ' + name); }
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
}

class NumberTipe extends Tipe {
    static name = 'Number';
    static basic = true;
    static isNumberTipe = true;
    static new() { return 0; }
    static shadowTextWidth = null;
    static shadowText = '#';

    static drawShadow() {
        NumberTipe.draw(this.shadowText);
    }

    static draw(num) {
        if (num > 9999) {
            num = 'Big#';
        }
        Renderer.renderObject(Layers.Data, () => {
            textSize(45);
            textFont('Georgia');
            if (!NumberTipe.shadowTextWidth) {
                NumberTipe.shadowTextWidth = textWidth(NumberTipe.shadowText);
            }
            fill(30, 30, 30)
            text('' + num, num == NumberTipe.shadowText ? -NumberTipe.shadowTextWidth/2 : -textWidth(num)/2, -textAscent() * 0.7);
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
        TextTipe.draw(this.shadowText);
    }

    static draw(str) {
        if (str.length > 10) {
            str = str.substring(0, 7) + '...';
        }
        Renderer.renderObject(Layers.Data, () => {
            textSize(20);
            textFont('Courier New');
            if (!TextTipe.shadowTextWidth) {
                TextTipe.shadowTextWidth = textWidth(TextTipe.shadowText);
            }
            fill(30, 30, 30)
            text('' + str, str == TextTipe.shadowText ? -TextTipe.shadowTextWidth/2 : -textWidth(str)/2, 0);
        });
    }
}

class ColorTipe extends Tipe {
    static name = 'Color';
    static properties = {
        green: new TipeProperty('green', ColorTipe, NumberTipe),
        blue: new TipeProperty('blue', ColorTipe, NumberTipe),
        red: new TipeProperty('red', ColorTipe, NumberTipe),
    }
    static new = Tipe.newFactory(ColorTipe);
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
    
    // expects middle center
    static draw(ball) {
        Renderer.renderObject(Layers.Data, () => {
            let color = ball.color;
            stroke(66);
            fill(color.red, color.green, color.blue);
            circle(0, 0, ball.radius * 2);
        });
    }
}