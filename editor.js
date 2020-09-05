class Editor {
    static gutterSize = 80;
    static pipeIndent = 30;
    static pipeGutterSize = Editor.gutterSize + Editor.pipeIndent;
    static darkMargin = 30;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.pipeline = [new Pipe(Editor.darkMargin, 100, true, false)];
    }

    draw() {
        push();
        translate(this.x, this.y);
        noStroke();
        fill(100);
        rect(0, 0, this.width, this.height);

        fill(66);
        rect(0, 0, this.width, Editor.darkMargin);

        if (Pipe.mainWidth) {
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, Editor.darkMargin - 10, Pipe.innerWidth, 10)
        }

        let bottomStart = Editor.darkMargin + this.pipelineHeight;
        this.renderPipeline();

        fill(66);
        rect(0, bottomStart, this.width, this.height - bottomStart);
        
        if (Pipe.mainWidth) {
            fill(20);
            rect(Editor.pipeGutterSize + Pipe.edgeWidth, bottomStart, Pipe.innerWidth, 10);
        }
        pop();
    }

    renderPipeline() {
        let machines = this.pipeline.reduce(function(list, item) {
            if (item instanceof Machine) {
                list.push(item);
            } else {
                item.draw();
            }
            return list;
        }, []);

        machines.forEach(mach => mach.draw());
    }

    checkHighlight() {
        this.pipeline.forEach(pipe => pipe.testHighlight(mouseX - this.x, mouseY - this.y));
    }

    get pipelineHeight() {
        return this.pipeline.reduce((sum, pipe) => sum + pipe.height, 0);
    }

    pushMachine(machine) {
        this.pipeline.push(machine);
        let pipeIsDone = false;
        this.pipeline.push(new Pipe(Editor.darkMargin + 200, 100, false, pipeIsDone));
    }
}