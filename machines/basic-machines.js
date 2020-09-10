class MapMachine extends StackedMachine {
    constructor(key, inTipe) {
        super(key, inTipe, color('#E8E288'), 'map');
    }
}

class FilterMachine extends StackedMachine {
    textSize = 22;

    get outputTipe() { return this.inTipe; }
    get finished() { 
        const last = Array.last(this.methodStack);
        return (last ? last.outTipe : this.inTipe).name === BooleanTipe.name;
    }

    constructor(key, inTipe) {
        super(key, inTipe, color('#7dce82'), 'filter');
    }

    apply(tipedValue) {
        const result = super.apply(tipedValue);
        return result.value ? tipedValue : null;
    }

    draw() {
        super.draw();

        Renderer.push(this);
        Renderer.translate(Machine.bodyIndent + Tipe.shapeMidline, this.height - MapMachine.tailHeight);
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();
            fill(Editor.backgroundColor);
            BooleanTipe.shapeOutline(0)
        });
        Renderer.pop(this);
    }
}

class TakeMachine extends Machine {
    static inputBoxStart = Machine.bodyHeight;

    get bodyHeight() { return TakeMachine.inputBoxStart + this.inputBox.height + 10; }

    get outputTipe() { return this.inTipe; }

    constructor(key, inTipe) {
        super(key, inTipe, color('#38369A'), 'take');
        this.inputBox = new IntegerBox({ defaultText: '5' });
    }

    draw() {
        super.draw();

        Renderer.push(this);
        Renderer.translate(StackedMachine.bodyIndent, TakeMachine.inputBoxStart);
        this.inputBox.draw();
        Renderer.pop(this);
    }

    process(values) { return values.slice(0, this.inputBox.value); }
} 