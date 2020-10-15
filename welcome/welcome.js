let requestRescaleCanvas = false;
let clickThisFrame = false;
let dimensions = null;

const welcomeText = `Welcome to the PipeDream Stream Visualizer!

This website will present you with a series of challenges which increase in difficulty. At the beginning of each challenge, a prompt will show at the top of the screen and offer a description of the machines availiable to use in each challenge.

The goal is to use these machines to construct a pipeline that behaves the way the prompt describes. When you are ready to test your result, hit the Run button at the top of the editor. When you are satisfied, you may hit stop. If you complete all the tests sucessfully, you will be able to advance to the next challenge.

If you are familiar with Java, the Java equivalent of the pipeline will appear in a white box next to the pipeline as you construct it. If not, don't worry! It won't effect your ability to complete the challenges.`;

function setup() {
    createCanvas(windowWidth, windowHeight);
    dimensions = { width: windowWidth, height: windowHeight };
}

function draw() {
    const lines = Renderer.textToLines(welcomeText, 20, dimensions.width - 30);
    const lineGap = Renderer.textHeight(20) + 6;
    const textHeight = lineGap * (lines.length + 1);

    if (textHeight + 20 > dimensions.height) {
        dimensions.height = textHeight + 20;
        windowResized();
    }

    Renderer.push(this);
    Renderer.newRenderable(Layers.Background, () => {
        background(40);
        fill(240);
        stroke(0);
        rect(5, 5, windowWidth - 10, max(textHeight + 10, dimensions.height - 10), 10);
    });

    Renderer.translate(15, 5 + lineGap);
    for (const line of lines) {
        Renderer.newRenderable(Layers.UI, () => {
            textSize(20);
            text(line, 0, 0);
        });
        Renderer.translate(0, lineGap);
    }
    Renderer.pop(this);

    Renderer.temporary(this, dimensions.width - Renderer.textWidth('Let\'s do it!', 24) - 30, dimensions.height - Renderer.textHeight(24) - 30, 
            () => Renderer.newUIButton('Let\'s do it!', color('#5C9EAD'), loadLevel, 10));

    
    try {
        const focused = Renderer.renderAll().found;

        if (clickThisFrame) {
            if (this.lastFocused && this.lastFocused != focused) {
                this.lastFocused.loseFocus && this.lastFocused.loseFocus();
            }

            this.lastFocused = focused;

            if (focused) {
                focused.gainFocus && focused.gainFocus();
            } else {
                SceneManager.tray.loadMachineOptions();
            }
        }
    } catch (e) {
        console.error(e);
        SceneManager.suggestReload('problem rendering');
    } finally {
        Renderer.clearStack();
    }

    clickThisFrame = false;
}

function loadLevel() {
    window.location = location.href;
}

function windowResized() { 
    resizeCanvas(max(dimensions.width, windowWidth), max(dimensions.height, windowHeight));
}

function mouseClicked() { clickThisFrame = true; }