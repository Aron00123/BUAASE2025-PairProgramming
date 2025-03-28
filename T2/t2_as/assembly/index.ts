// The entry file of your WebAssembly module.

class Queue<T> {
  private data: T[] = []
  private head: i32 = 0

  push(value: T): void {
    this.data.push(value)
  }

  pop(): T {
    const value = this.data[this.head]
    this.head++
    return value
  }

  empty(): bool {
    return this.head >= this.data.length
  }
}

enum Legend {
  CBORDER = '+'.codePointAt(0),
  HBORDER = '-'.codePointAt(0),
  VBORDER = '|'.codePointAt(0),
  BARRIER = '#'.codePointAt(0),
  SPACE = ' '.codePointAt(0),
  FRUIT = '*'.codePointAt(0),
  SNAKE4 = '4'.codePointAt(0),
  SNAKE1 = '1'.codePointAt(0),
  SNAKE2 = '2'.codePointAt(0),
  SNAKE3 = '3'.codePointAt(0),
}

/**
 *  1st dim.        y
 *  |               ^
 *  |               |
 *  |               |
 *  v               |
 *   ---> 2nd dim.  +---> x
 * 0: UP (y+)
 * 1: LEFT (x-)
 * 2: DOWN (y-)
 * 3: RIGHT (x+)
 */
const DX = [-1, 0, 1, 0]
const DY = [0, -1, 0, 1]
const INF = 100

function printMap(map: i32[][]): void {
  for (let i = 0; i < map.length; i++) {
    let row = ''
    for (let j = 0; j < map[i].length; j++) {
      row += String.fromCharCode(map[i][j])
    }
    console.log(row)
  }
}

function printDepth(depth: i32[][]): void {
  for (let i = 0; i < depth.length; i++) {
    console.log(depth[i].toString())
  }
}

function canMove(map: i32[][], x: i32, y: i32, d: i32): bool {
  switch (map[x][y]) {
    // Border
    case Legend.CBORDER:
    case Legend.HBORDER:
    case Legend.VBORDER:
    // Barrier
    case Legend.BARRIER:
      return false
    // Space
    case Legend.SPACE:
    // Fruit
    case Legend.FRUIT:
      return true
    // Snake
    case Legend.SNAKE4:
      return true
    case Legend.SNAKE3:
      return d >= 2
    case Legend.SNAKE2:
      return d >= 3
    case Legend.SNAKE1:
      return d >= 4
    default:
      throw new Error('Invalid map')
  }
}

export function greedySnakeMoveBarriers(snake: i32[], fruit: i32[], barrier: i32[]): i32 {
  const map = new Array<i32[]>(10)
  for (let i = 0; i < 10; i++) {
    map[i] = new Array<i32>(10).fill(Legend.SPACE)
  }
  map[0][0] = map[0][9] = map[9][0] = map[9][9] = Legend.CBORDER
  for (let i = 1; i < 9; i++) {
    map[0][i] = map[9][i] = Legend.HBORDER
    map[i][0] = map[i][9] = Legend.VBORDER
  }
  for (let i = 0; i < 4; i++) {
    const snake_x = snake[i * 2]
    const snake_y = snake[i * 2 + 1]
    map[snake_x][snake_y] = '0'.charCodeAt(0) + (i + 1)
    console.log(`snake ${i+1}: ${snake_x} ${snake_y}`)
  }
  const fruit_x = fruit[0]
  const fruit_y = fruit[1]
  map[fruit_x][fruit_y] = Legend.FRUIT
  for (let i = 0; i < 12; i++) {
    const barrier_x = barrier[i * 2]
    const barrier_y = barrier[i * 2 + 1]
    map[barrier_x][barrier_y] = Legend.BARRIER
  }
  printMap(map)

  const depth = new Array<i32[]>(10)
  for (let i = 0; i < 10; i++) {
    depth[i] = new Array<i32>(10).fill(INF)
  }
  depth[snake[0]][snake[1]] = 0

  const q = new Queue<i32[]>()
  q.push([snake[0], snake[1], 0])
  while (!q.empty()) {
    const item = q.pop()
    const x = item[0]
    const y = item[1]
    const d = item[2]
    if (x === fruit_x && y === fruit_y) {
      break
    }
    for (let i = 0; i < 4; i++) {
      const next_x = x + DX[i]
      const next_y = y + DY[i]
      if (depth[next_x][next_y] > d + 1 && canMove(map, next_x, next_y, d + 1)) {
        depth[next_x][next_y] = d + 1
        q.push([next_x, next_y, d + 1])
      }
    }
  }
  // printDepth(depth)
  if (depth[fruit_x][fruit_y] === INF) {
    return -1
  }
  for (let i = 0; i < 4; i++) {
    const next_x = snake[0] + DX[i]
    const next_y = snake[1] + DY[i]
    if (canMove(map, next_x, next_y, 1)) {
      console.log(next_x.toString() + ' ' + next_y.toString() + ' ' + i.toString())
      return i
    }
  }
  throw new Error('Invalid depth')
}
