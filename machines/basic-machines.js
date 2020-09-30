class MapMachine extends StackedMachine {
    description = "A machine that turns one object into another object."
    constructor(key, inTipe) {
        super(key, inTipe, color('#E8E288'), 'map');
    }
}

class FilterMachine extends StackedMachine {
    description = "A machine that only allows certain objects through.\nIt requires a Boolean value inside."
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
        Renderer.newRenderable(this.drawLayer, () => {
            noStroke();
            fill(SceneManager.prompt ? SceneManager.promptBackground : (this.isDummy ? Tray.backgroundColor : Editor.backgroundColor));
            BooleanTipe.shapeOutline(0)
        });
        Renderer.pop(this);
    }
}