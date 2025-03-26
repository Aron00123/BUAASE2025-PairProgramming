// assembly/index.ts

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
export function greedy_snake_move(snake: Array<i32>, food: Array<i32>): i32 {

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