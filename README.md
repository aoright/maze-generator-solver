# 迷宫生成与求解器 - 完整使用指南

[![Static Asset Validation CI](https://github.com/aoright/maze-generator-solver/actions/workflows/ci.yml/badge.svg)](https://github.com/aoright/maze-generator-solver/actions/workflows/ci.yml)

🌐 **在线体验 (Live Demo)**：[https://aoright.github.io/maze-generator-solver/](https://aoright.github.io/maze-generator-solver/)
🤖 **LLM & AI 开发者文档**：[`llms.txt`](./llms.txt)

---

### 🚀 交互式 Demo 演示链接 (Interactive Demo Links)

| 演示模块 | 说明 | 在线 Live Demo 链接 |
|---|---|---|
| 🎮 **主可视化器 (Main Visualizer)** | 2D/3D/4D、加权、量子、相对论等全功能可视化界面 | [开启体验](https://aoright.github.io/maze-generator-solver/index.html) |
| ⬡ **六边形迷宫 (Hexagonal Maze)** | 轴坐标系六边形网格生成与交互游戏 | [体验六边形迷宫](https://aoright.github.io/maze-generator-solver/test-hex-game.html) |
| ♾️ **无限程序化迷宫 (Infinite Maze)** | 无限 LOD 动态区块加载与生成 | [体验无限迷宫](https://aoright.github.io/maze-generator-solver/test-infinite-maze.html) |
| 🌀 **传送门迷宫 (Portal Maze)** | 非欧几里得传送门路径穿梭演示 | [体验传送门迷宫](https://aoright.github.io/maze-generator-solver/test-portal-game.html) |

---

## 目录

1. [快速开始](#快速开始)
2. [标准迷宫](#标准迷宫)
3. [第7阶段：高级扩展](#第7阶段高级扩展)
4. [第8阶段：复杂迷宫](#第8阶段复杂迷宫)
5. [第9阶段：超复杂迷宫](#第9阶段超复杂迷宫)
6. [API参考](#api参考)
7. [性能优化](#性能优化)

---

## 快速开始

### 基本使用流程

```html
<!-- 在浏览器中打开 index.html -->
```

1. **选择迷宫类型** - 从"迷宫类型"下拉菜单选择
2. **设置尺寸** - 调整行数和列数滑块
3. **选择生成算法** - 选择喜欢的迷宫生成算法
4. **点击"生成迷宫"** - 观看动画生成过程
5. **选择求解算法** - 选择路径搜索算法
6. **点击"求解迷宫"** - 观看求解动画

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `G` | 生成迷宫 |
| `S` | 求解迷宫 |
| `C` | 清除路径 |
| `R` | 重置迷宫 |
| `E` | 切换编辑模式 |
| `1-5` | 切换速度 |

---

## 标准迷宫

### 生成算法

#### 1. 递归回溯 (Recursive Backtracking) 最简单
- **特点**：生成的迷宫有很长的通道，难度适中
- **时间复杂度**：O(n²)
- **适用场景**：通用，平衡性好

```javascript
const maze = new Maze(20, 20);
const generator = new RecursiveBacktrackingGenerator(maze);
await generator.generate(10);
```

#### 2. Prim算法
- **特点**：生成的迷宫有很多短通道和分叉
- **时间复杂度**：O(n² log n)
- **适用场景**：需要复杂分支结构

#### 3. Kruskal算法
- **特点**：使用并查集，生成均匀的迷宫
- **时间复杂度**：O(n² α(n))
- **适用场景**：需要均匀分布的结构

#### 4. 递归分割 (Recursive Division)
- **特点**：从空房间开始添加墙壁
- **时间复杂度**：O(n²)
- **适用场景**：需要大房间和通道

#### 5. Wilson算法
- **特点**：基于循环擦除随机游走，生成无偏迷宫
- **时间复杂度**：O(n²)
- **适用场景**：需要统计均匀性

### 求解算法

#### 1. 广度优先搜索 (BFS)
- **保证最短路径**：
- **时间复杂度**：O(n²)
- **空间复杂度**：O(n²)
- **适用场景**：需要最短路径

```javascript
const solver = new BFSSolver(maze);
const result = await solver.solve(10);
console.log(`路径长度: ${result.path.length}`);
```

#### 2. 深度优先搜索 (DFS)
- **保证最短路径**：
- **时间复杂度**：O(n²)
- **空间复杂度**：O(n)
- **适用场景**：快速找到任意路径

#### 3. A* 算法 
- **保证最短路径**：
- **时间复杂度**：O(n² log n)
- **启发函数**：曼哈顿距离
- **适用场景**：最优性能

#### 4. Dijkstra算法
- **保证最短路径**：
- **支持加权迷宫**：
- **时间复杂度**：O(n² log n)
- **适用场景**：加权图、地形成本

#### 5. 双向BFS (Bidirectional BFS)
- **保证最短路径**：
- **时间复杂度**：O(n²)
- **加速效果**：2-4倍
- **适用场景**：大型迷宫

#### 6. 跳点搜索 (JPS)
- **保证最短路径**：
- **时间复杂度**：优于A*
- **加速效果**：10-50倍（网格迷宫）
- **适用场景**：大型网格迷宫

---

## 第7阶段：高级扩展

### 7.1 算法对比系统

同时运行多个算法并对比性能：

```javascript
const comparison = new MazeAdvancedExtensions.PathComparison(renderer);
const results = await comparison.compareAlgorithms(maze, ['bfs', 'dfs', 'astar', 'dijkstra'], 0);

console.table(results);
// 输出：
// ┌─────────────┬──────────┬────────────┬─────────┬───────┐
// │   algorithm │ time(ms) │ pathLength │ visited │ found │
// ├─────────────┼──────────┼────────────┼─────────┼───────┤
// │   bfs       │  145.23  │     87     │   156   │ true  │
// │   dfs       │   98.45  │    203     │   189   │ true  │
// │   astar     │   67.89  │     87     │    95   │ true  │
// │   dijkstra  │   89.12  │     87     │   134   │ true  │
// └─────────────┴──────────┴────────────┴─────────┴───────┘
```

### 7.2 距离图可视化

显示每个格子到终点的距离：

```javascript
const distanceMap = new MazeAdvancedExtensions.DistanceMapRenderer(renderer);
distanceMap.show(maze);
```

特点：
- 颜色渐变表示距离
- 数字标注准确距离
- 帮助理解路径规划

### 7.3 动画效果系统

#### 粒子效果

```javascript
const effects = new MazeAdvancedExtensions.AnimationEffects(renderer);

// 在某个位置创建粒子爆炸
effects.createParticleEffect(x, y, '#00ff00');

// 在动画循环中更新
function animate() {
    effects.updateParticles();
    requestAnimationFrame(animate);
}
```

#### 发光路径

```javascript
// 绘制发光的路径
effects.drawGlowPath(maze.path, '#00ffff');
```

#### 拖尾效果

```javascript
// 为当前访问的格子添加拖尾
effects.drawTrailEffect(currentCell, 0.5);
```

### 7.4 手动编辑器

```javascript
const editor = new MazeAdvancedExtensions.ManualEditor(maze, renderer);

// 启用编辑模式
editor.enable();

// 鼠标操作：
// - 左键拖动：绘制墙壁
// - 右键拖动：移除墙壁

// 生成预设图案
editor.generatePattern('spiral');  // 螺旋
editor.generatePattern('rooms');   // 房间
editor.generatePattern('cross');   // 十字
```

### 7.5 游戏模式

#### 迷雾探索模式

```javascript
const fogMode = new MazeAdvancedExtensions.FogOfWarMode(maze, renderer);
fogMode.start();

// 只能看到玩家周围2格的范围
fogMode.visibleRadius = 2;

// 使用方向键移动
// 探索过的区域会变暗但仍可见
```

#### 限时挑战模式

```javascript
const timeTrial = new MazeAdvancedExtensions.TimeTrialMode(maze, renderer, 60);
timeTrial.start();

// 60秒内到达终点
// 倒计时显示在屏幕上
// 时间到了自动失败
```

### 7.6 性能优化

#### 离屏Canvas

```javascript
const optimizer = new MazeAdvancedExtensions.PerformanceOptimizer(renderer);
const offscreen = optimizer.enableOffscreenCanvas();

// 先渲染到离屏Canvas，再复制到主Canvas
// 减少重绘开销
```

#### 视口渲染

```javascript
// 只渲染可见区域
optimizer.renderViewport(maze, viewX, viewY, viewWidth, viewHeight);

// 适用于大型迷宫（>100x100）
```

#### Web Worker异步生成

```javascript
// 在后台线程生成迷宫，不阻塞UI
const workerMaze = await optimizer.generateInWorker(maze, 'recursiveBacktracking');
```

### 7.7 算法教学系统

```javascript
const explainer = new MazeAdvancedExtensions.AlgorithmExplainer(renderer);

// 显示伪代码
const pseudocode = explainer.showPseudocode('bfs');
console.log(pseudocode);

// 可视化数据结构（队列/栈/优先队列）
explainer.visualizeDataStructure('queue', [cell1, cell2, cell3]);

// 单步执行
explainer.stepMode = true;
// 按空格键逐步执行算法

// 录制和回放
explainer.recordSession();
// ... 执行算法 ...
explainer.playback(); // 回放整个过程
```

---

## 第8阶段：复杂迷宫

### 8.1 多层3D迷宫

3个楼层，通过楼梯连接：

```javascript
const maze3D = new MazeComplex.MultiLayerMaze(20, 20, 3);
const renderer = new MazeComplexRenderers.MultiLayerRenderer(canvas, maze3D);

// 切换楼层
renderer.setLayer(0); // 第1层
renderer.setLayer(1); // 第2层
renderer.setLayer(2); // 第3层

// 切换视图模式
renderer.view3D = true;  // 等距3D视图
renderer.view3D = false; // 2D俯视图

// 生成迷宫（自动添加楼梯）
const generator = new RecursiveBacktrackingGenerator(maze3D);
await generator.generate(10);

// 求解（自动使用楼梯）
const solver = new AStarSolver(maze3D);
const result = await solver.solve(10);
```

特点：
- 起点在第1层，终点在第3层
- 约5%的格子有楼梯
- 支持层间导航
- 2.5D等距投影渲染

### 8.2 加权迷宫

不同地形有不同通过成本：

```javascript
const weightedMaze = new MazeComplex.WeightedMaze(20, 20);
const renderer = new MazeComplexRenderers.WeightedRenderer(canvas, weightedMaze);

// 地形类型（权重1-10）
// - 草地 (grass): 1-2
// - 水域 (water): 3-4
// - 森林 (forest): 5-6
// - 山地 (mountain): 7-8
// - 沙漠 (desert): 9-10

// 使用Perlin噪声生成自然地形
weightedMaze.initializeWeights();

// 必须使用Dijkstra或A*求解
const solver = new DijkstraSolver(weightedMaze);
await solver.solve(10);

// 显示/隐藏权重数字
renderer.showWeights = true;
```

颜色编码：
- 🟢 绿色：低成本（1-3）
- 🟡 黄色：中等成本（4-7）
- 🔴 红色：高成本（8-10）

### 8.3 动态迷宫

墙壁会实时变化：

```javascript
const dynamicMaze = new MazeComplex.DynamicMaze(20, 20);

// 启动更新循环
setInterval(() => {
    dynamicMaze.update(0.1); // delta time
    renderer.draw();
}, 100);

// 动态墙壁（周期性出现/消失）
// 10%的墙壁是动态的，周期3-7秒

// 移动墙壁（水平或垂直移动）
// 30%的行有移动墙壁

// 实时求解
const solver = new AStarSolver(dynamicMaze);
const result = await solver.solve(10);
// 路径可能在求解过程中失效，需要重新规划
```

应用场景：
- 塔防游戏
- 动态障碍物
- 时间相关的谜题

### 8.4 六边形迷宫

使用六边形网格：

```javascript
const hexMaze = new MazeComplex.HexMaze(15, 15);
const renderer = new MazeComplexRenderers.HexRenderer(canvas, hexMaze);

// 六边形有6个邻居
// 使用轴坐标系统 (axial coordinates)

// 生成和求解与标准迷宫相同
const generator = new RecursiveBacktrackingGenerator(hexMaze);
await generator.generate(10);

const solver = new AStarSolver(hexMaze);
await solver.solve(10);
```

特点：
- 6个方向而不是4个
- 更自然的路径
- 适合策略游戏

### 8.5 环形迷宫

极坐标系统的圆形迷宫：

```javascript
const circularMaze = new MazeComplex.CircularMaze(10, 24);
// 10个环，每个环24个扇区

const renderer = new MazeComplexRenderers.CircularRenderer(canvas, circularMaze);

// 起点在中心，终点在外环
// 可以沿切线方向和径向方向移动

renderer.innerRadius = 50;  // 内半径
renderer.ringWidth = 30;    // 环宽度
```

### 8.6 岛屿迷宫

多个岛屿通过桥梁连接：

```javascript
const islandMaze = new MazeComplex.IslandMaze(30, 30, 5);
// 5个随机岛屿

// 岛屿之间自动生成桥梁
// 水域格子不可通行（除非有桥）

// 渲染
const renderer = new Renderer(canvas, islandMaze);
renderer.draw();

// 岛屿显示为不同颜色
// 桥梁高亮显示
```

### 8.7 传送门迷宫

非欧几里得空间连接：

```javascript
const portalMaze = new MazeComplex.PortalMaze(20, 20, 6);
// 3对传送门（每对2个）

// 传送门自动配对
// 进入一个传送门，立即出现在配对的另一个传送门

// 传送门用不同颜色区分
// 求解算法自动处理传送门

const solver = new BFSSolver(portalMaze);
const result = await solver.solve(10);
```

---

## 第9阶段：超复杂迷宫

### 9.1 四维迷宫

4个维度的超立方体迷宫：

```javascript
const maze4D = new MazeAdvanced.Maze4D(5, 5, 3, 3);
// 5x5平面，3层深度，3个时间片

const renderer = new MazeComplexRenderers.Maze4DRenderer(canvas, maze4D);

// 显示4个2D切片
renderer.draw();

// 移动方向：上下左右 + 前后（深度） + 过去未来（时间）
// 8个邻居

// 切换时间片和深度片
renderer.currentTimeSlice = 1;
renderer.currentDepthSlice = 2;
```

可视化：
- 同时显示4个2D切片
- 每个切片代表时间-深度的组合
- 颜色编码不同维度

### 9.2 量子迷宫

量子力学效应：

```javascript
const quantumMaze = new MazeAdvanced.QuantumMaze(20, 20);
const renderer = new MazeComplexRenderers.QuantumRenderer(canvas, quantumMaze);

// 量子叠加态（20%的格子）
// 一个格子可能同时在多个位置

// 观测导致波函数塌缩
const position = quantumMaze.observe(cell);
// 观测后，格子坍缩到一个确定位置

// 量子隧穿（10%概率穿墙）
const canPass = quantumMaze.canTunnel(cell, 'top');

// 量子纠缠
quantumMaze.entangle(cell1, cell2);
// 观测cell1影响cell2的状态
```

可视化：
- 叠加态用模糊发光效果
- 虚线连接叠加态位置
- 显示概率百分比

### 9.3 相对论迷宫

引力和时空弯曲：

```javascript
const relativityMaze = new MazeAdvanced.RelativityMaze(20, 20);

// 随机分布质量（引力源）
// 黑洞（极强引力点）

// 计算时空度规
const metric = relativityMaze.getMetric(row, col);
// 接近黑洞时，度规增大

// 移动成本受引力影响
const cost = relativityMaze.getCost(cell1, cell2);
// 在强引力场中移动更困难

// 时间膨胀
const dilation = relativityMaze.getTimeDilation(cell);
// 接近黑洞时，时间变慢

// 光锥（因果律）
const reachable = relativityMaze.getLightCone(cell, maxDistance);
// 只能到达光锥内的格子
```

应用：
- 物理教学
- 引力效应演示
- 相对论概念可视化

### 9.4 停机问题迷宫

图灵机模拟：

```javascript
const haltingMaze = new MazeAdvanced.HaltingMaze(20, 20);

// 迷宫状态映射到图灵机带子
// 路径搜索就是图灵机计算

// 尝试判定是否会停机
const result = haltingMaze.willHalt();

if (result.halts === true) {
    console.log(`停机，步数：${result.steps}`);
} else if (result.halts === false) {
    console.log(`不停机，原因：${result.reason}`);
} else {
    console.log(`无法判定，原因：${result.reason}`);
}

// 可视化带子状态
const tape = haltingMaze.visualizeTape();
```

概念演示：
- 不可判定性
- 图灵完备性
- 计算理论

### 9.5 混沌迷宫

混沌理论和蝴蝶效应：

```javascript
const chaosMaze = new MazeAdvanced.ChaosMaze(20, 20);

// 洛伦兹吸引子生成混沌路径
// 每个格子有混沌值

// 蝴蝶效应：微小改变导致巨大差异
const change = chaosMaze.butterflyEffect(cell, 0.001);
console.log(`影响程度：${change}`);
// 改变会传播到邻居，指数放大

// 分形结构（曼德勃罗集）
const fractalCells = chaosMaze.generateFractal(100);
// 迭代次数越多，细节越丰富
```

可视化：
- 颜色表示混沌值
- 动画显示蝴蝶效应传播
- 分形图案

### 9.6 NP完全问题演示

```javascript
const npMaze = new MazeAdvanced.NPCompleteMaze(10, 10);

// 哈密顿路径问题
const hamiltonianPath = npMaze.findHamiltonianPath();
// 访问所有格子恰好一次
// NP完全问题，指数时间复杂度

if (hamiltonianPath) {
    console.log(`找到哈密顿路径，长度：${hamiltonianPath.length}`);
} else {
    console.log('不存在哈密顿路径');
}

// 旅行商问题（TSP）
const cities = [cell1, cell2, cell3, ...];
const tspRoute = npMaze.solveTSP(cities);
// 最短回路访问所有城市
// 使用贪心近似算法

// 子集和问题
const hasSubset = npMaze.subsetSum(target);
// 是否存在权重和为target的子集
```

### 9.7 无限迷宫

程序化生成的无限迷宫：

```javascript
const infiniteMaze = new MazeAdvanced.InfiniteMaze(20);
// 区块大小20x20

// 加载玩家周围的区块
infiniteMaze.loadChunksAround(playerRow, playerCol);

// 获取任意位置的格子（自动生成区块）
const cell = infiniteMaze.getCell(row, col);

// 种子确保确定性生成
infiniteMaze.seed = 12345;
// 相同种子和坐标总是生成相同迷宫

// 自动LOD管理
// 卸载远离的区块节省内存
infiniteMaze.viewDistance = 3; // 视距3个区块
```

特点：
- 理论上无限大
- 按需生成和卸载
- 确定性（可复现）
- 内存高效

---

## API参考

### 核心类

#### Maze

```javascript
const maze = new Maze(rows, cols);

// 属性
maze.rows          // 行数
maze.cols          // 列数
maze.grid          // 二维数组
maze.start         // 起点Cell
maze.end           // 终点Cell
maze.path          // 路径数组
maze.visitedCells  // 访问过的Cell数组

// 方法
maze.getCell(row, col)              // 获取格子
maze.isValid(row, col)              // 坐标是否有效
maze.getNeighbors(cell, checkWalls) // 获取邻居
maze.removeWall(cell1, cell2)       // 移除墙壁
maze.resetVisited()                 // 重置访问状态
maze.reconstructPath()              // 重建路径
```

#### Cell

```javascript
const cell = maze.grid[row][col];

// 属性
cell.row        // 行索引
cell.col        // 列索引
cell.walls      // {top, right, bottom, left}
cell.visited    // 是否已访问
cell.inPath     // 是否在路径上
cell.distance   // 距离起点的距离
cell.parent     // 父节点

// 方法
cell.reset()    // 重置状态
```

### 生成器

所有生成器继承自`MazeGenerator`：

```javascript
const generator = new RecursiveBacktrackingGenerator(maze);
generator.renderer = renderer; // 可选，用于动画

await generator.generate(speed);
// speed: 0=瞬间, 1-100=动画速度
```

### 求解器

所有求解器继承自`MazeSolver`：

```javascript
const solver = new BFSSolver(maze);
solver.renderer = renderer; // 可选，用于动画

const result = await solver.solve(speed);
// result: {found: boolean, path: Cell[]}
```

### 渲染器

```javascript
const renderer = new Renderer(canvas, maze);

// 方法
renderer.draw()                    // 绘制迷宫
renderer.drawCell(cell)            // 绘制单个格子
renderer.drawStartEnd()            // 绘制起点终点
renderer.exportPNG()               // 导出PNG
renderer.setTheme(themeName)       // 切换主题

// 主题
// 'classic', 'neon', 'nature', 'cyberpunk', 'minimal'
```

---

## 性能优化

### 大型迷宫（>100x100）

```javascript
// 1. 使用瞬间生成
await generator.generate(0);

// 2. 启用视口渲染
const optimizer = new PerformanceOptimizer(renderer);
optimizer.renderViewport(maze, viewX, viewY, viewWidth, viewHeight);

// 3. 使用Web Worker
const maze = await optimizer.generateInWorker(baseMaze, 'recursiveBacktracking');

// 4. 减少Canvas尺寸
canvas.width = 600;
canvas.height = 600;
```

### 动画性能

```javascript
// 1. 使用离屏Canvas
const offscreen = optimizer.enableOffscreenCanvas();

// 2. 限制帧率
let lastFrame = 0;
function animate(timestamp) {
    if (timestamp - lastFrame > 16) { // 60 FPS
        renderer.draw();
        lastFrame = timestamp;
    }
    requestAnimationFrame(animate);
}

// 3. 批量更新
renderer.beginBatch();
for (const cell of cells) {
    renderer.updateCell(cell);
}
renderer.endBatch();
```

### 内存优化

```javascript
// 1. 清理不需要的数据
maze.visitedCells = [];
maze.path = [];

// 2. 使用无限迷宫的LOD
infiniteMaze.viewDistance = 2; // 减少视距

// 3. 卸载复杂渲染器
renderer = null;
```

---

## 常见问题

### Q: 为什么动画不显示？

A: 检查速度设置，`speed=0`是瞬间生成，没有动画。使用`speed=10`观看动画。

### Q: 如何保存迷宫？

A: 使用导出功能：
```javascript
// JSON格式
const json = MazeExtensions.exportToJSON(maze);

// SVG格式
const svg = MazeExtensions.exportToSVG(maze);

// PNG图片
renderer.exportPNG();
```

### Q: 如何加载保存的迷宫？

A: 
```javascript
const json = '...'; // 从文件读取
const maze = MazeExtensions.importFromJSON(json);
```

### Q: 某些迷宫类型无法生成？

A: 部分复杂迷宫类型（六边形、环形等）需要特殊的生成算法。使用递归回溯或Prim算法。

### Q: 求解速度太慢？

A: 
1. 使用JPS或A*算法（最快）
2. 减小迷宫尺寸
3. 使用`speed=0`跳过动画

### Q: 如何自定义迷宫？

A: 使用手动编辑器：
```javascript
const editor = new ManualEditor(maze, renderer);
editor.enable();
// 左键绘制墙壁，右键移除墙壁
```

---

## 许可证

MIT License

---

## 联系方式

- 邮箱: aorightyan@gamil.com

---

**享受探索迷宫的乐趣！**
