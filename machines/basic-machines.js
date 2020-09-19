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
        return (last ? last.outTipe : this.inTipe).equals(BooleanTipe);
    }

    textSize = 24;

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