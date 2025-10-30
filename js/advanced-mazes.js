/**
 * 第9阶段：超复杂迷宫系统
 * 四维、量子、相对论、停机问题、混沌、NP完全、无限迷宫
 */

// ==================== 9.1 四维迷宫 ====================

/**
 * 四维迷宫类
 */
class Maze4D {
    constructor(rows, cols, depth, time) {
        this.rows = rows;
        this.cols = cols;
        this.depth = depth;
        this.time = time;
        this.grid4D = [];
        this.currentTimeSlice = 0;
        this.currentDepthSlice = 0;
        
        // 求解器所需属性
        this.visitedCells = [];
        this.path = [];
        
        this.initialize4DGrid();
    }
    
    initialize4DGrid() {
        this.grid4D = [];
        
        for (let t = 0; t < this.time; t++) {
            const timeSlice = [];
            for (let d = 0; d < this.depth; d++) {
                const depthSlice = [];
                for (let row = 0; row < this.rows; row++) {
                    const currentRow = [];
                    for (let col = 0; col < this.cols; col++) {
                        currentRow.push(new Cell4D(row, col, d, t));
                    }
                    depthSlice.push(currentRow);
                }
                timeSlice.push(depthSlice);
            }
            this.grid4D.push(timeSlice);
        }
        
        this.start = this.grid4D[0][0][0][0];
        this.end = this.grid4D[this.time - 1][this.depth - 1][this.rows - 1][this.cols - 1];
    }
    
    getCell4D(row, col, depth, time) {
        if (this.isValid4D(row, col, depth, time)) {
            return this.grid4D[time][depth][row][col];
        }
        return null;
    }
    
    isValid4D(row, col, depth, time) {
        return row >= 0 && row < this.rows &&
               col >= 0 && col < this.cols &&
               depth >= 0 && depth < this.depth &&
               time >= 0 && time < this.time;
    }
    
    getNeighbors4D(cell) {
        const neighbors = [];
        const directions = [
            { dr: -1, dc: 0, dd: 0, dt: 0 },  // 上
            { dr: 1, dc: 0, dd: 0, dt: 0 },   // 下
            { dr: 0, dc: -1, dd: 0, dt: 0 },  // 左
            { dr: 0, dc: 1, dd: 0, dt: 0 },   // 右
            { dr: 0, dc: 0, dd: -1, dt: 0 },  // 前（深度-）
            { dr: 0, dc: 0, dd: 1, dt: 0 },   // 后（深度+）
            { dr: 0, dc: 0, dd: 0, dt: -1 },  // 过去（时间-）
            { dr: 0, dc: 0, dd: 0, dt: 1 }    // 未来（时间+）
        ];
        
        for (const dir of directions) {
            const newRow = cell.row + dir.dr;
            const newCol = cell.col + dir.dc;
            const newDepth = cell.depth + dir.dd;
            const newTime = cell.time + dir.dt;
            
            if (this.isValid4D(newRow, newCol, newDepth, newTime)) {
                neighbors.push(this.grid4D[newTime][newDepth][newRow][newCol]);
            }
        }
        
        return neighbors;
    }
    
    // 将4D迷宫投影到3D（固定一个维度）
    get3DSlice(fixedDim, fixedValue) {
        const slice = [];
        
        if (fixedDim === 'time') {
            // 固定时间，返回3D空间切片
            for (let d = 0; d < this.depth; d++) {
                const depthLayer = [];
                for (let row = 0; row < this.rows; row++) {
                    const rowArray = [];
                    for (let col = 0; col < this.cols; col++) {
                        rowArray.push(this.grid4D[fixedValue][d][row][col]);
                    }
                    depthLayer.push(rowArray);
                }
                slice.push(depthLayer);
            }
        } else if (fixedDim === 'depth') {
            // 固定深度，返回时间-平面切片
            for (let t = 0; t < this.time; t++) {
                const timeLayer = [];
                for (let row = 0; row < this.rows; row++) {
                    const rowArray = [];
                    for (let col = 0; col < this.cols; col++) {
                        rowArray.push(this.grid4D[t][fixedValue][row][col]);
                    }
                    timeLayer.push(rowArray);
                }
                slice.push(timeLayer);
            }
        }
        
        return slice;
    }
    
    // 添加生成器所需的方法
    setAllWalls() {
        for (let t = 0; t < this.time; t++) {
            for (let d = 0; d < this.depth; d++) {
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        const cell = this.grid4D[t][d][row][col];
                        cell.walls.top = true;
                        cell.walls.bottom = true;
                        cell.walls.left = true;
                        cell.walls.right = true;
                        cell.walls.front = true;
                        cell.walls.back = true;
                        cell.walls.past = true;
                        cell.walls.future = true;
                    }
                }
            }
        }
    }
    
    clearWalls() {
        for (let t = 0; t < this.time; t++) {
            for (let d = 0; d < this.depth; d++) {
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        const cell = this.grid4D[t][d][row][col];
                        cell.walls.top = false;
                        cell.walls.bottom = false;
                        cell.walls.left = false;
                        cell.walls.right = false;
                        cell.walls.front = false;
                        cell.walls.back = false;
                        cell.walls.past = false;
                        cell.walls.future = false;
                    }
                }
            }
        }
    }
    
    getUnvisitedNeighbors(cell) {
        const neighbors = this.getNeighbors4D(cell);
        return neighbors.filter(n => !n.visited);
    }
    
    removeWall(cell1, cell2) {
        // 确定方向并移除墙壁
        if (cell1.row === cell2.row - 1 && cell1.col === cell2.col && 
            cell1.depth === cell2.depth && cell1.time === cell2.time) {
            // 上下相邻
            cell1.walls.bottom = false;
            cell2.walls.top = false;
        } else if (cell1.row === cell2.row + 1 && cell1.col === cell2.col && 
                   cell1.depth === cell2.depth && cell1.time === cell2.time) {
            cell1.walls.top = false;
            cell2.walls.bottom = false;
        } else if (cell1.col === cell2.col - 1 && cell1.row === cell2.row && 
                   cell1.depth === cell2.depth && cell1.time === cell2.time) {
            // 左右相邻
            cell1.walls.right = false;
            cell2.walls.left = false;
        } else if (cell1.col === cell2.col + 1 && cell1.row === cell2.row && 
                   cell1.depth === cell2.depth && cell1.time === cell2.time) {
            cell1.walls.left = false;
            cell2.walls.right = false;
        } else if (cell1.depth === cell2.depth - 1 && cell1.row === cell2.row && 
                   cell1.col === cell2.col && cell1.time === cell2.time) {
            // 深度前后相邻
            cell1.walls.back = false;
            cell2.walls.front = false;
        } else if (cell1.depth === cell2.depth + 1 && cell1.row === cell2.row && 
                   cell1.col === cell2.col && cell1.time === cell2.time) {
            cell1.walls.front = false;
            cell2.walls.back = false;
        } else if (cell1.time === cell2.time - 1 && cell1.row === cell2.row && 
                   cell1.col === cell2.col && cell1.depth === cell2.depth) {
            // 时间前后相邻
            cell1.walls.future = false;
            cell2.walls.past = false;
        } else if (cell1.time === cell2.time + 1 && cell1.row === cell2.row && 
                   cell1.col === cell2.col && cell1.depth === cell2.depth) {
            cell1.walls.past = false;
            cell2.walls.future = false;
        }
    }
    
    resetVisited() {
        for (let t = 0; t < this.time; t++) {
            for (let d = 0; d < this.depth; d++) {
                for (let row = 0; row < this.rows; row++) {
                    for (let col = 0; col < this.cols; col++) {
                        const cell = this.grid4D[t][d][row][col];
                        cell.visited = false;
                        cell.inPath = false;
                        cell.parent = null;
                        cell.distance = Infinity;
                    }
                }
            }
        }
        this.visitedCells = [];
        this.path = [];
    }
    
    reconstructPath() {
        this.path = [];
        let current = this.end;
        
        while (current) {
            current.inPath = true;
            this.path.unshift(current);
            current = current.parent;
        }
        
        return this.path;
    }
    
    // 为兼容性提供 getNeighbors 方法（调用 getNeighbors4D）
    getNeighbors(cell, checkWalls = false) {
        const neighbors = this.getNeighbors4D(cell);
        
        if (!checkWalls) {
            return neighbors;
        }
        
        // 过滤掉被墙壁阻挡的邻居
        return neighbors.filter(neighbor => {
            // 检查是否有墙阻挡
            if (cell.row === neighbor.row - 1 && cell.col === neighbor.col &&
                cell.depth === neighbor.depth && cell.time === neighbor.time) {
                return !cell.walls.bottom;
            }
            if (cell.row === neighbor.row + 1 && cell.col === neighbor.col &&
                cell.depth === neighbor.depth && cell.time === neighbor.time) {
                return !cell.walls.top;
            }
            if (cell.col === neighbor.col - 1 && cell.row === neighbor.row &&
                cell.depth === neighbor.depth && cell.time === neighbor.time) {
                return !cell.walls.right;
            }
            if (cell.col === neighbor.col + 1 && cell.row === neighbor.row &&
                cell.depth === neighbor.depth && cell.time === neighbor.time) {
                return !cell.walls.left;
            }
            if (cell.depth === neighbor.depth - 1 && cell.row === neighbor.row &&
                cell.col === neighbor.col && cell.time === neighbor.time) {
                return !cell.walls.back;
            }
            if (cell.depth === neighbor.depth + 1 && cell.row === neighbor.row &&
                cell.col === neighbor.col && cell.time === neighbor.time) {
                return !cell.walls.front;
            }
            if (cell.time === neighbor.time - 1 && cell.row === neighbor.row &&
                cell.col === neighbor.col && cell.depth === neighbor.depth) {
                return !cell.walls.future;
            }
            if (cell.time === neighbor.time + 1 && cell.row === neighbor.row &&
                cell.col === neighbor.col && cell.depth === neighbor.depth) {
                return !cell.walls.past;
            }
            return false;
        });
    }
}

/**
 * 4D格子类
 */
class Cell4D {
    constructor(row, col, depth, time) {
        this.row = row;
        this.col = col;
        this.depth = depth;
        this.time = time;
        this.walls = {
            top: true, bottom: true,
            left: true, right: true,
            front: true, back: true,
            past: true, future: true
        };
        this.visited = false;
        this.inPath = false;
        this.parent = null;
        this.distance = Infinity; // 用于Dijkstra等算法
    }
}

// ==================== 9.2 量子迷宫 ====================

/**
 * 量子迷宫类（叠加态）
 */
class QuantumMaze extends Maze {
    constructor(rows, cols) {
        super(rows, cols);
        this.quantumStates = new Map();
        this.collapsed = new Set();
        this.entangledPairs = [];
        this.tunnelingProbability = 0.12; // 12%的隧穿概率（降低难度）
        this.superpositionDensity = 0.7; // 70%的格子有叠加态（增加量子特性）
        
        this.initializeQuantumStates();
        this.createEntanglements();
    }
    
    initializeQuantumStates() {
        // 每个格子可能处于多个位置的叠加态（增加叠加态数量）
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                
                // 创建量子叠加态：格子可能同时存在于多个位置
                cell.quantumState = {
                    positions: [
                        { row, col, amplitude: 1.0, phase: 0 }
                    ],
                    collapsed: false
                };
                
                // 增加叠加态的数量和概率
                if (Math.random() < this.superpositionDensity) {
                    // 创建2-4个叠加态位置
                    const numPositions = 2 + Math.floor(Math.random() * 3);
                    
                    for (let i = 1; i < numPositions; i++) {
                        const distance = 3 + Math.floor(Math.random() * 5); // 距离3-7个格子
                        const angle = Math.random() * Math.PI * 2;
                        const altRow = Math.max(0, Math.min(this.rows - 1, 
                            Math.round(row + Math.cos(angle) * distance)));
                        const altCol = Math.max(0, Math.min(this.cols - 1, 
                            Math.round(col + Math.sin(angle) * distance)));
                        
                        cell.quantumState.positions.push({
                            row: altRow,
                            col: altCol,
                            amplitude: 0.3 + Math.random() * 0.4,
                            phase: Math.random() * Math.PI * 2
                        });
                    }
                    
                    // 归一化概率幅
                    this.normalizeAmplitudes(cell.quantumState);
                    
                    // 标记为量子叠加态
                    cell.isSuperposition = true;
                }
            }
        }
    }
    
    // 创建量子纠缠
    createEntanglements() {
        const entanglementCount = Math.floor(this.rows * this.cols * 0.15); // 15%的格子有纠缙（增加难度）
        
        for (let i = 0; i < entanglementCount; i++) {
            const row1 = Math.floor(Math.random() * this.rows);
            const col1 = Math.floor(Math.random() * this.cols);
            const row2 = Math.floor(Math.random() * this.rows);
            const col2 = Math.floor(Math.random() * this.cols);
            
            if (row1 !== row2 || col1 !== col2) {
                const cell1 = this.grid[row1][col1];
                const cell2 = this.grid[row2][col2];
                
                this.entangle(cell1, cell2);
                this.entangledPairs.push({ cell1, cell2 });
            }
        }
    }
    
    normalizeAmplitudes(state) {
        const sumSquared = state.positions.reduce((sum, pos) => 
            sum + pos.amplitude * pos.amplitude, 0);
        const norm = Math.sqrt(sumSquared);
        
        state.positions.forEach(pos => {
            pos.amplitude /= norm;
        });
    }
    
    // 观测导致波函数塌缩，并改变迷宫结构
    observe(cell) {
        if (cell.quantumState.collapsed) {
            return cell.quantumState.positions[0];
        }
        
        console.log('🔬 观测量子态，波函数即将塌缩...');
        
        // 根据概率幅随机选择一个位置
        const rand = Math.random();
        let cumulative = 0;
        
        for (const pos of cell.quantumState.positions) {
            cumulative += pos.amplitude * pos.amplitude; // 概率 = 概率幅的平方
            if (rand <= cumulative) {
                cell.quantumState.positions = [pos];
                cell.quantumState.collapsed = true;
                this.collapsed.add(cell);
                
                // 观测后改变迷宫结构！
                this.applyObservationEffect(cell);
                
                // 纠缠效应：观测导致纠缙对塌缩并同步改变
                if (cell.entangledWith && !cell.entangledWith.quantumState.collapsed) {
                    const entangled = cell.entangledWith;
                    if (entangled.quantumState.positions.length > 0) {
                        entangled.quantumState.positions = [entangled.quantumState.positions[0]];
                        entangled.quantumState.collapsed = true;
                        this.collapsed.add(entangled);
                        // 纠缙对也改变
                        this.applyObservationEffect(entangled);
                        console.log('🔗 纠缙对同步塌缩并改变！');
                    }
                }
                
                console.log('✨ 观测完成！迷宫结构已改变！');
                return pos;
            }
        }
        
        return cell.quantumState.positions[0];
    }
    
    // 观测后改变迷宫结构
    applyObservationEffect(cell) {
        // 60%概率打开一些墙壁，40%概率关闭一些墙壁
        const shouldOpen = Math.random() < 0.6;
        
        const directions = ['top', 'bottom', 'left', 'right'];
        const changedWalls = [];
        
        // 随机选择1-2个方向改变
        const numChanges = Math.random() < 0.5 ? 1 : 2;
        
        for (let i = 0; i < numChanges; i++) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const wasBlocked = cell.walls[dir];
            
            if (shouldOpen && wasBlocked) {
                // 打开墙壁
                cell.walls[dir] = false;
                changedWalls.push(`${dir}: 关闭→开启`);
                
                // 同步更新邻居的墙壁
                const neighbor = this.getNeighborInDirection(cell, dir);
                if (neighbor) {
                    const oppositeDir = this.getOppositeDirection(dir);
                    neighbor.walls[oppositeDir] = false;
                }
            } else if (!shouldOpen && !wasBlocked) {
                // 关闭墙壁
                cell.walls[dir] = true;
                changedWalls.push(`${dir}: 开启→关闭`);
                
                // 同步更新邻居的墙壁
                const neighbor = this.getNeighborInDirection(cell, dir);
                if (neighbor) {
                    const oppositeDir = this.getOppositeDirection(dir);
                    neighbor.walls[oppositeDir] = true;
                }
            }
        }
        
        if (changedWalls.length > 0) {
            console.log(`🔎 观测效应: 格子(${cell.row},${cell.col}) 的墙壁改变:`, changedWalls);
        }
    }
    
    // 获取指定方向的邻居
    getNeighborInDirection(cell, direction) {
        const offsets = {
            'top': { row: -1, col: 0 },
            'bottom': { row: 1, col: 0 },
            'left': { row: 0, col: -1 },
            'right': { row: 0, col: 1 }
        };
        
        const offset = offsets[direction];
        if (!offset) return null;
        
        const newRow = cell.row + offset.row;
        const newCol = cell.col + offset.col;
        
        if (this.isValid(newRow, newCol)) {
            return this.grid[newRow][newCol];
        }
        return null;
    }
    
    // 获取相反方向
    getOppositeDirection(direction) {
        const opposites = {
            'top': 'bottom',
            'bottom': 'top',
            'left': 'right',
            'right': 'left'
        };
        return opposites[direction];
    }
    
    // 量子纠缠：观测一个格子会影响另一个
    entangle(cell1, cell2) {
        cell1.entangledWith = cell2;
        cell2.entangledWith = cell1;
        cell1.isEntangled = true;
        cell2.isEntangled = true;
    }
    
    // 量子隧穿：有概率穿过墙壁
    canTunnel(cell, direction) {
        return Math.random() < this.tunnelingProbability;
    }
    
    // 重写getNeighbors以支持量子隧穿
    getNeighbors(cell, checkWalls = false) {
        const neighbors = super.getNeighbors(cell, checkWalls);
        
        // 如果不检查墙壁，直接返回
        if (!checkWalls) {
            return neighbors;
        }
        
        // 量子隧穿：有概率穿过墙壁到达被墙挡住的邻居
        const directions = [
            { row: -1, col: 0, wall: 'top' },
            { row: 0, col: 1, wall: 'right' },
            { row: 1, col: 0, wall: 'bottom' },
            { row: 0, col: -1, wall: 'left' }
        ];
        
        for (const dir of directions) {
            const newRow = cell.row + dir.row;
            const newCol = cell.col + dir.col;
            
            if (this.isValid(newRow, newCol)) {
                const neighbor = this.grid[newRow][newCol];
                
                // 如果有墙且可以隧穿，添加这个邻居
                if (cell.walls[dir.wall] && this.canTunnel(cell, dir.wall)) {
                    if (!neighbors.includes(neighbor)) {
                        neighbor.tunneled = true; // 标记为通过隧穿到达
                        neighbors.push(neighbor);
                    }
                }
            }
        }
        
        // 添加叠加态位置作为可能的邻居
        if (cell.quantumState && cell.quantumState.positions.length > 1) {
            for (let i = 1; i < cell.quantumState.positions.length; i++) {
                const pos = cell.quantumState.positions[i];
                if (this.isValid(pos.row, pos.col)) {
                    const superposedCell = this.grid[pos.row][pos.col];
                    if (!neighbors.includes(superposedCell)) {
                        superposedCell.fromSuperposition = true;
                        neighbors.push(superposedCell);
                    }
                }
            }
        }
        
        return neighbors;
    }
}

// ==================== 9.3 相对论迷宫 ====================

/**
 * 相对论迷宫类（时空扭曲）
 */
class RelativityMaze extends Maze {
    constructor(rows, cols) {
        super(rows, cols);
        this.massDistribution = [];
        this.blackHoles = [];
        this.eventHorizons = []; // 事件视界
        this.playerMoves = 0; // 玩家移动次数
        this.timeElapsed = 0; // 经过的“时间”
        
        this.initializeSpacetime();
    }
    
    initializeSpacetime() {
        // 初始化质量分布（模拟引力）
        this.massDistribution = [];
        for (let row = 0; row < this.rows; row++) {
            const massRow = [];
            for (let col = 0; col < this.cols; col++) {
                const mass = Math.random() * 5; // 背景质量
                massRow.push(mass);
                
                // 根据质量设置格子属性
                const cell = this.grid[row][col];
                cell.mass = mass;
                cell.timeDilation = 1.0; // 默认时间流速
            }
            this.massDistribution.push(massRow);
        }
        
        // 创建更多黑洞（极强引力点）
        const blackHoleCount = Math.floor(this.rows * this.cols * 0.08); // 增加到 8%
        for (let i = 0; i < blackHoleCount; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            const cell = this.grid[row][col];
            const mass = 5000 + Math.random() * 5000; // 巨大质量
            
            this.blackHoles.push({ row, col, mass });
            cell.isBlackHole = true;
            cell.mass = mass;
            cell.gravityStrength = mass / 1000;
            
            // 创建事件视界（不能进入的区域）
            const horizonRadius = 1.5;
            this.createEventHorizon(row, col, horizonRadius);
        }
        
        // 应用引力效应到周围格子
        this.applyGravitationalEffects();
        
        console.log(`✨ 创建了 ${blackHoleCount} 个黑洞`);
    }
    
    // 创建事件视界
    createEventHorizon(centerRow, centerCol, radius) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const distance = Math.sqrt(
                    Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2)
                );
                
                if (distance <= radius && distance > 0) {
                    const cell = this.grid[row][col];
                    cell.inEventHorizon = true;
                    cell.cannotEnter = true; // 不能进入
                    this.eventHorizons.push(cell);
                }
            }
        }
    }
    
    // 应用引力效应
    applyGravitationalEffects() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                const metric = this.getMetric(row, col);
                
                // 计算时间膨胀
                cell.timeDilation = this.getTimeDilation(cell);
                
                // 引力很强的区域标记为高引力区
                if (metric > 5) {
                    cell.isHighGravity = true;
                    cell.gravityCost = metric;
                }
            }
        }
    }
    
    // 计算时空度规（广义相对论）
    getMetric(row, col) {
        let curvature = 1.0;
        
        // 黑洞导致的时空弯曲
        for (const bh of this.blackHoles) {
            const distance = Math.sqrt(
                Math.pow(row - bh.row, 2) + 
                Math.pow(col - bh.col, 2)
            );
            
            if (distance > 0) {
                curvature += bh.mass / (distance * distance);
            }
        }
        
        return curvature;
    }
    
    // 计算移动成本（受引力影响）
    getCost(cell1, cell2) {
        const metric1 = this.getMetric(cell1.row, cell1.col);
        const metric2 = this.getMetric(cell2.row, cell2.col);
        
        // 在强引力场中移动更困难
        return (metric1 + metric2) / 2;
    }
    
    // 计算时间膨胀效应
    getTimeDilation(cell) {
        const metric = this.getMetric(cell.row, cell.col);
        // 在强引力场中时间流逝更慢
        if (metric <= 1) return 1.0;
        return Math.max(0.1, Math.sqrt(Math.abs(1 - 1/metric)));
    }
    
    // 重写getNeighbors实现引力偏折和事件视界
    getNeighbors(cell, checkWalls = false) {
        let neighbors = super.getNeighbors(cell, checkWalls);
        
        // 过滤掉事件视界内的格子（不能进入）
        neighbors = neighbors.filter(n => !n.cannotEnter);
        
        // 引力透镜效应：在高引力区域附近，路径会被扭曲
        if (cell.isHighGravity || this.isNearBlackHole(cell)) {
            // 有小概率被引力偏折到其他方向
            if (Math.random() < 0.3) {
                console.log('🌀 引力透镜！路径被扭曲！');
                // 添加一些意外的邻居（模拟空间扭曲）
                const extraNeighbors = this.getExtendedNeighbors(cell);
                neighbors = neighbors.concat(extraNeighbors);
            }
        }
        
        return neighbors;
    }
    
    // 判断是否靠近黑洞
    isNearBlackHole(cell) {
        for (const bh of this.blackHoles) {
            const distance = Math.sqrt(
                Math.pow(cell.row - bh.row, 2) + 
                Math.pow(cell.col - bh.col, 2)
            );
            if (distance < 3) return true;
        }
        return false;
    }
    
    // 获取扩展邻居（引力透镜效应）
    getExtendedNeighbors(cell) {
        const extended = [];
        const directions = [
            { row: -2, col: 0 },  // 远2格
            { row: 2, col: 0 },
            { row: 0, col: -2 },
            { row: 0, col: 2 },
            { row: -1, col: -1 }, // 对角
            { row: -1, col: 1 },
            { row: 1, col: -1 },
            { row: 1, col: 1 }
        ];
        
        for (const dir of directions) {
            const newRow = cell.row + dir.row;
            const newCol = cell.col + dir.col;
            
            if (this.isValid(newRow, newCol)) {
                const neighbor = this.grid[newRow][newCol];
                if (!neighbor.cannotEnter) {
                    extended.push(neighbor);
                }
            }
        }
        
        return extended.slice(0, 2); // 只返回2个随机的
    }
    
    // 光锥可视化（因果律）
    getLightCone(cell, maxDistance) {
        const reachable = [];
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const distance = Math.abs(row - cell.row) + Math.abs(col - cell.col);
                
                // 考虑时空弯曲的光锥
                const metric = this.getMetric(row, col);
                const effectiveDistance = distance * metric;
                
                if (effectiveDistance <= maxDistance) {
                    reachable.push(this.grid[row][col]);
                }
            }
        }
        
        return reachable;
    }
}

// ==================== 9.4 停机问题迷宫 ====================

/**
 * 停机问题迷宫（图灵机模拟）
 */
class HaltingMaze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.tape = [];
        this.head = 0;
        this.state = 'q0';
        this.transitions = new Map();
        this.haltingStates = new Set(['halt', 'accept', 'reject']);
        this.maxSteps = 1000; // 防止真正的无限循环
        
        this.initializeTuringMachine();
    }
    
    initializeTuringMachine() {
        // 初始化图灵机的带子
        this.tape = new Array(this.rows * this.cols).fill(0);
        
        // 定义转移函数（状态转移规则）
        // 格式: [当前状态, 读取符号] -> [新状态, 写入符号, 移动方向]
        this.transitions.set('q0-0', { state: 'q1', write: 1, move: 'R' });
        this.transitions.set('q0-1', { state: 'q0', write: 0, move: 'L' });
        this.transitions.set('q1-0', { state: 'q2', write: 1, move: 'R' });
        this.transitions.set('q1-1', { state: 'q1', write: 1, move: 'R' });
        this.transitions.set('q2-0', { state: 'q0', write: 0, move: 'L' });
        this.transitions.set('q2-1', { state: 'halt', write: 1, move: 'S' });
    }
    
    // 执行一步图灵机操作
    step() {
        if (this.haltingStates.has(this.state)) {
            return false; // 已停机
        }
        
        const symbol = this.tape[this.head];
        const key = `${this.state}-${symbol}`;
        const transition = this.transitions.get(key);
        
        if (!transition) {
            this.state = 'reject';
            return false; // 未定义的转移，拒绝
        }
        
        // 执行转移
        this.tape[this.head] = transition.write;
        this.state = transition.state;
        
        if (transition.move === 'R') {
            this.head = Math.min(this.head + 1, this.tape.length - 1);
        } else if (transition.move === 'L') {
            this.head = Math.max(this.head - 1, 0);
        }
        
        return true; // 继续运行
    }
    
    // 尝试判定是否会停机（不可判定问题）
    willHalt() {
        let steps = 0;
        const visited = new Set();
        
        while (steps < this.maxSteps) {
            const config = `${this.state}-${this.head}-${this.tape.join('')}`;
            
            if (visited.has(config)) {
                return { halts: false, reason: '检测到循环' };
            }
            
            visited.add(config);
            
            if (!this.step()) {
                return { 
                    halts: true, 
                    steps, 
                    finalState: this.state 
                };
            }
            
            steps++;
        }
        
        return { halts: 'unknown', reason: '超过最大步数' };
    }
    
    // 可视化带子状态
    visualizeTape() {
        const visualization = [];
        for (let i = 0; i < this.rows; i++) {
            const row = this.tape.slice(i * this.cols, (i + 1) * this.cols);
            visualization.push(row);
        }
        return visualization;
    }
}

// ==================== 9.5 混沌迷宫 ====================

/**
 * 混沌迷宫类（蝴蝶效应）
 */
class ChaosMaze extends Maze {
    constructor(rows, cols) {
        super(rows, cols);
        this.lorenzAttractor = { x: 0.1, y: 0, z: 0 };
        this.chaosHistory = [];
        this.sensitivity = 0.01; // 对初始条件的敏感度
        this.time = 0; // 时间变量
        this.unstableWalls = []; // 不稳定的墙壁
        this.chaoticVortices = []; // 混沌涡旋
        this.attractorTraps = []; // 吸引子陷阱
        this.fractalBoundaries = new Set(); // 分形边界
        
        this.initializeChaos();
        this.createChaoticFeatures();
    }
    
    initializeChaos() {
        // 使用洛伦兹吸引子生成混沌路径
        const sigma = 10, rho = 28, beta = 8/3;
        const dt = 0.01;
        
        for (let i = 0; i < this.rows * this.cols * 2; i++) {
            const { x, y, z } = this.lorenzAttractor;
            
            // 洛伦兹方程
            const dx = sigma * (y - x);
            const dy = x * (rho - z) - y;
            const dz = x * y - beta * z;
            
            this.lorenzAttractor.x += dx * dt;
            this.lorenzAttractor.y += dy * dt;
            this.lorenzAttractor.z += dz * dt;
            
            this.chaosHistory.push({ ...this.lorenzAttractor });
            
            // 映射到迷宫格子
            const row = Math.floor((y + 20) * this.rows / 40) % this.rows;
            const col = Math.floor((x + 20) * this.cols / 40) % this.cols;
            
            if (this.isValid(row, col)) {
                const cell = this.grid[row][col];
                cell.chaosValue = Math.sqrt(x*x + y*y + z*z);
                cell.lorenzPhase = Math.atan2(y, x); // 相位
                cell.chaoticEnergy = Math.abs(dx + dy + dz); // 能量
            }
        }
    }
    
    createChaoticFeatures() {
        // 1. 创建混沌涡旋（吸引子中心）
        const vortexCount = Math.floor(this.rows * this.cols * 0.05); // 5%
        for (let i = 0; i < vortexCount; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            this.chaoticVortices.push({
                row, col,
                strength: 2 + Math.random() * 3,
                radius: 2 + Math.random() * 3
            });
            this.grid[row][col].isVortex = true;
        }
        
        // 2. 创建吸引子陷阱（难以逃离）
        const trapCount = Math.floor(this.rows * this.cols * 0.03); // 3%
        for (let i = 0; i < trapCount; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            this.attractorTraps.push({ row, col, strength: 0.7 });
            this.grid[row][col].isAttractorTrap = true;
        }
        
        // 3. 生成分形边界（曼德博罗集）
        const fractalCells = this.generateFractal(50); // 更高迭代
        for (const cell of fractalCells) {
            this.fractalBoundaries.add(cell);
            cell.isFractalBoundary = true;
        }
        
        // 4. 创建不稳定墙壁（会随时间变化）
        const wallCount = Math.floor(this.rows * this.cols * 0.2); // 20%
        for (let i = 0; i < wallCount; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            const cell = this.grid[row][col];
            const direction = ['top', 'right', 'bottom', 'left'][Math.floor(Math.random() * 4)];
            
            this.unstableWalls.push({
                cell,
                direction,
                frequency: 0.1 + Math.random() * 0.3, // 频率
                phase: Math.random() * Math.PI * 2
            });
            cell.hasUnstableWall = true;
        }
        
        // 5. 应用混沌效应到迷宫结构
        this.applyChaoticEffects();
        
        console.log(`🌀 混沌迷宫: ${vortexCount}个涡旋, ${trapCount}个陷阱, ${fractalCells.size}个分形边界, ${wallCount}个不稳定墙壁`);
    }
    
    applyChaoticEffects() {
        // 根据混沌值调整墙壁
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                
                // 高混沌值的区域更复杂
                if (cell.chaosValue > 30) {
                    // 随机打开一些墙
                    if (Math.random() < 0.3) {
                        const dir = ['top', 'right', 'bottom', 'left'][Math.floor(Math.random() * 4)];
                        cell.walls[dir] = false;
                    }
                }
            }
        }
    }
    
    // 时间演化（墙壁动态变化）
    update(deltaTime = 0.1) {
        this.time += deltaTime;
        
        // 更新不稳定墙壁
        for (const wall of this.unstableWalls) {
            const oscillation = Math.sin(this.time * wall.frequency + wall.phase);
            // 根据正弦波决定墙壁状态
            wall.cell.walls[wall.direction] = oscillation > 0;
        }
    }
    
    // 蝴蝶效应：微小改变导致巨大差异
    butterflyEffect(cell, perturbation = 0.001) {
        const originalChaos = cell.chaosValue;
        cell.chaosValue += perturbation;
        
        // 传播影响到邻近格子（指数增长）
        const radius = 3;
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const newRow = cell.row + dr;
                const newCol = cell.col + dc;
                if (this.isValid(newRow, newCol)) {
                    const neighbor = this.grid[newRow][newCol];
                    const distance = Math.sqrt(dr*dr + dc*dc);
                    if (distance > 0) {
                        // 指数衰减但放大
                        const propagation = perturbation * Math.pow(2, radius - distance);
                        neighbor.chaosValue += propagation;
                    }
                }
            }
        }
        
        return Math.abs(cell.chaosValue - originalChaos);
    }
    
    // 重写getNeighbors实现混沌效应
    getNeighbors(cell, checkWalls = false) {
        // 求解阶段(checkWalls=true)时，完全遵循结构墙，不施加混沌扰动，确保可解性
        if (checkWalls) {
            return super.getNeighbors(cell, true);
        }
        
        let neighbors = super.getNeighbors(cell, false);
        
        // 1. 涡旋效应：路径被扭曲
        for (const vortex of this.chaoticVortices) {
            const distance = Math.sqrt(
                Math.pow(cell.row - vortex.row, 2) + 
                Math.pow(cell.col - vortex.col, 2)
            );
            
            if (distance < vortex.radius && distance > 0) {
                // 在涡旋附近，添加意外的邻居（模拟扭曲）
                if (Math.random() < vortex.strength * 0.2) {
                    const extraNeighbors = this.getVortexNeighbors(cell, vortex);
                    neighbors = neighbors.concat(extraNeighbors);
                }
            }
        }
        
        // 2. 吸引子陷阱/分形边界仅用于可视化和交互，不在非检查墙阶段强制阻挡
        return neighbors;
    }
    
    // 获取涡旋扭曲的邻居
    getVortexNeighbors(cell, vortex) {
        const extra = [];
        const angle = Math.atan2(cell.row - vortex.row, cell.col - vortex.col);
        const rotatedAngle = angle + Math.PI / 4; // 旋转45度
        
        // 根据旋转角度找到扭曲后的邻居
        const dr = Math.round(Math.sin(rotatedAngle) * 2);
        const dc = Math.round(Math.cos(rotatedAngle) * 2);
        
        const newRow = cell.row + dr;
        const newCol = cell.col + dc;
        
        if (this.isValid(newRow, newCol)) {
            extra.push(this.grid[newRow][newCol]);
        }
        
        return extra;
    }
    
    // 分形结构生成
    generateFractal(iterations = 5) {
        const fractalCells = new Set();
        
        const mandelbrot = (row, col) => {
            const x0 = (col / this.cols) * 3.5 - 2.5;
            const y0 = (row / this.rows) * 2.0 - 1.0;
            
            let x = 0, y = 0;
            let iteration = 0;
            
            while (x*x + y*y <= 4 && iteration < iterations) {
                const xtemp = x*x - y*y + x0;
                y = 2*x*y + y0;
                x = xtemp;
                iteration++;
            }
            
            return iteration;
        };
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const value = mandelbrot(row, col);
                this.grid[row][col].fractalValue = value;
                
                if (value < iterations) {
                    fractalCells.add(this.grid[row][col]);
                }
            }
        }
        
        return fractalCells;
    }
}

// ==================== 9.6 NP完全问题演示 ====================

/**
 * NP完全迷宫类
 */
class NPCompleteMaze extends Maze {
    constructor(rows, cols) {
        super(rows, cols);
        this.hamiltonianPath = null;
        this.tspRoute = null;
    }
    
    // 哈密顿路径问题（访问所有节点恰好一次）
    findHamiltonianPath() {
        const path = [];
        const visited = new Set();
        
        const backtrack = (cell) => {
            if (path.length === this.rows * this.cols) {
                return true; // 找到哈密顿路径
            }
            
            const neighbors = this.getNeighbors(cell, true);
            
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    path.push(neighbor);
                    
                    if (backtrack(neighbor)) {
                        return true;
                    }
                    
                    path.pop();
                    visited.remove(neighbor);
                }
            }
            
            return false;
        };
        
        visited.add(this.start);
        path.push(this.start);
        
        if (backtrack(this.start)) {
            this.hamiltonianPath = path;
            return path;
        }
        
        return null;
    }
    
    // 旅行商问题（最短回路）
    solveTSP(cities = null) {
        if (!cities) {
            // 随机选择一些城市
            cities = [];
            const cityCount = Math.min(10, Math.floor(this.rows * this.cols * 0.1));
            
            for (let i = 0; i < cityCount; i++) {
                const row = Math.floor(Math.random() * this.rows);
                const col = Math.floor(Math.random() * this.cols);
                cities.push(this.grid[row][col]);
            }
        }
        
        // 使用近似算法（最近邻）
        const route = [cities[0]];
        const unvisited = new Set(cities.slice(1));
        
        while (unvisited.size > 0) {
            const current = route[route.length - 1];
            let nearest = null;
            let minDist = Infinity;
            
            for (const city of unvisited) {
                const dist = Math.abs(current.row - city.row) + 
                            Math.abs(current.col - city.col);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = city;
                }
            }
            
            route.push(nearest);
            unvisited.delete(nearest);
        }
        
        this.tspRoute = route;
        return route;
    }
    
    // 子集和问题
    subsetSum(target) {
        const weights = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                weights.push(this.grid[row][col].chaosValue || (row + col));
            }
        }
        
        const dp = Array(target + 1).fill(false);
        dp[0] = true;
        
        for (const weight of weights) {
            for (let i = target; i >= weight; i--) {
                if (dp[i - weight]) {
                    dp[i] = true;
                }
            }
        }
        
        return dp[target];
    }
}

// ==================== 9.7 无限迷宫 ====================

/**
 * 生物群系类型
 */
const BiomeTypes = {
    NORMAL: { name: '普通', color: '#ffffff', difficulty: 1.0, wallDensity: 0.3, staminaDrain: 0.1 },
    FOREST: { name: '森林', color: '#2d5016', difficulty: 1.2, wallDensity: 0.4, fog: 3, staminaDrain: 0.2 },
    DESERT: { name: '沙漠', color: '#c2b280', difficulty: 1.3, wallDensity: 0.2, stamina: 1.5, staminaDrain: 0.3 },
    SNOW: { name: '雪地', color: '#e0f0ff', difficulty: 1.4, wallDensity: 0.35, slippery: true, staminaDrain: 0.25 },
    LAVA: { name: '岩浆', color: '#ff4500', difficulty: 2.0, wallDensity: 0.5, damage: 0.1, staminaDrain: 0.5 },
    SWAMP: { name: '毒沼', color: '#4a5d23', difficulty: 1.8, wallDensity: 0.45, slow: 0.5, staminaDrain: 0.4 },
    CRYSTAL: { name: '水晶', color: '#b19cd9', difficulty: 2.5, wallDensity: 0.6, teleport: true, staminaDrain: 0.3 },
    VOID: { name: '虚空', color: '#1a001a', difficulty: 3.0, wallDensity: 0.7, rotating: true, staminaDrain: 0.6 }
};

/**
 * 无限迷宫类（程序化生成）
 */
class InfiniteMaze {
    constructor(chunkSize = 20) {
        this.chunkSize = chunkSize;
        this.chunks = new Map(); // 存储已生成的区块
        this.seed = Math.random() * 10000;
        this.loadedChunks = new Set();
        this.viewDistance = 3; // 视距（以区块为单位）
        
        // 新增特性
        this.playerPos = { row: 0, col: 0 };
        this.collectedKeys = new Set(); // 收集的钥匙
        this.collectedFood = 0; // 收集的食物
        this.exploredCells = new Set(); // 已探索的格子
        this.portals = new Map(); // 传送门映射
        this.rotatingWalls = new Map(); // 旋转墙
        this.lastRotateTime = Date.now();
        this.timeElapsed = 0;
        this.stamina = 100; // 耐力系统
    }
    
    // 获取区块坐标
    getChunkCoords(row, col) {
        return {
            chunkRow: Math.floor(row / this.chunkSize),
            chunkCol: Math.floor(col / this.chunkSize)
        };
    }
    
    // 确定区块的生物群系
    getBiomeForChunk(chunkRow, chunkCol) {
        const distance = Math.sqrt(chunkRow * chunkRow + chunkCol * chunkCol);
        const hash = this.hashCoords(chunkRow, chunkCol, this.seed);
        const rand = Math.abs(hash % 100) / 100;
        
        // 根据距离和随机值确定生物群系
        if (distance < 2) return BiomeTypes.NORMAL;
        if (distance < 5) return rand > 0.7 ? BiomeTypes.FOREST : BiomeTypes.NORMAL;
        if (distance < 10) {
            if (rand > 0.8) return BiomeTypes.LAVA;
            if (rand > 0.6) return BiomeTypes.SWAMP;
            if (rand > 0.4) return BiomeTypes.SNOW;
            return BiomeTypes.DESERT;
        }
        if (distance < 15) {
            return rand > 0.5 ? BiomeTypes.CRYSTAL : BiomeTypes.LAVA;
        }
        return BiomeTypes.VOID;
    }
    
    // 生成区块
    generateChunk(chunkRow, chunkCol) {
        const key = `${chunkRow},${chunkCol}`;
        
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }
        
        // 确定生物群系
        const biome = this.getBiomeForChunk(chunkRow, chunkCol);
        
        // 使用种子和坐标生成确定性的随机迷宫
        const chunk = new Maze(this.chunkSize, this.chunkSize);
        const localSeed = this.hashCoords(chunkRow, chunkCol, this.seed);
        
        // 使用种子初始化随机数生成器
        Math.seedrandom(localSeed);
        
        // 根据难度调整生成器
        const distance = Math.sqrt(chunkRow * chunkRow + chunkCol * chunkCol);
        const difficulty = Math.min(3.0, 1.0 + distance * 0.1);
        
        // 生成迷宫（使用递归回溯）
        const generator = new RecursiveBacktrackingGenerator(chunk);
        generator.generate(0); // 瞬间生成
        
        // 根据生物群系特性调整迷宫
        this.applyBiomeFeatures(chunk, biome, chunkRow, chunkCol, difficulty);
        
        // 添加区块间的连接点
        this.createChunkConnections(chunk, chunkRow, chunkCol);
        
        // 保存生物群系信息
        chunk.biome = biome;
        chunk.chunkCoords = { row: chunkRow, col: chunkCol };
        chunk.difficulty = difficulty;
        
        this.chunks.set(key, chunk);
        this.loadedChunks.add(key);
        
        return chunk;
    }
    
    // 创建区块间的连接
    createChunkConnections(chunk, chunkRow, chunkCol) {
        // 确保区块边缘有通路，以便连接到相邻区块
        const directions = [
            { dr: -1, dc: 0, wall: 'top', opposite: 'bottom' },    // 上
            { dr: 0, dc: 1, wall: 'right', opposite: 'left' },    // 右
            { dr: 1, dc: 0, wall: 'bottom', opposite: 'top' },    // 下
            { dr: 0, dc: -1, wall: 'left', opposite: 'right' }    // 左
        ];
        
        for (const dir of directions) {
            const neighborKey = `${chunkRow + dir.dr},${chunkCol + dir.dc}`;
            
            // 如果相邻区块已存在，确保两个区块之间有连接
            if (this.chunks.has(neighborKey)) {
                const neighborChunk = this.chunks.get(neighborKey);
                
                // 在边界上创建连接点
                if (dir.wall === 'top') {
                    // 与上方区块连接
                    const connectCol = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[0][connectCol].walls.top = false;
                    neighborChunk.grid[this.chunkSize - 1][connectCol].walls.bottom = false;
                } else if (dir.wall === 'right') {
                    // 与右方区块连接
                    const connectRow = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[connectRow][this.chunkSize - 1].walls.right = false;
                    neighborChunk.grid[connectRow][0].walls.left = false;
                } else if (dir.wall === 'bottom') {
                    // 与下方区块连接
                    const connectCol = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[this.chunkSize - 1][connectCol].walls.bottom = false;
                    neighborChunk.grid[0][connectCol].walls.top = false;
                } else if (dir.wall === 'left') {
                    // 与左方区块连接
                    const connectRow = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[connectRow][0].walls.left = false;
                    neighborChunk.grid[connectRow][this.chunkSize - 1].walls.right = false;
                }
            } else {
                // 如果相邻区块不存在，确保当前区块边界上有潜在连接点
                // 这样当相邻区块生成时可以连接
                if (dir.wall === 'top') {
                    // 在顶部边缘创建一个开放点
                    const connectCol = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[0][connectCol].walls.top = false;
                } else if (dir.wall === 'right') {
                    // 在右边缘创建一个开放点
                    const connectRow = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[connectRow][this.chunkSize - 1].walls.right = false;
                } else if (dir.wall === 'bottom') {
                    // 在底边缘创建一个开放点
                    const connectCol = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[this.chunkSize - 1][connectCol].walls.bottom = false;
                } else if (dir.wall === 'left') {
                    // 在左边缘创建一个开放点
                    const connectRow = Math.floor(Math.random() * this.chunkSize);
                    chunk.grid[connectRow][0].walls.left = false;
                }
            }
        }
    }
    
    // 确保所有相邻区块正确连接
    ensureAllConnections() {
        // 遍历所有已加载的区块
        for (const [key, chunk] of this.chunks) {
            const [chunkRow, chunkCol] = key.split(',').map(Number);
            
            // 检查并确保与相邻区块的连接
            const directions = [
                { dr: -1, dc: 0, wall: 'top', oppositeWall: 'bottom' },    // 上
                { dr: 0, dc: 1, wall: 'right', oppositeWall: 'left' },     // 右
                { dr: 1, dc: 0, wall: 'bottom', oppositeWall: 'top' },     // 下
                { dr: 0, dc: -1, wall: 'left', oppositeWall: 'right' }     // 左
            ];
            
            for (const dir of directions) {
                const neighborKey = `${chunkRow + dir.dr},${chunkCol + dir.dc}`;
                
                // 如果相邻区块存在
                if (this.chunks.has(neighborKey)) {
                    const neighborChunk = this.chunks.get(neighborKey);
                    
                    // 确保连接正确
                    if (dir.wall === 'top') {
                        // 确保与上方区块连接
                        let connected = false;
                        for (let col = 0; col < this.chunkSize; col++) {
                            if (!chunk.grid[0][col].walls.top && 
                                !neighborChunk.grid[this.chunkSize - 1][col].walls.bottom) {
                                connected = true;
                                break;
                            }
                        }
                        
                        // 如果没有连接，则创建一个
                        if (!connected) {
                            const connectCol = Math.floor(Math.random() * this.chunkSize);
                            chunk.grid[0][connectCol].walls.top = false;
                            neighborChunk.grid[this.chunkSize - 1][connectCol].walls.bottom = false;
                        }
                    } else if (dir.wall === 'right') {
                        // 确保与右方区块连接
                        let connected = false;
                        for (let row = 0; row < this.chunkSize; row++) {
                            if (!chunk.grid[row][this.chunkSize - 1].walls.right && 
                                !neighborChunk.grid[row][0].walls.left) {
                                connected = true;
                                break;
                            }
                        }
                        
                        // 如果没有连接，则创建一个
                        if (!connected) {
                            const connectRow = Math.floor(Math.random() * this.chunkSize);
                            chunk.grid[connectRow][this.chunkSize - 1].walls.right = false;
                            neighborChunk.grid[connectRow][0].walls.left = false;
                        }
                    } else if (dir.wall === 'bottom') {
                        // 确保与下方区块连接
                        let connected = false;
                        for (let col = 0; col < this.chunkSize; col++) {
                            if (!chunk.grid[this.chunkSize - 1][col].walls.bottom && 
                                !neighborChunk.grid[0][col].walls.top) {
                                connected = true;
                                break;
                            }
                        }
                        
                        // 如果没有连接，则创建一个
                        if (!connected) {
                            const connectCol = Math.floor(Math.random() * this.chunkSize);
                            chunk.grid[this.chunkSize - 1][connectCol].walls.bottom = false;
                            neighborChunk.grid[0][connectCol].walls.top = false;
                        }
                    } else if (dir.wall === 'left') {
                        // 确保与左方区块连接
                        let connected = false;
                        for (let row = 0; row < this.chunkSize; row++) {
                            if (!chunk.grid[row][0].walls.left && 
                                !neighborChunk.grid[row][this.chunkSize - 1].walls.right) {
                                connected = true;
                                break;
                            }
                        }
                        
                        // 如果没有连接，则创建一个
                        if (!connected) {
                            const connectRow = Math.floor(Math.random() * this.chunkSize);
                            chunk.grid[connectRow][0].walls.left = false;
                            neighborChunk.grid[connectRow][this.chunkSize - 1].walls.right = false;
                        }
                    }
                }
            }
        }
    }
    
    // 应用生物群系特性
    applyBiomeFeatures(chunk, biome, chunkRow, chunkCol, difficulty) {
        // 增加墙壁密度
        if (Math.random() < biome.wallDensity * difficulty) {
            for (let i = 0; i < chunk.rows * chunk.cols * 0.1; i++) {
                const row = Math.floor(Math.random() * chunk.rows);
                const col = Math.floor(Math.random() * chunk.cols);
                const cell = chunk.grid[row][col];
                
                // 随机封闭一面墙
                const walls = ['top', 'right', 'bottom', 'left'];
                const wall = walls[Math.floor(Math.random() * 4)];
                cell.walls[wall] = true;
            }
        }
        
        // 添加钥匙和锁
        if (Math.random() < 0.3) {
            const keyRow = Math.floor(Math.random() * chunk.rows);
            const keyCol = Math.floor(Math.random() * chunk.cols);
            chunk.grid[keyRow][keyCol].hasKey = `key_${chunkRow}_${chunkCol}`;
        }
        
        // 添加食物
        if (Math.random() < 0.4) {
            const foodRow = Math.floor(Math.random() * chunk.rows);
            const foodCol = Math.floor(Math.random() * chunk.cols);
            chunk.grid[foodRow][foodCol].hasFood = true;
        }
        
        // 添加传送门
        if (biome.teleport && Math.random() < 0.2) {
            const portalRow = Math.floor(Math.random() * chunk.rows);
            const portalCol = Math.floor(Math.random() * chunk.cols);
            const globalPos = this.chunkToGlobal(chunkRow, chunkCol, portalRow, portalCol);
            
            // 随机传送到附近区块
            const targetChunkRow = chunkRow + Math.floor(Math.random() * 6) - 3;
            const targetChunkCol = chunkCol + Math.floor(Math.random() * 6) - 3;
            const targetRow = Math.floor(Math.random() * this.chunkSize);
            const targetCol = Math.floor(Math.random() * this.chunkSize);
            const targetGlobal = this.chunkToGlobal(targetChunkRow, targetChunkCol, targetRow, targetCol);
            
            chunk.grid[portalRow][portalCol].portal = targetGlobal;
            this.portals.set(`${globalPos.row},${globalPos.col}`, targetGlobal);
        }
        
        // 添加需要钥匙的门
        if (Math.random() < 0.1) {
            const doorRow = Math.floor(Math.random() * chunk.rows);
            const doorCol = Math.floor(Math.random() * chunk.cols);
            chunk.grid[doorRow][doorCol].hasLockedDoor = true;
        }
        
        // 添加旋转墙（虚空生物群系）
        if (biome.rotating) {
            for (let row = 0; row < chunk.rows; row++) {
                for (let col = 0; col < chunk.cols; col++) {
                    if (Math.random() < 0.15) {
                        const globalPos = this.chunkToGlobal(chunkRow, chunkCol, row, col);
                        this.rotatingWalls.set(`${globalPos.row},${globalPos.col}`, {
                            cell: chunk.grid[row][col],
                            phase: Math.random() * Math.PI * 2
                        });
                    }
                }
            }
        }
    }
    
    // 区块坐标转全局坐标
    chunkToGlobal(chunkRow, chunkCol, localRow, localCol) {
        return {
            row: chunkRow * this.chunkSize + localRow,
            col: chunkCol * this.chunkSize + localCol
        };
    }
    
    // 哈希函数（确保相同坐标总是生成相同迷宫）
    hashCoords(row, col, seed) {
        let hash = seed;
        hash = ((hash << 5) - hash) + row;
        hash = hash & hash;
        hash = ((hash << 5) - hash) + col;
        hash = hash & hash;
        return hash;
    }
    
    // 加载视距内的区块
    loadChunksAround(centerRow, centerCol) {
        const { chunkRow, chunkCol } = this.getChunkCoords(centerRow, centerCol);
        
        for (let dr = -this.viewDistance; dr <= this.viewDistance; dr++) {
            for (let dc = -this.viewDistance; dc <= this.viewDistance; dc++) {
                this.generateChunk(chunkRow + dr, chunkCol + dc);
            }
        }
        
        // 卸载远离的区块
        this.unloadDistantChunks(chunkRow, chunkCol);
    }
    
    // 卸载远离的区块（节省内存）
    unloadDistantChunks(centerChunkRow, centerChunkCol) {
        const toUnload = [];
        
        for (const key of this.loadedChunks) {
            const [chunkRow, chunkCol] = key.split(',').map(Number);
            const distance = Math.max(
                Math.abs(chunkRow - centerChunkRow),
                Math.abs(chunkCol - centerChunkCol)
            );
            
            if (distance > this.viewDistance + 1) {
                toUnload.push(key);
            }
        }
        
        toUnload.forEach(key => {
            this.chunks.delete(key);
            this.loadedChunks.delete(key);
        });
    }
    
    // 获取格子（自动生成区块）
    getCell(row, col) {
        const { chunkRow, chunkCol } = this.getChunkCoords(row, col);
        const chunk = this.generateChunk(chunkRow, chunkCol);
        
        const localRow = ((row % this.chunkSize) + this.chunkSize) % this.chunkSize;
        const localCol = ((col % this.chunkSize) + this.chunkSize) % this.chunkSize;
        
        return chunk.grid[localRow][localCol];
    }
    
    // 更新旋转墙
    updateRotatingWalls(deltaTime) {
        const now = Date.now();
        if (now - this.lastRotateTime < 2000) return; // 每2秒旋转一次
        
        this.lastRotateTime = now;
        
        for (const [key, data] of this.rotatingWalls) {
            data.phase += Math.PI / 2; // 旋转90度
            
            // 旋转墙壁配置
            const { cell } = data;
            const config = Math.floor(data.phase / (Math.PI / 2)) % 4;
            
            // 重置所有墙
            cell.walls = { top: false, right: false, bottom: false, left: false };
            
            // 根据配置设置墙
            switch (config) {
                case 0: cell.walls.top = cell.walls.bottom = true; break;
                case 1: cell.walls.right = cell.walls.left = true; break;
                case 2: cell.walls.top = cell.walls.bottom = true; break;
                case 3: cell.walls.right = cell.walls.left = true; break;
            }
        }
    }
    
    // 移动玩家
    movePlayer(newRow, newCol) {
        const currentCell = this.getCell(this.playerPos.row, this.playerPos.col);
        const newCell = this.getCell(newRow, newCol);
        const chunk = this.getChunkForCell(newRow, newCol);
        
        // 检查墙壁阻挡
        const direction = this.getDirection(this.playerPos.row, this.playerPos.col, newRow, newCol);
        if (direction && currentCell.walls[direction]) {
            // 检查是否是需要钥匙的门
            if (newCell.hasLockedDoor && this.collectedKeys.size > 0) {
                // 使用一把钥匙开门
                const key = this.collectedKeys.values().next().value;
                this.collectedKeys.delete(key);
                newCell.hasLockedDoor = false;
                console.log(`使用钥匙开门，剩余钥匙: ${this.collectedKeys.size}`);
            } else {
                console.log(`无法移动: ${direction}方向有墙阻挡`);
                return false; // 有墙阻挡
            }
        }
        
        // 检查耐力 - 根据生物群系消耗耐力
        const staminaDrain = chunk.biome.staminaDrain || 0.1;
        this.stamina -= staminaDrain;
        
        if (this.stamina <= 0) {
            this.stamina = 0;
            console.log("耐力耗尽，游戏结束");
            // 触发游戏结束事件
            if (typeof window !== 'undefined' && window.mainController) {
                window.mainController.updateStatus('游戏结束：耐力耗尽');
            }
            return false; // 耐力耗尽
        }
        
        // 检查伤害
        if (chunk.biome.damage) {
            // 可以添加生命值系统
        }
        
        // 检查钥匙
        if (newCell.hasKey) {
            this.collectedKeys.add(newCell.hasKey);
            newCell.hasKey = null;
            console.log(`收集到钥匙，当前钥匙数量: ${this.collectedKeys.size}`);
        }
        
        // 检查食物
        if (newCell.hasFood) {
            this.collectedFood++;
            newCell.hasFood = false;
            this.stamina = Math.min(100, this.stamina + 20); // 吃食物恢复20点耐力
            console.log(`吃掉食物，耐力恢复到: ${this.stamina.toFixed(0)}%，当前食物数量: ${this.collectedFood}`);
        }
        
        // 检查传送门
        if (newCell.portal) {
            this.playerPos = { row: newCell.portal.row, col: newCell.portal.col };
            this.exploreAround(newCell.portal.row, newCell.portal.col, 2);
            console.log(`通过传送门移动到: (${newCell.portal.row}, ${newCell.portal.col})`);
            return true;
        }
        
        this.playerPos = { row: newRow, col: newCol };
        this.exploreAround(newRow, newCol, 2);
        
        console.log(`成功移动到: (${newRow}, ${newCol})`);
        return true;
    }
    
    // 获取移动方向
    getDirection(fromRow, fromCol, toRow, toCol) {
        if (toRow < fromRow) return 'top';
        if (toRow > fromRow) return 'bottom';
        if (toCol < fromCol) return 'left';
        if (toCol > fromCol) return 'right';
        return null;
    }
    
    // 探索周围区域
    exploreAround(centerRow, centerCol, radius) {
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                const row = centerRow + dr;
                const col = centerCol + dc;
                this.exploredCells.add(`${row},${col}`);
            }
        }
    }
    
    // 获取格子所在区块
    getChunkForCell(row, col) {
        const { chunkRow, chunkCol } = this.getChunkCoords(row, col);
        return this.generateChunk(chunkRow, chunkCol);
    }
    
    // 检查格子是否被探索
    isExplored(row, col) {
        return this.exploredCells.has(`${row},${col}`);
    }
}

// 简单的种子随机数生成器
Math.seedrandom = function(seed) {
    Math.random = function() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
};

// 导出所有类
window.MazeAdvanced = {
    Maze4D,
    Cell4D,
    QuantumMaze,
    RelativityMaze,
    HaltingMaze,
    ChaosMaze,
    NPCompleteMaze,
    InfiniteMaze
};

console.log('🚀 超复杂迷宫系统已加载');
