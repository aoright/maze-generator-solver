/**
 * 第7阶段完整扩展功能
 * 高级可视化、交互增强、性能优化
 */

// ==================== 7.3 高级可视化 ====================

/**
 * 多路径对比系统
 */
class PathComparison {
    constructor(renderer) {
        this.renderer = renderer;
        this.results = [];
    }
    
    async compareAlgorithms(maze, algorithms, speed = 10) {
        this.results = [];
        const originalMaze = maze.clone();
        
        for (const alg of algorithms) {
            maze = originalMaze.clone();
            const solver = SolverFactory.create(alg, maze);
            solver.renderer = this.renderer;
            
            const startTime = performance.now();
            const result = await solver.solve(speed);
            const endTime = performance.now();
            
            this.results.push({
                algorithm: alg,
                time: (endTime - startTime).toFixed(2),
                pathLength: result.path.length,
                visited: maze.visitedCells.length,
                found: result.found
            });
        }
        
        this.displayComparison();
        return this.results;
    }
    
    displayComparison() {
        console.table(this.results);
        
        // 创建可视化对比
        const canvas = this.renderer.canvas;
        const ctx = this.renderer.ctx;
        
        // 绘制图表
        const chartX = 10;
        const chartY = canvas.height - 150;
        const barWidth = 40;
        const maxHeight = 100;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(chartX - 5, chartY - 110, this.results.length * (barWidth + 10) + 10, 120);
        
        this.results.forEach((result, i) => {
            const x = chartX + i * (barWidth + 10);
            const height = (result.pathLength / Math.max(...this.results.map(r => r.pathLength))) * maxHeight;
            
            // 绘制柱状图
            ctx.fillStyle = `hsl(${i * 60}, 70%, 50%)`;
            ctx.fillRect(x, chartY - height, barWidth, height);
            
            // 标签
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.fillText(result.algorithm.substring(0, 5), x, chartY + 15);
            ctx.fillText(result.pathLength, x + 5, chartY - height - 5);
        });
    }
}

/**
 * 距离图显示
 */
class DistanceMapRenderer {
    constructor(renderer) {
        this.renderer = renderer;
    }
    
    show(maze) {
        // 使用Dijkstra计算所有格子到终点的距离
        const distances = this.calculateDistances(maze);
        
        const ctx = this.renderer.ctx;
        const cellSize = this.renderer.cellSize;
        const maxDist = Math.max(...Array.from(distances.values()));
        
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const cell = maze.grid[row][col];
                const dist = distances.get(cell) || Infinity;
                
                if (dist !== Infinity) {
                    const intensity = 1 - (dist / maxDist);
                    const x = col * cellSize;
                    const y = row * cellSize;
                    
                    ctx.fillStyle = `rgba(0, ${Math.floor(intensity * 255)}, 255, 0.5)`;
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                    
                    // 显示数字
                    if (cellSize > 15) {
                        ctx.fillStyle = '#fff';
                        ctx.font = `${Math.floor(cellSize / 3)}px Arial`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(dist, x + cellSize / 2, y + cellSize / 2);
                    }
                }
            }
        }
        
        this.renderer.drawStartEnd();
    }
    
    calculateDistances(maze) {
        const distances = new Map();
        const pq = new PriorityQueue();
        
        distances.set(maze.end, 0);
        pq.enqueue(maze.end, 0);
        
        while (!pq.isEmpty()) {
            const current = pq.dequeue();
            const currentDist = distances.get(current);
            
            const neighbors = maze.getNeighbors(current, true);
            for (const neighbor of neighbors) {
                const newDist = currentDist + 1;
                if (!distances.has(neighbor) || newDist < distances.get(neighbor)) {
                    distances.set(neighbor, newDist);
                    pq.enqueue(neighbor, newDist);
                }
            }
        }
        
        return distances;
    }
}

/**
 * 动画效果系统
 */
class AnimationEffects {
    constructor(renderer) {
        this.renderer = renderer;
        this.particles = [];
    }
    
    // 粒子效果
    createParticleEffect(x, y, color = '#00ff00') {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                color
            });
        }
    }
    
    updateParticles() {
        const ctx = this.renderer.ctx;
        
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // 重力
            p.life -= 0.02;
            
            if (p.life > 0) {
                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                return true;
            }
            return false;
        });
        
        ctx.globalAlpha = 1.0;
    }
    
    // 发光效果
    drawGlowPath(path, color = '#00ffff') {
        const ctx = this.renderer.ctx;
        const cellSize = this.renderer.cellSize;
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        if (path.length > 0) {
            ctx.moveTo(
                path[0].col * cellSize + cellSize / 2,
                path[0].row * cellSize + cellSize / 2
            );
            
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(
                    path[i].col * cellSize + cellSize / 2,
                    path[i].row * cellSize + cellSize / 2
                );
            }
        }
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
    
    // 拖尾效果
    drawTrailEffect(cell, alpha = 0.5) {
        const ctx = this.renderer.ctx;
        const cellSize = this.renderer.cellSize;
        const x = cell.col * cellSize;
        const y = cell.row * cellSize;
        
        const gradient = ctx.createRadialGradient(
            x + cellSize / 2, y + cellSize / 2, 0,
            x + cellSize / 2, y + cellSize / 2, cellSize
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, cellSize, cellSize);
    }
}

// ==================== 7.4 手动绘制编辑器 ====================

/**
 * 迷宫手动编辑器
 */
class ManualEditor {
    constructor(maze, renderer) {
        this.maze = maze;
        this.renderer = renderer;
        this.active = false;
        this.drawMode = 'wall'; // 'wall', 'path', 'start', 'end'
        this.mouseDown = false;
    }
    
    enable() {
        this.active = true;
        const canvas = this.renderer.canvas;
        
        canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    disable() {
        this.active = false;
        // 移除事件监听器
    }
    
    handleMouseDown(e) {
        if (!this.active) return;
        this.mouseDown = true;
        
        if (e.button === 2) { // 右键
            this.drawMode = 'path';
        } else {
            this.drawMode = 'wall';
        }
        
        this.handleClick(e);
    }
    
    handleMouseMove(e) {
        if (!this.active || !this.mouseDown) return;
        this.handleClick(e);
    }
    
    handleMouseUp() {
        this.mouseDown = false;
    }
    
    handleClick(e) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.renderer.cellSize);
        const row = Math.floor(y / this.renderer.cellSize);
        
        if (this.maze.isValid(row, col)) {
            this.toggleWalls(row, col);
            this.renderer.draw();
        }
    }
    
    toggleWalls(row, col) {
        const cell = this.maze.grid[row][col];
        
        if (this.drawMode === 'wall') {
            // 添加墙壁
            cell.walls.top = true;
            cell.walls.right = true;
            cell.walls.bottom = true;
            cell.walls.left = true;
        } else if (this.drawMode === 'path') {
            // 移除墙壁
            cell.walls.top = false;
            cell.walls.right = false;
            cell.walls.bottom = false;
            cell.walls.left = false;
        }
    }
    
    // 预设图案
    generatePattern(type) {
        switch(type) {
            case 'spiral':
                this.generateSpiral();
                break;
            case 'rooms':
                this.generateRooms();
                break;
            case 'cross':
                this.generateCross();
                break;
        }
        this.renderer.draw();
    }
    
    generateSpiral() {
        this.maze.clearWalls();
        
        let x = Math.floor(this.maze.rows / 2);
        let y = Math.floor(this.maze.cols / 2);
        let dx = 0, dy = 1;
        let steps = 1;
        let stepCount = 0;
        let turnsInDirection = 0;
        
        for (let i = 0; i < this.maze.rows * this.maze.cols; i++) {
            if (this.maze.isValid(x, y)) {
                const cell = this.maze.grid[x][y];
                // 在螺旋路径两侧添加墙
                if (dx !== 0) {
                    cell.walls.top = true;
                    cell.walls.bottom = true;
                } else {
                    cell.walls.left = true;
                    cell.walls.right = true;
                }
            }
            
            x += dx;
            y += dy;
            stepCount++;
            
            if (stepCount === steps) {
                stepCount = 0;
                turnsInDirection++;
                
                // 转向
                const temp = dx;
                dx = -dy;
                dy = temp;
                
                if (turnsInDirection === 2) {
                    turnsInDirection = 0;
                    steps++;
                }
            }
        }
    }
    
    generateRooms() {
        this.maze.setAllWalls();
        
        const numRooms = 5;
        for (let i = 0; i < numRooms; i++) {
            const roomWidth = 3 + Math.floor(Math.random() * 4);
            const roomHeight = 3 + Math.floor(Math.random() * 4);
            const x = Math.floor(Math.random() * (this.maze.rows - roomWidth));
            const y = Math.floor(Math.random() * (this.maze.cols - roomHeight));
            
            // 清空房间
            for (let r = x; r < x + roomWidth; r++) {
                for (let c = y; c < y + roomHeight; c++) {
                    if (this.maze.isValid(r, c)) {
                        const cell = this.maze.grid[r][c];
                        if (r > x) cell.walls.top = false;
                        if (c > y) cell.walls.left = false;
                        if (r < x + roomWidth - 1) cell.walls.bottom = false;
                        if (c < y + roomHeight - 1) cell.walls.right = false;
                    }
                }
            }
        }
    }
    
    generateCross() {
        this.maze.setAllWalls();
        
        const centerX = Math.floor(this.maze.rows / 2);
        const centerY = Math.floor(this.maze.cols / 2);
        
        // 水平线
        for (let c = 0; c < this.maze.cols; c++) {
            if (this.maze.isValid(centerX, c)) {
                this.maze.grid[centerX][c].walls.left = false;
                this.maze.grid[centerX][c].walls.right = false;
            }
        }
        
        // 垂直线
        for (let r = 0; r < this.maze.rows; r++) {
            if (this.maze.isValid(r, centerY)) {
                this.maze.grid[r][centerY].walls.top = false;
                this.maze.grid[r][centerY].walls.bottom = false;
            }
        }
    }
}

// ==================== 7.5 扩展游戏模式 ====================

/**
 * 游戏模式基类（如果extensions.js未加载则定义）
 */
if (typeof GameMode === 'undefined') {
    window.GameMode = class GameMode {
        constructor(maze, renderer) {
            this.maze = maze;
            this.renderer = renderer;
            this.player = { row: maze.start.row, col: maze.start.col };
            this.active = false;
            // 绑定事件处理函数，确保可以正确移除
            this.boundHandleKeyPress = this.handleKeyPress.bind(this);
        }
        
        start() {
            this.active = true;
            document.addEventListener('keydown', this.boundHandleKeyPress);
            this.render();
            console.log('🎮 游戏模式已启动，玩家位置:', this.player);
        }
        
        stop() {
            this.active = false;
            document.removeEventListener('keydown', this.boundHandleKeyPress);
            console.log('🛑 游戏模式已停止');
        }
        
        handleKeyPress(e) {
            if (!this.active) {
                console.log('⚠️ 游戏模式未激活');
                return;
            }
            
            console.log('🎮 按下按键:', e.key);
            
            let newRow = this.player.row;
            let newCol = this.player.col;
            
            switch(e.key) {
                case 'ArrowUp': 
                    newRow--; 
                    e.preventDefault(); 
                    break;
                case 'ArrowDown': 
                    newRow++; 
                    e.preventDefault(); 
                    break;
                case 'ArrowLeft': 
                    newCol--; 
                    e.preventDefault(); 
                    break;
                case 'ArrowRight': 
                    newCol++; 
                    e.preventDefault(); 
                    break;
                default: return;
            }
            
            console.log('📍 尝试移动到:', newRow, newCol);
            
            if (this.maze.isValid(newRow, newCol)) {
                const current = this.maze.grid[this.player.row][this.player.col];
                const next = this.maze.grid[newRow][newCol];
                
                console.log('✅ 位置有效，当前格子:', current);
                
                // 检查墙壁
                const rowDiff = newRow - this.player.row;
                const colDiff = newCol - this.player.col;
                
                let blocked = false;
                if (current.walls) {
                    if (rowDiff === -1 && current.walls.top) blocked = true;
                    if (rowDiff === 1 && current.walls.bottom) blocked = true;
                    if (colDiff === -1 && current.walls.left) blocked = true;
                    if (colDiff === 1 && current.walls.right) blocked = true;
                    console.log('🧱 墙壁检查:', { walls: current.walls, blocked });
                } else {
                    console.log('⚠️ 当前格子没有walls属性');
                }
                
                // 量子隧穿：如果是量子迷宫，有小概率穿过墙壁
                if (blocked && this.maze.canTunnel) {
                    const direction = rowDiff === -1 ? 'top' : rowDiff === 1 ? 'bottom' : colDiff === -1 ? 'left' : 'right';
                    if (this.maze.canTunnel(current, direction)) {
                        blocked = false;
                        // 显示隧穿效果
                        this.showTunnelingEffect();
                    }
                }
                
                if (!blocked) {
                    this.player.row = newRow;
                    this.player.col = newCol;
                    console.log('✅ 移动成功！新位置:', this.player);
                    
                    // 量子观测：如果是量子迷宫，观测当前格子
                    if (this.maze.observe && next.quantumState && !next.quantumState.collapsed) {
                        console.log('⚛️ 观测量子态');
                        this.maze.observe(next);
                    }
                    
                    this.render();
                    
                    // 检查是否到达终点
                    if (this.maze.end && this.player.row === this.maze.end.row && 
                        this.player.col === this.maze.end.col) {
                        console.log('🎉 到达终点！');
                        this.onWin();
                    }
                } else {
                    console.log('🚫 被墙壁阻挡');
                }
            } else {
                console.log('❌ 位置无效');
            }
        }
        
        showTunnelingEffect() {
            // 显示隧穿特效
            const statusText = document.getElementById('statusText');
            if (statusText) {
                const originalText = statusText.textContent;
                statusText.textContent = '⚛️ 量子隧穿！';
                statusText.style.color = '#0ff';
                setTimeout(() => {
                    statusText.textContent = originalText;
                    statusText.style.color = '';
                }, 1000);
            }
        }
        
        render() {
            console.log('🎨 渲染游戏画面...');
            this.renderer.draw();
            
            // 绘制玩家
            const ctx = this.renderer.ctx || this.renderer.canvas.getContext('2d');
            const cellSize = this.renderer.cellSize;
            
            console.log('🖼️ Renderer信息:', { ctx: !!ctx, cellSize });
            
            if (!cellSize || !ctx) {
                console.error('❌ 无法获取ctx或cellSize');
                return;
            }
            
            const x = this.player.col * cellSize + cellSize / 2;
            const y = this.player.row * cellSize + cellSize / 2;
            
            console.log('👤 绘制玩家于:', { x, y, player: this.player });
            
            // 绘制玩家（金色圆圈和光晕）
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFD700';
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x, y, cellSize / 3, 0, Math.PI * 2);
            ctx.fill();
            
            // 外边框
            ctx.strokeStyle = '#FFA500';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            
            console.log('✅ 玩家绘制完成');
        }
        
        onWin() {
            alert('🎉 恭喜！你到达了终点！');
            this.stop();
        }
    }
}

/**
 * 迷雾探索模式
 */
class FogOfWarMode extends GameMode {
    constructor(maze, renderer) {
        super(maze, renderer);
        this.visibleRadius = 2;
        this.exploredCells = new Set();
    }
    
    render() {
        // 只渲染已探索的区域
        const ctx = this.renderer.ctx || this.renderer.canvas.getContext('2d');
        const cellSize = this.renderer.cellSize;
        
        if (!ctx || !cellSize) return;
        
        // 全黑背景
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
        
        // 绘制可见区域
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const dist = Math.abs(row - this.player.row) + Math.abs(col - this.player.col);
                
                if (dist <= this.visibleRadius) {
                    this.exploredCells.add(`${row},${col}`);
                }
                
                if (this.exploredCells.has(`${row},${col}`)) {
                    const alpha = dist <= this.visibleRadius ? 1.0 : 0.3;
                    ctx.globalAlpha = alpha;
                    
                    const cell = this.maze.grid[row][col];
                    // 检查是否有drawCell方法
                    if (this.renderer.drawCell) {
                        this.renderer.drawCell(cell);
                    } else {
                        // 如果没有drawCell，简单绘制
                        this.drawSimpleCell(cell, ctx, cellSize, alpha);
                    }
                }
            }
        }
        
        ctx.globalAlpha = 1.0;
        
        // 绘制玩家
        super.render();
    }
    
    drawSimpleCell(cell, ctx, cellSize, alpha) {
        const x = cell.col * cellSize;
        const y = cell.row * cellSize;
        
        ctx.fillStyle = `rgba(34, 34, 34, ${alpha})`;
        ctx.fillRect(x, y, cellSize, cellSize);
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        if (cell.walls && cell.walls.top) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
        }
        if (cell.walls && cell.walls.right) {
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls && cell.walls.bottom) {
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls && cell.walls.left) {
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + cellSize);
        }
        ctx.stroke();
    }
}

/**
 * 限时挑战模式
 */
class TimeTrialMode extends GameMode {
    constructor(maze, renderer, timeLimit = 60) {
        super(maze, renderer);
        this.timeLimit = timeLimit;
        this.timeRemaining = timeLimit;
        this.timerInterval = null;
    }
    
    start() {
        super.start();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            
            if (this.timeRemaining <= 0) {
                this.stop();
                alert('⏰ 时间到！挑战失败！');
            }
            
            this.updateTimer();
        }, 1000);
    }
    
    stop() {
        super.stop();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    updateTimer() {
        // 在Canvas上显示倒计时
        const ctx = this.renderer.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 100, 40);
        
        ctx.fillStyle = this.timeRemaining < 10 ? '#ff0000' : '#00ff00';
        ctx.font = 'bold 24px Arial';
        ctx.fillText(`⏱️ ${this.timeRemaining}s`, 20, 35);
    }
}

// ==================== 7.6 性能优化 ====================

/**
 * 性能优化器
 */
class PerformanceOptimizer {
    constructor(renderer) {
        this.renderer = renderer;
        this.offscreenCanvas = null;
        this.viewport = { x: 0, y: 0, width: 0, height: 0 };
    }
    
    // 使用离屏Canvas
    enableOffscreenCanvas() {
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvas.width = this.renderer.canvas.width;
        this.offscreenCanvas.height = this.renderer.canvas.height;
        
        return this.offscreenCanvas;
    }
    
    // 视口渲染（只渲染可见区域）
    renderViewport(maze, viewportX, viewportY, viewportWidth, viewportHeight) {
        const cellSize = this.renderer.cellSize;
        
        const startRow = Math.max(0, Math.floor(viewportY / cellSize));
        const endRow = Math.min(maze.rows, Math.ceil((viewportY + viewportHeight) / cellSize));
        const startCol = Math.max(0, Math.floor(viewportX / cellSize));
        const endCol = Math.min(maze.cols, Math.ceil((viewportX + viewportWidth) / cellSize));
        
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const cell = maze.grid[row][col];
                this.renderer.drawCell(cell);
            }
        }
    }
    
    // Web Worker生成（避免阻塞UI）
    generateInWorker(maze, algorithm) {
        return new Promise((resolve, reject) => {
            const workerCode = `
                self.onmessage = function(e) {
                    // 在Worker中生成迷宫
                    const maze = e.data.maze;
                    const algorithm = e.data.algorithm;
                    
                    // 执行生成算法
                    // ...
                    
                    self.postMessage({ maze });
                };
            `;
            
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            worker.onmessage = (e) => {
                resolve(e.data.maze);
                worker.terminate();
            };
            
            worker.onerror = reject;
            
            worker.postMessage({ maze, algorithm });
        });
    }
}

// ==================== 7.7 算法教学系统 ====================

/**
 * 算法解释器
 */
class AlgorithmExplainer {
    constructor(renderer) {
        this.renderer = renderer;
        this.currentLine = 0;
        this.dataStructures = {
            stack: [],
            queue: [],
            priorityQueue: []
        };
    }
    
    // 显示伪代码
    showPseudocode(algorithm) {
        const pseudocodes = {
            bfs: `
1. 创建队列Q，将起点加入Q
2. 标记起点为已访问
3. while Q不为空:
4.     出队节点current
5.     if current是终点:
6.         返回路径
7.     for each 未访问的邻居:
8.         标记为已访问
9.         设置父节点
10.        入队
11. 返回未找到`,
            dfs: `
1. 创建栈S，将起点压入S
2. 标记起点为已访问
3. while S不为空:
4.     弹出节点current
5.     if current是终点:
6.         返回路径
7.     for each 未访问的邻居:
8.         标记为已访问
9.         设置父节点
10.        压栈
11. 返回未找到`
        };
        
        return pseudocodes[algorithm] || '无伪代码';
    }
    
    // 显示数据结构状态
    visualizeDataStructure(type, data) {
        const canvas = this.renderer.canvas;
        const ctx = this.renderer.ctx;
        
        // 在Canvas右侧显示数据结构
        const x = canvas.width - 200;
        const y = 50;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, 180, 300);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(type.toUpperCase(), x + 10, y + 25);
        
        // 绘制数据
        ctx.font = '12px monospace';
        data.slice(0, 15).forEach((item, i) => {
            ctx.fillText(`[${i}] ${item}`, x + 10, y + 50 + i * 15);
        });
        
        if (data.length > 15) {
            ctx.fillText(`... (${data.length - 15} more)`, x + 10, y + 275);
        }
    }
    
    // 回放录制
    recordSession() {
        this.recording = [];
        // 记录每一步的状态
    }
    
    playback() {
        // 回放录制的会话
    }
}

// 导出所有功能
window.MazeAdvancedExtensions = {
    PathComparison,
    DistanceMapRenderer,
    AnimationEffects,
    ManualEditor,
    FogOfWarMode,
    TimeTrialMode,
    PerformanceOptimizer,
    AlgorithmExplainer
};

console.log('🎨 高级扩展功能已加载');
