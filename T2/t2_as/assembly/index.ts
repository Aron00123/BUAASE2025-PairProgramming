// The entry file of your WebAssembly module.

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

class SnakeMap {
  private data: i32[][] = []

  constructor(snake: i32[], fruit: i32[], barrier: i32[]) {
    this.data = new Array<i32[]>(10)
    for (let i = 0; i < 10; i++) {
      this.data[i] = new Array<i32>(10).fill(Legend.SPACE)
    }
    this.set(0, 0, Legend.CBORDER)
    this.set(0, 9, Legend.CBORDER)
    this.set(9, 0, Legend.CBORDER)
    this.set(9, 9, Legend.CBORDER)
    for (let i = 1; i < 9; i++) {
      this.set(i, 0, Legend.HBORDER)
      this.set(i, 9, Legend.HBORDER)
      this.set(0, i, Legend.VBORDER)
      this.set(9, i, Legend.VBORDER)
    }
    for (let i = 0; i < 4; i++) {
      const snake_x = snake[i * 2]
      const snake_y = snake[i * 2 + 1]
      this.set(snake_x, snake_y, '0'.charCodeAt(0) + (i + 1))
    }
    const fruit_x = fruit[0]
    const fruit_y = fruit[1]
    this.set(fruit_x, fruit_y, Legend.FRUIT)
    for (let i = 0; i < 12; i++) {
      const barrier_x = barrier[i * 2]
      const barrier_y = barrier[i * 2 + 1]
      this.set(barrier_x, barrier_y, Legend.BARRIER)
    }
  }

  get(x: i32, y: i32): i32 {
    return this.data[9 - y][x]
  }

  set(x: i32, y: i32, data: i32): void {
    this.data[9 - y][x] = data
  }

  print(): void {
    for (let i = 0; i < 10; i++) {
      let row = ''
      for (let j = 0; j < 10; j++) {
        row += String.fromCharCode(this.data[i][j])
      }
      console.log(row)
    }  
  }

  canMove(x: i32, y: i32, d: i32): bool {
    switch (this.get(x, y)) {
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
  
}

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
const DX = [0, -1, 0, 1]
const DY = [1, 0, -1, 0]
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


export function greedySnakeMoveBarriers(snake: i32[], fruit: i32[], barrier: i32[]): i32 {
  const map = new SnakeMap(snake, fruit, barrier)
  map.print()
  const fruit_x = fruit[0]
  const fruit_y = fruit[1]

  // TODO depth 和 src 合二为一
  const depth = new Array<i32[]>(10)
  for (let i = 0; i < 10; i++) {
    depth[i] = new Array<i32>(10).fill(INF)
  }
  depth[snake[0]][snake[1]] = 0

  // src[i][j] 表示来 (i, j) 时的方向
  const src = new Array<i32[]>(10)
  for (let i = 0; i < 10; i++) {
    src[i] = new Array<i32>(10).fill(-1)
  }

  // BFS
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
      if (depth[next_x][next_y] > d + 1 && map.canMove(next_x, next_y, d + 1)) {
        depth[next_x][next_y] = d + 1
        src[next_x][next_y] = i
        q.push([next_x, next_y, d + 1])
      }
    }
  }
  // printDepth(depth)
  if (depth[fruit_x][fruit_y] === INF) {
    return -1
  }
  let x = fruit_x
  let y = fruit_y
  let dir = -1
  while (x !== snake[0] || y !== snake[1]) {
    dir = src[x][y]
    x -= DX[dir]
    y -= DY[dir]
  }
  if (x === snake[0] && y === snake[1]) {
    return dir
  }
  throw new Error('Invalid depth')
}
