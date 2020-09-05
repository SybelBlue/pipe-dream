class Editor {
    static gutterSize = 80;
    static pipeIndent = 30;
    static pipeGutterSize = Editor.gutterSize + Editor.pipeIndent;
    static darkMargin = 30;

    get pipeTipeChecks() { return true; }

    get pipelineHeight() {
        return this.pipeline.reduce((sum, pipe) => sum + pipe.height + Pipe.height, Pipe.height);
    }

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.pipeline = [];
    }

    draw() {
        push();
        translate(this.x, this.y);
        noStroke();
        fill(100);
        rect(0, 0, this.width, this.height);

        fill(66);
        rect(0, 0, this.width, Editor.darkMargin);

        // set new baseline
        translate(0, Editor.darkMargin);

        if (Pipe.mainWidth) {
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)
        }

        this.renderPipeline();

        const pHeight = this.pipelineHeight;
        fill(66);
        rect(0, pHeight, this.width, this.height - pHeight);
        
        if (Pipe.mainWidth) {
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, pHeight, Pipe.innerWidth, 10);
        }
        pop();
    }

    renderPipeline() {
        push();
        translate(Editor.pipeGutterSize, 0);
        new Pipe(true, false).draw();
        translate(-Editor.pipeIndent, Pipe.height);
        this.pipeline.forEach((machine, i) => {
            // draw botttom pipe
            let height = machine.height;
            translate(Editor.pipeIndent, height);
            new Pipe(false, i == this.pipeline.length - 1 && this.pipeTipeChecks).draw();

            // draw machine
            translate(-Editor.pipeIndent, -height);
            machine.draw();
            translate(0, height + Pipe.height);
        });
        pop();
    }

    checkHighlight() {
        // check regions for adding machines
    }

    pushMachine(machine) {
        this.pipeline.push(machine);
    }
}