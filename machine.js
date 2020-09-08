class Machine extends PipelineObject {
    static get machines() { return [new MapMachine(-1, Tipe)]; }

    static width = Pipe.mainWidth + 2 * Editor.pipeIndent;
    static bodyIndent = Editor.pipeIndent;
    static bodyHeight = 50;
    static get textColor() { return color(11); }

    static deleteButtonWidth = 15;
    static deleteButtonIndent = Machine.width - Machine.deleteButtonWidth - 10;
    static deleteButtonMidline = Machine.bodyHeight / 2;

    get height() { return Machine.bodyHeight; }

    get outputTipe() { return BallTipe; }

    constructor(key, inTipe, bodyColor, text) {
        super();

        this.key = key;
        this.inTipe = inTipe;
        this.color = bodyColor;
        this.text = text;
        this.dummy = inTipe.name === Tipe.name;
    }

    draw() {
        Renderer.newRenderable(Layers.Machine, 
            (regions) => {
                if (regions.body.hovering && clickThisFrame) {
                    if (regions.deleteButton.hovering) {
                        editor.removeMachine(this.key);
                        editor.tray.loadMachineOptions();
                    } else {
                        this.onClick();
                    }
                }
                noStroke();
                fill(this.color);
                rect(0, 0, Machine.width, Machine.bodyHeight, 10, 10, 10, 0);

                stroke(0);
                textSize(26);
                textFont('Courier New');
                fill(Machine.textColor);
                text(this.text, 10, 30);

                if (!this.dummy && regions.body.hovering) {
                    textSize(16)
                    text(`(${this.inTipe.variableName})`, 20 + Renderer.textWidth(this.text, 'Courier New', 26), 30);

                    stroke(255, 20, 20);
                    strokeWeight(5);
                    const halfWidth = Machine.deleteButtonWidth / 2;
                    line(
                        Machine.deleteButtonIndent, Machine.deleteButtonMidline - halfWidth, 
                        Machine.deleteButtonIndent + Machine.deleteButtonWidth, Machine.deleteButtonMidline + halfWidth
                    );
                    line(
                        Machine.deleteButtonIndent, Machine.deleteButtonMidline + halfWidth, 
                        Machine.deleteButtonIndent + Machine.deleteButtonWidth, Machine.deleteButtonMidline - halfWidth
                    );
                }
            },
            Renderer.regionStub('body', 0, 0, Machine.width, Machine.bodyHeight),
            Renderer.regionStub('deleteButton', 
                Machine.deleteButtonIndent, Machine.deleteButtonMidline - Machine.deleteButtonWidth/2, 
                20, 20, 
                false)
        );
    }

    onClick() { 
        if (this.dummy) {
            editor.pushMachine(MapMachine);
        } else {
            editor.tray.loadOptionsFor(this.inTipe, this, -1);
        }
    }

    apply(tipedValue) { return tipedValue; }
}

class MapMachine extends Machine {
    static tailHeight = 20;

    get outputTipe() { 
        const last = Array.last(this.methodStack);
        return last ? last.outTipe : this.inTipe;
    }
    get height() { return Machine.bodyHeight + this.innerHeight + MapMachine.tailHeight; }
    get finsished() { return true; }
    get innerHeight() { return max(10, this.methodStack.length * TipeMethod.height + (this.finsished ? 0 : 20)); }

    methodStack = [];

    constructor(key, inTipe) {
        super(key, inTipe, color('#E8E288'), 'map');
    }

    draw() {
        // draw body
        super.draw();
        
        Renderer.newRenderable(Layers.Machine, () => {
            noStroke();

            // clean interior
            fill(Editor.backgroundColor);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);

            // draw arm
            fill(this.color);
            rect(0, Machine.bodyHeight, Machine.bodyIndent, this.innerHeight);

            // draw tail
            rect(0, this.height - MapMachine.tailHeight, Machine.width, MapMachine.tailHeight, 0, 10, 10, 10);
        })
        
        // draw fragment stack
        Renderer.push(this);

        Renderer.translate(Machine.bodyIndent, Machine.bodyHeight);
        this.drawFragmentStack();

        Renderer.pop(this);
    }

    drawFragmentStack() {
        Renderer.push(this);
        Renderer.translate(Tipe.shapeMidline, 0);
        this.inTipe.drawShape(this.color);
        Renderer.pop(this);

        Renderer.push(this);
        let currentTipe = this.inTipe;
        this.methodStack.forEach((method, index) => {
            method.draw(() => {
                editor.tray.loadOptionsFor(method.outTipe, this, index);
                this.fragmentClicked(method, index);
            });
            currentTipe = method.outputTipe;
            Renderer.translate(0, TipeMethod.height);
        })
        Renderer.pop(this);
    }

    fragmentClicked() { console.log('click within machine'); }

    pushFragment(fragment, sourceIndex) { 
        this.methodStack.splice(sourceIndex + 1, this.methodStack.length - sourceIndex - 1, fragment);
    }

    apply(tipedValue) { 
        return this.methodStack.reduce(function (prev, method) {
            return method.run(prev);
        }, tipedValue);
    }
}