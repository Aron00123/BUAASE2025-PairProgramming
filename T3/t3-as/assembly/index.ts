// The entry file of your WebAssembly module.

export function add(a: i32, b: i32): i32 {
  return a + b;
}
// 辅助函数：判断方向是否反向
function isReverseDirection(currentDir: i32, newDir: i32): bool {
    const oppositeMap: Int32Array = new Int32Array(4); // 各方向的相反方向映射
    oppositeMap.set([2, 3, 0, 1]);
    return newDir === oppositeMap[currentDir];
  }
  
  // 推断当前移动方向（基于头与第二节的位置关系）
  function getCurrentDirection(headX: i32, headY: i32, secondX: i32, secondY: i32): i32 {
    const dx = headX - secondX;
    const dy = headY - secondY;
    if (dx === 1) return 3;  // 右
    if (dx === -1) return 1; // 左
    if (dy === 1) return 0;  // 上
    return 2;                // 下
  }
  
  function abs_val(a: i32): i32 {
    return a < 0 ? -a : a;
  }
  
  function is_out_of_bounds(x: i32, y: i32): bool {
    return (x < 1 || x > 8 || y < 1 || y > 8);
  }
  
  /**
  * @param snake
  * @param head_x_new 新蛇头的 x 坐标
  * @param head_y_new 新蛇头的 y 坐标
  */
  function collides(snake: Array<i32>, head_x_new: i32, head_y_new: i32): bool {
    // 只需判断新蛇头位置是否和旧蛇的第二节相撞
    if (snake[2] == head_x_new && snake[3] == head_y_new) {
        return true;
    }
  
    return false;
  }
  
  /**
  * @param snake 蛇当前状态，数组格式：[head_x, head_y, body1_x, body1_y, body2_x, body2_y, ...]
  * @param food  食物位置，数组格式：[food_x, food_y]
  * @returns 方向编码：0=上, 1=左, 2=下, 3=右
  */
  function greedyOtherSnakeMove(snake: Array<i32>, food: Array<i32>): i32 {
  
    let head_x = snake[0];
    let head_y = snake[1];
    let food_x = food[0];
    let food_y = food[1];
  
    let best_direction: i32 = -1;
    let best_distance: i32 = 0x7fffffff; // 一个很大的数
  
    for (let d: i32 = 0; d < 4; d++) {
        let head_x_new = head_x;
        let head_y_new = head_y;
  
        if (d == 0) {
            head_y_new = head_y + 1;
        } else if (d == 1) {
            head_x_new = head_x - 1;
        } else if (d == 2) {
            head_y_new = head_y - 1;
        } else if (d == 3) {
            head_x_new = head_x + 1;
        }
    
        if (is_out_of_bounds(head_x_new, head_y_new)) {
            continue;
        }
    
        if (collides(snake, head_x_new, head_y_new)) {
            continue;
        }
  
        // 计算曼哈顿距离
        let dist = abs_val(head_x_new - food_x) + abs_val(head_y_new - food_y);
    
        if (dist < best_distance) {
            best_distance = dist;
            best_direction = d;
        }
    }
  
    // 如果没有合法的移动方向，则返回 0（即上）
    if (best_direction == -1) {
        return 0;
    }
  
    return best_direction;
  }
  


// 定义辅助类型
export class Direction {
    dx: i32;
    dy: i32;
    code: i32;
    constructor(dx: i32, dy: i32, code: i32) {
      this.dx = dx;
      this.dy = dy;
      this.code = code;
    }
  }
  
  export class DangerPoint {
    x: i32;
    y: i32;
    weight: i32;
    constructor(x: i32, y: i32, weight: i32) {
      this.x = x;
      this.y = y;
      this.weight = weight;
    }
  }
  
  export class ScoredDirs {
    code: i32;
    score: f64;
    constructor(code: i32, score: f64) {
      this.code = code;
      this.score = score;
    }
  }
  
  
  // 主函数：贪心蛇步决策
  export function greedySnakeStep(
    board_size: i32,
    snake_body: Array<i32>,
    snake_num: i32,
    other_snakes: Array<i32>,
    fruit_num: i32,
    fruit_pos: Array<i32>,
    remaining_rounds: i32
  ): i32 {
    let headX = snake_body[0];
    let headY = snake_body[1];
    let secondX = snake_body[2];
    let secondY = snake_body[3];
  
    // 定义方向数组（上、左、下、右）
    let directions = new Array<Direction>();
    directions.push(new Direction(0, 1, 0));   // 上
    directions.push(new Direction(-1, 0, 1));  // 左
    directions.push(new Direction(0, -1, 2));  // 下
    directions.push(new Direction(1, 0, 3));   // 右
  
    // ===== 阶段1：确定基础候选方向 =====
    let currentDir = getCurrentDirection(headX, headY, secondX, secondY);
    let validDirs = new Array<i32>();
  
    // 用 for 循环代替 filter/map
    for (let i = 0; i < directions.length; i++) {
      let dir = directions[i];
      if (isReverseDirection(currentDir, dir.code)) continue;
      let newX = headX + dir.dx;
      let newY = headY + dir.dy;
      if (newX < 1 || newX > board_size || newY < 1 || newY > board_size) continue;
      let collision = false;
      // 检查蛇体第二、第三节（假设 snake_body 至少有 6 个元素）
      for (let j = 2; j < 6; j += 2) {
        if (j + 1 < snake_body.length && newX == snake_body[j] && newY == snake_body[j + 1]) {
          collision = true;
          break;
        }
      }
      if (collision) continue;
      validDirs.push(dir.code);
    }
  
    if (validDirs.length == 0) return currentDir; // 无合法方向时保持原方向
  
    // ===== 阶段2：威胁预测与优先级排序 =====
    let dangerMap = new Map<string, i32>();
  
    for (let s = 0; s < snake_num; s++) {
      // 每条蛇占用其他蛇数组中的 8 个数
      let start = s * 8;
      let snake = other_snakes.slice(start, start + 8);
      let otherDir = getCurrentDirection(snake[0], snake[1], snake[2], snake[3]);
      let dangerPoints = new Array<DangerPoint>();
      dangerPoints.push(new DangerPoint(snake[0], snake[1], 7)); // 头部
      dangerPoints.push(new DangerPoint(snake[2], snake[3], 5)); // 第二节
      dangerPoints.push(new DangerPoint(snake[4], snake[5], 3)); // 第三节
  
      let directionWeight = [0, 0, 0, 0];
      for (let i = 0; i < fruit_num; i++) {
        let fruitX = fruit_pos[i * 2];
        let fruitY = fruit_pos[i * 2 + 1];
        let dist = Math.abs(snake[0] - fruitX) + Math.abs(snake[1] - fruitY);
        // 计算距离权重
        let floatDistWeight = (2 * board_size - dist) / (2 * board_size);
        let distWeight = <i32>Math.floor(floatDistWeight);
        let tempDirection = greedyOtherSnakeMove(snake, fruit_pos);
        directionWeight[tempDirection] += distWeight;
      }
  
      for (let i = 0; i < 4; i++) {
        if (directionWeight[i] > 0) {
          let newX = snake[0] + directions[i].dx;
          let newY = snake[1] + directions[i].dy;
          dangerPoints.push(new DangerPoint(newX, newY, directionWeight[i] * 10));
        }
      }
  
      for (let i = 0; i < dangerPoints.length; i++) {
        let p = dangerPoints[i];
        let key = p.x.toString() + "," + p.y.toString();
        let currentWeight = dangerMap.has(key) ? dangerMap.get(key)! : 0;
        let maxWeight = currentWeight > p.weight ? currentWeight : p.weight;
        dangerMap.set(key, maxWeight);
      }
    }
  
    // ===== 阶段3：方向评分与选择 =====
    let scoredDirs = new Array<ScoredDirs>();
  
    for (let i = 0; i < validDirs.length; i++) {
      let dirCode = validDirs[i];
      let dir = directions[dirCode];
      let newX = headX + dir.dx;
      let newY = headY + dir.dy;
      let score: f64 = 0;
      let minFruitDist: i32 = 2147483647; // 用一个足够大的数字
  
      for (let i = 0; i < fruit_num; i++) {
        let fruitX = fruit_pos[i * 2];
        let fruitY = fruit_pos[i * 2 + 1];
        let dist = Math.abs(newX - fruitX) + Math.abs(newY - fruitY);
        if (dist < minFruitDist) {
          minFruitDist = i32(dist);
        }
      }
      score += 300 / (minFruitDist + 1);
  
      let dangerKey = newX.toString() + "," + newY.toString();
      if (dangerMap.has(dangerKey)) {
        let dangerLevel = dangerMap.get(dangerKey)!;
        score -= dangerLevel * 5;
        // 尝试逆向避让
        for (let s = 0; s < snake_num; s++) {
          let start = s * 8;
          let snake = other_snakes.slice(start, start + 8);
          let otherDir = getCurrentDirection(snake[0], snake[1], snake[2], snake[3]);
          if (dirCode == ((otherDir + 2) % 4)) {
            score += 15;
          }
        }
      }
  
      let edgeDist = Math.min(
        Math.min(newX - 1, board_size - newX),
        Math.min(newY - 1, board_size - newY)
      );
      score += edgeDist * 2;
  
      scoredDirs.push(new ScoredDirs(dirCode, score));
    }
  
    // 根据分数降序排序，若分数相同则按方向编号升序
    scoredDirs.sort((a: ScoredDirs, b: ScoredDirs): i32 => {
      if (a.score < b.score) return 1;
      else if (a.score > b.score) return -1;
      else return a.code - b.code;
    });
  
    return scoredDirs[0].code;
  }
  