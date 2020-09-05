class TipeProperty {
    constructor(name, tipe) {
        this.name = name;
        this.tipe = tipe;
    }
}

class Tipe {
    static name = 'top';
    static properties = {};
    static new() { console.log('unimplemented!') }
    static draw() { console.log('draw unimplemented for ' + name); }
    static drawShadow() { console.log('draw unimplemented for ' + name); }

    static defaultFactory(tipe) {
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
}

class TextTipe extends Tipe {
    static name = 'Text';
    static basic = true;
    static new() {
        let obj = new String();
        obj.tipe = TextTipe;
        return obj;
    }
}

class ColorTipe extends Tipe {
    static name = 'Color';
    static properties = {
        green: new TipeProperty('green', NumberTipe),
        blue: new TipeProperty('blue', NumberTipe),
        red: new TipeProperty('red', NumberTipe),
    }
    static new = Tipe.defaultFactory(ColorTipe);
}

class IDCardTipe extends Tipe {
    static name = 'IDCard';
    static properties = {
        name: new TipeProperty('name', TextTipe),
        age: new TipeProperty('age', NumberTipe),
        eyes: new TipeProperty('eyes', ColorTipe),
    }
    static new = Tipe.defaultFactory(IDCardTipe);
}

class BallTipe extends Tipe {
    static name = 'Ball';
    static properties = {
        size: new TipeProperty('size', NumberTipe),
        color: new TipeProperty('color', ColorTipe),
    }
    static new = Tipe.defaultFactory(BallTipe);

    static drawShadow(centerX, centerY, radius) {
        push();
        const deviation = PI * 0.15;
        fill(150);
        translate(centerX, centerY - radius * sin(deviation));
        arc(0, 0, 2 * radius, 2 * radius, deviation, PI - deviation, CHORD);
        pop();
    }
    
    static draw(centerX, centerY, ball) {
        push();
        let color = ball.color;
        fill(color.red, color.green, color.blue);
        circle(centerX, centerY, ball.radius * 2);
        pop();
    }
}