Java Stream Survey
===========

1. Do your best to summarize (in English) the following Java and Python stream expressions. If you can't, let me know where you're stuck!

    1. ```map(lambda x: x * 2, [1, 2, 3, 4]```
    
    1. ```monkeys.stream().filter(monkey -> monkey.weight > 50).collect(Collectors.toList())```

    1. ```[ball.size * 4 for ball in ballPit if ball.color == "blue"]```

    1. ```clubWaitlist.stream().filter(Person::isLegal).takeWhile(Person::isCool).take(10)```

1. Do your best to complete the following methods using streams. Use pseudocode where you cannot remember syntax.
    ```
    class Ball {
        private Color color;
        private float size;

        public Color getColor() { return this.color; }
        public float getSize() { return this.size; }

        public bool isBig() { /* code hidden */ }
    }
    ...
        /**
        * This method takes a list of balls and should return their colors.
        */
        public static List<Color> colorsOfBalls(List<Ball> balls) {
            return /* code (i) here */;
        }

        /**
        * This method takes a list of many colors of balls, and returns the
        * sizes of the red ones.
        */
        public static List<Float> sizesOfRedBalls(List<Balls> balls) {
            return /* code (ii) here */;
        }
    ```

1. Of the things you can fully remember, what was the hardest to learn? Why?

1. Of the things you vaguelly recall, what stands out as the most confusing?

1. How comfortable are you with the terms `take`, `filter`, `map`, and `collect`?