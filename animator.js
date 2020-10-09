class Animator {
    constructor(
        drawFunction,
        init=[0, 0],
        update=function(last){ return last; },
        completed=function(next) { return false; },
        callback=function(){}) {
        this.innerDraw = drawFunction;
        this.update = update;
        this.completed = completed;
        this.finished = false;
        this.callback = callback;

        this.nextValue = init;
    }

    checkCompleted() {
        if (this.completed(this.nextValue)) {
            this.callback();
            this.finished = true;
        }
    }

    draw() {
        if (this.finished) return;

        Renderer.temporary(this, this.nextValue[0], this.nextValue[1], () => this.innerDraw());

        this.checkCompleted();
        if (!this.finished) {
            this.nextValue = this.update(this.nextValue);
        }
    }
}

class LerpAnimator extends Animator {
    constructor(drawFunction, start, stop, speed, callback) {
        super(
            drawFunction,
            start,
            (last) => {
                this.dist = this.dist || dist(...start, ...stop);
                this.dir = this.dir || [0, 1].map(i => (stop[i] - start[i]) / this.dist);
                this.checkOps = this.checkOps || [0, 1].map(i => start[i] <= stop[i] ? min : max);

                return [0, 1].map(i => this.checkOps[i](last[i] + this.dir[i] * speed, stop[i]));
            },
            curr => abs(curr[0] - stop[0]) <= 0.01 && abs(curr[1] - stop[1]) <= 0.01,
            callback
        );

        this.start = start;
        this.stop = stop;
        this.speed = speed;
    }
}

class IterateAnimator extends Animator {
    constructor(drawFunction, seed, update, sentinel, callback) {
        super(
            () => drawFunction(this.value),
            [0, 0],
            (offset) => {
                this.value = update(this.value);
                return offset;
            },
            (_offset) => sentinel(this.value),
            callback
        )
        this.value = seed;
    }
}

class PauseAnimator extends IterateAnimator {
    constructor(drawFunction, frames, callback) {
        super(
            drawFunction,
            frames,
            (frames) => frames - 1,
            (frames) => frames <= 0,
            callback
        )
    }
}