import assert from "assert";
import { greedySnakeMoveBarriers } from "../build/debug.js";

function idx2dct(i, j) {
  const x = j
  const y = 9 - i
  return [x, y]
}

function test(map, expected) {
  const rows = map.trim().split("\n")
  const snake = new Array(8).fill(-1)
  const fruit = []
  const barrier = []
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      const ch = rows[i].charAt(j)
      const [x, y] = idx2dct(i, j)
      if (ch === '1' || ch === '2' || ch === '3' || ch === '4') {
        const pos = ch.codePointAt(0) - '1'.codePointAt(0); // 0 <= pos <= 3
        snake[pos * 2] = x;
        snake[pos * 2 + 1] = y;
      } else if (ch === "*") {
        fruit.push(x);
        fruit.push(y);
      } else if (ch === "#") {
        barrier.push(x);
        barrier.push(y);
      }
    }
  }
  const actual = greedySnakeMoveBarriers(snake, fruit, barrier)
  assert.ok(expected.includes(actual), `Expected ${expected}, got ${actual}`)
}

test(`
+--------+
|*  #    |
|    #   |
|   #####|
|   #    |
|   #   1|
|   #   2|
|   #   3|
|   #   4|
+--------+
`, [-1]);

test(`
+--------+
|   #    |
|  #*#   |
|   #    |
|   #    |
|   #   1|
|   #   2|
|   #   3|
|####   4|
+--------+
`, [-1]);

test(`
+--------+
|*       |
|      ##|
|     ###|
|    ####|
|    ###1|
|       2|
|       3|
|       4|
+--------+
`, [-1]);

test(`
+--------+
|*    ###|
|     ###|
|     ###|
|        |
|        |
|      ##|
|     #14|
|      23|
+--------+
`, [3]);
