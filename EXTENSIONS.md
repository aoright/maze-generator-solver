# 🚀 迷宫生成器扩展功能文档

这是第7、8、9阶段的完整功能说明文档。

## 📦 第7阶段：功能增强

### 7.1 数据导入导出

#### 导出JSON
```javascript
// 导出当前迷宫为JSON格式
MazeIO.exportToJSON(app.maze);
```

JSON格式包含：
- 迷宫尺寸
- 墙壁配置（压缩格式）
- 起点和终点
- 元数据（时间戳、版本等）

#### 导入JSON
```javascript
// 从JSON文件加载迷宫
const jsonData = '...'; // 从文件读取
const maze = MazeIO.importFromJSON(jsonData, app);
app.maze = maze;
app.renderer.setMaze(maze);
```

#### 导出SVG矢量图
```javascript
// 导出为可缩放的SVG格式
MazeIO.exportToSVG(app.maze, 20); // 20是单元格大小
```

SVG格式优点：
- 无损缩放
- 可用Illustrator/Inkscape编辑
- 适合打印

### 7.2 热力图可视化

显示算法访问频率：

```javascript
// 先求解迷宫
await app.solveMaze('bfs', 10);

// 显示热力图
const heatmap = new HeatmapVisualizer(app.renderer);
heatmap.show(app.maze);
```

**颜色说明：**
- 🔵 蓝色 = 访问次数少
- 🟡 黄色 = 访问次数中等
- 🔴 红色 = 访问次数多

**用途：**
- 分析算法效率
- 识别热点区域
- 对比不同算法

### 7.3 游戏模式 🎮

通过键盘手动求解迷宫：

```javascript
// 启动游戏模式
const game = new GameMode(app.maze, app.renderer);
game.start();

// 或者通过UI按钮
// 点击"游戏模式"按钮
```

**控制方式：**
- ⬆️ 上: `↑` 或 `W`
- ⬇️ 下: `↓` 或 `S`
- ⬅️ 左: `←` 或 `A`
- ➡️ 右: `→` 或 `D`

**功能：**
- 实时统计步数
- 记录耗时
- 绘制移动轨迹
- 到达终点时弹出祝贺

**停止游戏：**
```javascript
game.stop();
```

### 7.4 单步执行模式

逐步观察算法执行：

```javascript
// 准备单步模式
const stepMode = new StepByStepMode(solver, app.renderer);
await stepMode.prepare(app.maze);

// 下一步
stepMode.next();

// 上一步
stepMode.prev();

// 跳到指定步骤
stepMode.goto(50);
```

**用途：**
- 教学演示
- 算法调试
- 详细分析每一步

### 7.5 跳点搜索算法 (JPS)

A*的优化版本，速度更快：

```javascript
await app.solveMaze('jps', 10);
```

**特点：**
- 跳过对称路径
- 减少节点扩展
- 在网格地图上性能优异
- 仍保证最短路径

## 🎯 第8阶段：复杂迷宫

### 8.1 加权迷宫

不同格子有不同移动代价：

```javascript
// 创建加权迷宫
const weightedMaze = new WeightedMaze(20, 20);

// 随机设置权重 (1-5)
weightedMaze.generateRandomWeights(1, 5);

// 或使用柏林噪声生成自然地形
weightedMaze.generatePerlinWeights();

// 手动设置某个格子的权重
weightedMaze.setWeight(5, 10, 3); // row, col, weight
```

**权重说明：**
- 1 = 平地（快速）
- 2 = 草地
- 3 = 沙地
- 4 = 泥泞
- 5 = 岩石（缓慢）

**求解：**
使用Dijkstra或A*算法，会自动考虑权重。

### 8.2 六边形迷宫

六边形网格迷宫：

```javascript
// 创建六边形迷宫（半径为5）
const hexMaze = new HexMaze(5);

// 生成迷宫
hexMaze.generateMaze();

// 获取邻居（6个方向）
const neighbors = hexMaze.getNeighbors(cell);
```

**特点：**
- 每个格子有6个邻居
- 使用轴坐标系统 (q, r, s)
- 更自然的拓扑结构

**渲染：**
需要自定义渲染器绘制六边形。

### 8.3 无限迷宫

程序生成的无限大迷宫：

```javascript
// 创建无限迷宫
const infiniteMaze = new InfiniteMaze(16); // 区块大小16

// 按需生成和获取区块
const chunk = infiniteMaze.getChunk(0, 0);

// 获取任意位置的格子（自动生成区块）
const cell = infiniteMaze.getCell(100, 200);
```

**特点：**
- 使用种子确保确定性
- 分区块按需生成
- 理论上无限大
- 节省内存

**应用：**
- 探索游戏
- 程序生成内容
- 永无止境的挑战

## 🔬 第9阶段：概念展示

### 9.1 混沌理论演示

展示初始条件敏感性：

```javascript
const chaos = new ChaoticMazeDemo();
const result = chaos.demonstrateChaos(app.maze);

console.log(result.message);
// "混沌迷宫：微小的初始差异会导致完全不同的路径"
```

**概念：**
蝴蝶效应 - 微小的扰动（10^-10）导致完全不同的结果。

### 9.2 NP完全问题演示

展示计算复杂度：

```javascript
const result = NPCompleteDemo.hamiltonianPath(app.maze);

console.log(result.complexity);
// "O(400!) ≈ 6.41e+868"

console.log(result.feasible);
// false (对于20x20迷宫)
```

**哈密顿路径：**
访问每个格子恰好一次的路径。

**复杂度：**
- 10x10 (100格): 可行
- 20x20 (400格): 宇宙年龄都算不完
- NP完全问题

## 💡 使用示例

### 完整工作流程

```javascript
// 1. 生成迷宫
await app.generateMaze(20, 20, 'recursiveBacktracking', 10);

// 2. 求解
await app.solveMaze('astar', 10);

// 3. 查看热力图
const heatmap = new HeatmapVisualizer(app.renderer);
heatmap.show(app.maze);

// 4. 导出结果
MazeIO.exportToJSON(app.maze);
MazeIO.exportToSVG(app.maze);
MazeIO.exportToPNG(); // 原有功能

// 5. 启动游戏模式
const game = new GameMode(app.maze, app.renderer);
game.start();
```

### 对比多个算法

```javascript
// 对比BFS, DFS, A*的性能
await app.compareAlgorithms(['bfs', 'dfs', 'astar', 'jps'], 5);

// 查看控制台输出的性能表格
```

### 创建加权迷宫并求解

```javascript
// 1. 创建加权迷宫
const wm = new WeightedMaze(15, 15);
wm.generatePerlinWeights();

// 2. 生成墙壁结构
app.maze = wm;
const gen = new RecursiveBacktrackingGenerator(wm);
await gen.generate(0);

// 3. 使用Dijkstra求解（考虑权重）
app.renderer.setMaze(wm);
await app.solveMaze('dijkstra', 10);
```

### 六边形迷宫

```javascript
// 创建并生成六边形迷宫
const hexMaze = new HexMaze(8);
hexMaze.generateMaze();

console.log(`生成了 ${hexMaze.cells.size} 个六边形格子`);
console.log(`起点: (${hexMaze.start.q}, ${hexMaze.start.r})`);
console.log(`终点: (${hexMaze.end.q}, ${hexMaze.end.r})`);
```

### 无限迷宫探索

```javascript
// 创建无限迷宫
const infiniteMaze = new InfiniteMaze(16);

// 探索不同区域
for (let cx = 0; cx < 5; cx++) {
    for (let cy = 0; cy < 5; cy++) {
        const chunk = infiniteMaze.getChunk(cx, cy);
        console.log(`区块 (${cx},${cy}) 已生成`);
    }
}

// 访问远处的格子（自动生成）
const farCell = infiniteMaze.getCell(1000, 2000);
console.log('访问了坐标 (1000, 2000)');
```

## 🎨 UI功能

### 浏览器界面

**新增按钮：**

1. **导出JSON** - 保存迷宫配置
2. **导出SVG** - 导出矢量图
3. **热力图** - 可视化访问频率
4. **游戏模式** - 手动游玩

**使用方法：**

1. 生成一个迷宫
2. 点击相应按钮使用功能
3. 游戏模式下用键盘控制

### 控制台命令

所有功能都可以通过控制台直接调用：

```javascript
// 基础功能
app.generateMaze(30, 30, 'prim', 10);
app.solveMaze('astar', 10);

// 扩展功能
MazeIO.exportToJSON(app.maze);
MazeIO.exportToSVG(app.maze);

const heatmap = new HeatmapVisualizer(app.renderer);
heatmap.show(app.maze);

const game = new GameMode(app.maze, app.renderer);
game.start();

// 高级功能
const wm = new WeightedMaze(20, 20);
const hexMaze = new HexMaze(10);
const infiniteMaze = new InfiniteMaze(16);

// 演示
const chaos = new ChaoticMazeDemo();
NPCompleteDemo.hamiltonianPath(app.maze);
```

## 🏆 成就系统（概念）

虽然还未完全实现，但你可以手动追踪这些成就：

- 🥇 **迷宫新手** - 完成第一个迷宫
- 🏃 **速度玩家** - 游戏模式下30秒内完成
- 🎯 **完美路径** - 找到最短路径
- 🔬 **算法大师** - 尝试所有8种生成算法
- 🧩 **解谜专家** - 尝试所有7种求解算法
- 🌈 **主题收藏家** - 使用所有5种主题
- 📦 **数据管理员** - 导出JSON、SVG和PNG
- 🎮 **游戏玩家** - 完成10个游戏模式迷宫
- ♾️ **无限探索者** - 探索无限迷宫的100个区块
- 🔥 **热力大师** - 分析50个热力图

## ⚙️ 配置选项

所有功能都可以自定义：

```javascript
// 修改游戏模式配置
const game = new GameMode(app.maze, app.renderer);
game.trailColor = 'rgba(255, 0, 0, 0.5)'; // 红色轨迹
game.playerColor = '#00FF00'; // 绿色玩家

// 修改热力图颜色方案
const heatmap = new HeatmapVisualizer(app.renderer);
// 自定义颜色映射
heatmap.colorMap = (intensity) => {
    return `hsla(${intensity * 120}, 100%, 50%, 0.6)`; // 绿到红
};

// 调整无限迷宫的区块大小
const infiniteMaze = new InfiniteMaze(32); // 更大的区块

// 自定义权重范围
const wm = new WeightedMaze(20, 20);
wm.generateRandomWeights(1, 10); // 1-10范围
```

## 🐛 已知限制

1. **六边形迷宫** - 需要自定义渲染器
2. **无限迷宫** - 当前只支持标准迷宫生成
3. **游戏模式** - 没有计分系统
4. **热力图** - 必须先求解迷宫
5. **单步模式** - 预先计算所有步骤，大迷宫可能慢

## 🔮 未来扩展

更多可能的功能：

- 3D迷宫可视化
- 多人对战模式
- 迷宫编辑器
- 自动播放录像
- 在线分享
- 排行榜系统
- VR支持
- 声音效果
- 粒子特效
- 迷宫变形动画

## 📚 API参考

### MazeIO

- `exportToJSON(maze)` - 导出JSON
- `importFromJSON(jsonData, app)` - 导入JSON
- `exportToSVG(maze, cellSize)` - 导出SVG

### HeatmapVisualizer

- `constructor(renderer)` - 创建热力图
- `show(maze)` - 显示热力图

### GameMode

- `constructor(maze, renderer)` - 创建游戏
- `start()` - 开始游戏
- `stop()` - 停止游戏
- `getStats()` - 获取统计
- `render()` - 渲染游戏画面

### WeightedMaze

- `constructor(rows, cols)` - 创建加权迷宫
- `setWeight(row, col, weight)` - 设置权重
- `getWeight(row, col)` - 获取权重
- `generateRandomWeights(min, max)` - 随机权重
- `generatePerlinWeights()` - 噪声权重

### HexMaze

- `constructor(radius)` - 创建六边形迷宫
- `generateMaze()` - 生成迷宫
- `getNeighbors(cell)` - 获取邻居

### InfiniteMaze

- `constructor(chunkSize)` - 创建无限迷宫
- `getChunk(chunkX, chunkY)` - 获取区块
- `getCell(row, col)` - 获取格子

---

**享受探索吧！** 🚀

如有问题或建议，欢迎反馈。
