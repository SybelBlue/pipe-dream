class Animator {
    constructor(
        drawFunction,
        init=[0, 0],
        update=function(last){ return last; },
        completed=function(next) { return false; },
        callback=function(){}) {
        this.draw = drawFunction;
        this.update = update;
        this.completed = completed;
        this.finished = false;
        this.callback = callback;

        this.nextValue = init;
        this.checkCompleted();
    }

    checkCompleted() {
        if (this.completed(this.nextValue)) {
            callback();
            this.finished = true;
        }
    }

    draw() {
        if (this.finished) return;

        Renderer.push(this);
        Renderer.translate(this.nextValue[0], this.nextValue[1]);
        this.draw();
        Renderer.pop(this);

        this.nextValue = this.update(this.nextValue);
        this.checkCompleted();
    }
}

class LerpAnimator {
    constructor(drawFunction, start, stop, speed, callback) {
        this.dist = dist(...start, ...stop);
        this.dir = [0, 1].map(i => stop[i] - start[i] / this.dist);
        this.checkOps = [0, 1].map(i => start[i] <= stop[i] ? max : min);
        super(
            drawFunction,
            start,
            (last) => [0, 1].map(i => this.checkOps[i](last[i] + this.dir[i] * speed, stop[i])),
            (next) => next == stop,
            callback
        );
    }
}