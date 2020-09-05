class Editor {
    static gutterSize = 80;
    static pipeIndent = 30;
    static pipeGutterSize = Editor.gutterSize + Editor.pipeIndent;
    static darkMargin = 30;

    get pipeTipeChecks() { return true; }

    get pipelineHeight() {
        return this.pipeline.reduce((sum, pipe) => sum + pipe.height + Pipe.height, Pipe.height);
    }

    constructor(startingTipe, x, y, width, height) {
        this.startingTipe = startingTipe;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.pipeline = [];
    }

    draw() {
        Renderer.push(this);
        Renderer.translate(this.x, this.y);
        Renderer.renderObject(Layers.Background, () => {
            noStroke();
            fill(100);
            rect(0, 0, this.width, this.height);

            fill(66);
            rect(0, 0, this.width, Editor.darkMargin);
        });

        // set new baseline
        Renderer.translate(0, Editor.darkMargin);

        Renderer.renderObject(Layers.Background, () => {
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, -10, Pipe.innerWidth, 10)
        });

        this.renderPipeline();

        Renderer.renderObject(Layers.Background, () => {
            const pHeight = this.pipelineHeight;
            fill(66);
            rect(0, pHeight, this.width, this.height - pHeight);
            
            if (Pipe.mainWidth) {
                fill(20);
                rect(Editor.pipeGutterSize + Pipe.edgeWidth, pHeight, Pipe.innerWidth, 10);
            }
        });
        Renderer.pop(this);
    }

    renderPipeline() {
        Renderer.push(this);
        
        Renderer.translate(Editor.pipeGutterSize, 0);
        new Pipe(true, false).draw(this.startingTipe);

        Renderer.translate(-Editor.pipeIndent, Pipe.height);
        for (let i = 0; i < this.pipeline.length; i++) {
            const machine = this.pipeline[i];

            machine.draw();
            Renderer.translate(Editor.pipeIndent, machine.height);
            
            new Pipe(false, i == this.pipeline.length - 1 && this.pipeTipeChecks).draw(machine.outputTipe)
            Renderer.translate(-Editor.pipeIndent, Pipe.height);
        }
        Renderer.pop(this);
    }

    checkHighlight() {
        // check regions for adding machines
    }

    pushMachine(machine) {
        this.pipeline.push(machine);
    }
}