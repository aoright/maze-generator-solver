/**
 * 第8阶段：复杂迷宫系统
 * 多层、加权、动态、六边形、环形、岛屿、传送门
 */

// ==================== 8.1 多层3D迷宫 ====================

/**
 * 多层迷宫类
 */
class MultiLayerMaze extends Maze {
    constructor(rows, cols, layers = 3) {
        super(rows, cols);
        this.layers = layers;
        this.grid3D = [];
        this.stairs = []; // 楼梯连接
        this.currentLayer = 0;
        
        this.initialize3DGrid();
    }
    
    initialize3DGrid() {
        this.grid3D = [];
        for (let layer = 0; layer < this.layers; layer++) {
            const layerGrid = [];
            for (let row = 0; row < this.rows; row++) {
                const currentRow = [];
                for (let col = 0; col < this.cols; col++) {
                    const cell = new Cell3D(row, col, layer);
                    currentRow.push(cell);
                }
                layerGrid.push(currentRow);
            }
            this.grid3D.push(layerGrid);
        }
        
        // 让grid指向当前层，以兼容标准生成器
        this.grid = this.grid3D[this.currentLayer];
        
        // 随机添加楼梯
        this.generateStairs();
        
        // 设置起点在第一层，终点在最后一层
        this.start = this.grid3D[0][0][0];
        this.end = this.grid3D[this.layers - 1][this.rows - 1][this.cols - 1];
    }
    
    generateStairs() {
        const stairCount = Math.floor(this.rows * this.cols * 0.05); // 5%的格子有楼梯
        
        for (let i = 0; i < stairCount; i++) {
            const layer = Math.floor(Math.random() * (this.layers - 1));
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            const cell1 = this.grid3D[layer][row][col];
            const cell2 = this.grid3D[layer + 1][row][col];
            
            cell1.hasStairsUp = true;
            cell2.hasStairsDown = true;
            
            this.stairs.push({ from: cell1, to: cell2 });
        }
    }
    
    // 添加设置所有墙壁的方法，修复墙壁不连续问题
    setAllWalls() {
        for (let layer = 0; layer < this.layers; layer++) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const cell = this.grid3D[layer][row][col];
                    cell.walls = {
                        top: true,
                        right: true,
                        bottom: true,
                        left: true
                    };
                    cell.visited = false;
                }
            }
        }
    }
    
    // 重写移除墙壁方法，支持3D结构
    removeWall(cell1, cell2) {
        // 如果两个格子在同一层
        if (cell1.layer === cell2.layer) {
            const rowDiff = cell1.row - cell2.row;
            const colDiff = cell1.col - cell2.col;

            if (rowDiff === 1) {
                cell1.walls.top = false;
                cell2.walls.bottom = false;
            } else if (rowDiff === -1) {
                cell1.walls.bottom = false;
                cell2.walls.top = false;
            } else if (colDiff === 1) {
                cell1.walls.left = false;
                cell2.walls.right = false;
            } else if (colDiff === -1) {
                cell1.walls.right = false;
                cell2.walls.left = false;
            }
        }
        // 如果是层间连接（楼梯），不需要移除墙壁
    }
    
    getCell3D(row, col, layer) {
        if (this.isValid3D(row, col, layer)) {
            return this.grid3D[layer][row][col];
        }
        return null;
    }
    
    isValid3D(row, col, layer) {
        return layer >= 0 && layer < this.layers &&
               row >= 0 && row < this.rows &&
               col >= 0 && col < this.cols;
    }
    
    // 重写getNeighbors以支持3D结构
    getNeighbors(cell, checkWalls = false) {
        // 如果是Cell3D，使用全部3D邻居
        if (cell.layer !== undefined) {
            return this.getNeighbors3D(cell, checkWalls);
        }
        // 否则使用父类方法
        return super.getNeighbors(cell, checkWalls);
    }
    
    getNeighbors3D(cell, checkWalls = false) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0, layer: 0, wall: 'top' },
            { row: 0, col: 1, layer: 0, wall: 'right' },
            { row: 1, col: 0, layer: 0, wall: 'bottom' },
            { row: 0, col: -1, layer: 0, wall: 'left' }
        ];
        
        // 平面邻居
        for (const dir of directions) {
            const newRow = cell.row + dir.row;
            const newCol = cell.col + dir.col;
            const newLayer = cell.layer;
            
            if (this.isValid3D(newRow, newCol, newLayer)) {
                if (!checkWalls || !cell.walls[dir.wall]) {
                    neighbors.push(this.grid3D[newLayer][newRow][newCol]);
                }
            }
        }
        
        // 楼梯邻居
        if (cell.hasStairsUp && this.isValid3D(cell.row, cell.col, cell.layer + 1)) {
            neighbors.push(this.grid3D[cell.layer + 1][cell.row][cell.col]);
        }
        if (cell.hasStairsDown && this.isValid3D(cell.row, cell.col, cell.layer - 1)) {
            neighbors.push(this.grid3D[cell.layer - 1][cell.row][cell.col]);
        }
        
        return neighbors;
    }
    
    // 重写resetVisited以处理所有层
    resetVisited() {
        for (let layer = 0; layer < this.layers; layer++) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    this.grid3D[layer][row][col].reset();
                }
            }
        }
        this.path = [];
        this.visitedCells = [];
    }
    
    // 重写getUnvisitedNeighbors
    getUnvisitedNeighbors(cell) {
        return this.getNeighbors(cell).filter(neighbor => !neighbor.visited);
    }
}

/**
 * 3D格子类
 */
class Cell3D extends Cell {
    constructor(row, col, layer) {
        super(row, col);
        this.layer = layer;
        this.hasStairsUp = false;
        this.hasStairsDown = false;
    }
}

// ==================== 8.2 加权迷宫 ====================

/**
 * 加权迷宫类（地形成本）
 */
class WeightedMaze extends Maze {
    constructor(rows, cols) {
        super(rows, cols);
        this.weights = [];
        this.terrainTypes = ['grass', 'water', 'mountain', 'forest', 'desert'];
        
        this.initializeWeights();
    }
    
    initializeWeights() {
        this.weights = [];
        for (let row = 0; row < this.rows; row++) {
            const weightRow = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                cell.weight = this.generateWeight(row, col);
                cell.terrain = this.terrainTypes[Math.floor(cell.weight / 2)];
                weightRow.push(cell.weight);
            }
            this.weights.push(weightRow);
        }
    }
    
    generateWeight(row, col) {
        // 使用Perlin噪声生成自然的地形权重
        const noise = this.perlinNoise(row / 10, col / 10);
        return Math.floor((noise + 1) * 5); // 权重1-10
    }
    
    // 简化的Perlin噪声
    perlinNoise(x, y) {
        const p = [];
        for (let i = 0; i < 512; i++) {
            p[i] = Math.floor(Math.random() * 256);
        }
        
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const a = p[X] + Y;
        const b = p[X + 1] + Y;
        
        return this.lerp(v,
            this.lerp(u, this.grad(p[a], x, y), this.grad(p[b], x - 1, y)),
            this.lerp(u, this.grad(p[a + 1], x, y - 1), this.grad(p[b + 1], x - 1, y - 1))
        );
    }
    
    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    lerp(t, a, b) {
        return a + t * (b - a);
    }
    
    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
    
    getCost(cell1, cell2) {
        return cell2.weight;
    }
}

// ==================== 8.3 动态迷宫 ====================

/**
 * 动态迷宫类（墙壁会变化）
 */
class DynamicMaze extends Maze {
    constructor(rows, cols) {
        super(rows, cols);
        this.dynamicWalls = [];
        this.movingWalls = [];
        this.time = 0;
        
        this.initializeDynamicWalls();
    }
    
    initializeDynamicWalls() {
        // 随机选择一些墙壁设为动态
        const wallCount = Math.floor(this.rows * this.cols * 0.1);
        
        for (let i = 0; i < wallCount; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            const cell = this.grid[row][col];
            const direction = ['top', 'right', 'bottom', 'left'][Math.floor(Math.random() * 4)];
            
            this.dynamicWalls.push({
                cell,
                direction,
                period: 3 + Math.floor(Math.random() * 5), // 3-7秒周期
                phase: Math.random() * Math.PI * 2
            });
        }
        
        // 创建移动墙壁
        this.createMovingWalls();
    }
    
    createMovingWalls() {
        const count = Math.floor(this.rows * 0.3);
        
        for (let i = 0; i < count; i++) {
            const row = Math.floor(Math.random() * this.rows);
            const col = 0;
            const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
            
            this.movingWalls.push({
                row,
                col,
                direction,
                speed: 0.5 + Math.random() * 0.5,
                position: 0
            });
        }
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        // 更新动态墙壁
        for (const wall of this.dynamicWalls) {
            const phase = (this.time / wall.period + wall.phase) % (Math.PI * 2);
            wall.cell.walls[wall.direction] = Math.sin(phase) > 0;
        }
        
        // 更新移动墙壁
        for (const wall of this.movingWalls) {
            if (wall.direction === 'horizontal') {
                wall.position += wall.speed * deltaTime;
                if (wall.position >= this.cols) wall.position = 0;
                wall.col = Math.floor(wall.position);
            } else {
                wall.position += wall.speed * deltaTime;
                if (wall.position >= this.rows) wall.position = 0;
                wall.row = Math.floor(wall.position);
            }
        }
    }
    
    isWallBlocking(cell, direction) {
        // 检查移动墙壁
        for (const wall of this.movingWalls) {
            if (wall.row === cell.row && wall.col === cell.col) {
                return true;
            }
        }
        
        return cell.walls[direction];
    }
}

// ==================== 8.4 六边形迷宫 ====================

/**
 * 六边形迷宫类
 */
class HexMaze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.path = [];
        this.visitedCells = [];
        
        this.initializeHexGrid();
    }
    
    initializeHexGrid() {
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new HexCell(row, col));
            }
            this.grid.push(currentRow);
        }
        
        this.start = this.grid[0][0];
        this.end = this.grid[this.rows - 1][this.cols - 1];
    }
    
    // 轴坐标系统
    axialToPixel(row, col, size) {
        const x = size * (3/2 * col);
        const y = size * (Math.sqrt(3)/2 * col + Math.sqrt(3) * row);
        return { x, y };
    }
    
    getNeighbors(cell) {
        const neighbors = [];
        const directions = [
            { dr: 0, dc: 1 },   // 右
            { dr: 0, dc: -1 },  // 左
            { dr: 1, dc: 0 },   // 下右
            { dr: 1, dc: -1 },  // 下左
            { dr: -1, dc: 0 },  // 上右
            { dr: -1, dc: 1 }   // 上左
        ];
        
        for (let i = 0; i < 6; i++) {
            const dir = directions[i];
            const newRow = cell.row + dir.dr;
            const newCol = cell.col + dir.dc;
            
            if (this.isValid(newRow, newCol)) {
                if (!cell.walls[i]) {
                    neighbors.push(this.grid[newRow][newCol]);
                }
            }
        }
        
        return neighbors;
    }
    
    isValid(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }
    
    removeWall(cell1, cell2) {
        const dr = cell2.row - cell1.row;
        const dc = cell2.col - cell1.col;
        
        // 确定方向索引
        let dir1, dir2;
        if (dr === 0 && dc === 1) { dir1 = 0; dir2 = 1; }
        else if (dr === 0 && dc === -1) { dir1 = 1; dir2 = 0; }
        else if (dr === 1 && dc === 0) { dir1 = 2; dir2 = 4; }
        else if (dr === 1 && dc === -1) { dir1 = 3; dir2 = 5; }
        else if (dr === -1 && dc === 0) { dir1 = 4; dir2 = 2; }
        else if (dr === -1 && dc === 1) { dir1 = 5; dir2 = 3; }
        
        if (dir1 !== undefined && dir2 !== undefined) {
            cell1.walls[dir1] = false;
            cell2.walls[dir2] = false;
        }
    }
    
    // 为兼容标准生成器添加方法
    setAllWalls() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].walls = [true, true, true, true, true, true];
                this.grid[row][col].visited = false;
            }
        }
    }
    
    getUnvisitedNeighbors(cell) {
        const allNeighbors = [];
        const directions = [
            { dr: 0, dc: 1 },   // 右
            { dr: 0, dc: -1 },  // 左
            { dr: 1, dc: 0 },   // 下右
            { dr: 1, dc: -1 },  // 下左
            { dr: -1, dc: 0 },  // 上右
            { dr: -1, dc: 1 }   // 上左
        ];
        
        for (const dir of directions) {
            const newRow = cell.row + dir.dr;
            const newCol = cell.col + dir.dc;
            
            if (this.isValid(newRow, newCol)) {
                const neighbor = this.grid[newRow][newCol];
                if (!neighbor.visited) {
                    allNeighbors.push(neighbor);
                }
            }
        }
        
        return allNeighbors;
    }
    
    resetVisited() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].reset();
            }
        }
    }
    
    reconstructPath() {
        const path = [];
        let current = this.end;
        
        while (current !== null) {
            path.unshift(current);
            current.inPath = true;
            current = current.parent;
        }
        
        return path;
    }
}

/**
 * 六边形格子
 */
class HexCell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = [true, true, true, true, true, true]; // 6个方向的墙
        this.visited = false;
        this.inPath = false;
        this.parent = null;
    }
    
    reset() {
        this.visited = false;
        this.inPath = false;
        this.parent = null;
    }
}

// ==================== 8.5 环形迷宫 ====================

/**
 * 环形迷宫类（极坐标）
 */
class CircularMaze {
    constructor(rings, sectors) {
        this.rings = rings;
        this.sectors = sectors;
        // 为兼容标准生成器添加属性
        this.rows = rings;
        this.cols = sectors;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.path = [];
        this.visitedCells = [];
        
        this.initializeCircularGrid();
    }
    
    initializeCircularGrid() {
        this.grid = [];
        for (let ring = 0; ring < this.rings; ring++) {
            const currentRing = [];
            const sectorsInRing = ring === 0 ? 1 : this.sectors;
            
            for (let sector = 0; sector < sectorsInRing; sector++) {
                currentRing.push(new CircularCell(ring, sector));
            }
            this.grid.push(currentRing);
        }
        
        this.start = this.grid[0][0];
        this.end = this.grid[this.rings - 1][0];
    }
    
    polarToCartesian(ring, sector, innerRadius, ringWidth) {
        const angle = (sector / this.grid[ring].length) * Math.PI * 2;
        const radius = innerRadius + ring * ringWidth;
        
        return {
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
        };
    }
    
    getNeighbors(cell, checkWalls = false) {
        const neighbors = [];
        const ring = cell.ring;
        const sector = cell.sector;
        const sectorsInRing = this.grid[ring].length;
        
        // 同环相邻扇区
        if (sectorsInRing > 1) {
            const nextSector = (sector + 1) % sectorsInRing;
            const prevSector = (sector - 1 + sectorsInRing) % sectorsInRing;
            
            if (!checkWalls || !cell.walls.clockwise) {
                neighbors.push(this.grid[ring][nextSector]);
            }
            if (!checkWalls || !cell.walls.counterClockwise) {
                neighbors.push(this.grid[ring][prevSector]);
            }
        }
        
        // 内环
        if (ring > 0) {
            const innerSector = Math.floor(sector * this.grid[ring - 1].length / sectorsInRing);
            if (!checkWalls || !cell.walls.inner) {
                neighbors.push(this.grid[ring - 1][innerSector]);
            }
        }
        
        // 外环
        if (ring < this.rings - 1) {
            const outerSector = Math.floor(sector * this.grid[ring + 1].length / sectorsInRing);
            if (!checkWalls || !cell.walls.outer) {
                neighbors.push(this.grid[ring + 1][outerSector]);
            }
        }
        
        return neighbors;
    }
    
    // 为兼容标准生成器添加方法
    setAllWalls() {
        for (let ring = 0; ring < this.rings; ring++) {
            for (let sector = 0; sector < this.grid[ring].length; sector++) {
                const cell = this.grid[ring][sector];
                cell.walls = {
                    inner: true,
                    outer: true,
                    clockwise: true,
                    counterClockwise: true
                };
                cell.visited = false;
            }
        }
    }
    
    getUnvisitedNeighbors(cell) {
        return this.getNeighbors(cell, false).filter(n => !n.visited);
    }
    
    removeWall(cell1, cell2) {
        // 判断两个单元格的关系
        if (cell1.ring === cell2.ring) {
            // 同环，移除顺时针/逆时针墙
            const sectorsInRing = this.grid[cell1.ring].length;
            const diff = (cell2.sector - cell1.sector + sectorsInRing) % sectorsInRing;
            if (diff === 1) {
                cell1.walls.clockwise = false;
                cell2.walls.counterClockwise = false;
            } else if (diff === sectorsInRing - 1) {
                cell1.walls.counterClockwise = false;
                cell2.walls.clockwise = false;
            }
        } else if (cell1.ring < cell2.ring) {
            // cell1 在内环，cell2 在外环
            cell1.walls.outer = false;
            cell2.walls.inner = false;
        } else {
            // cell1 在外环，cell2 在内环
            cell1.walls.inner = false;
            cell2.walls.outer = false;
        }
    }
    
    resetVisited() {
        for (let ring = 0; ring < this.rings; ring++) {
            for (let sector = 0; sector < this.grid[ring].length; sector++) {
                this.grid[ring][sector].reset();
            }
        }
        this.path = [];
        this.visitedCells = [];
    }
    
    reconstructPath() {
        this.path = [];
        let current = this.end;
        
        while (current !== null) {
            this.path.unshift(current);
            current.inPath = true;
            current = current.parent;
        }
        
        return this.path;
    }
}

/**
 * 环形格子
 */
class CircularCell {
    constructor(ring, sector) {
        this.ring = ring;
        this.sector = sector;
        this.walls = {
            inner: true,
            outer: true,
            clockwise: true,
            counterClockwise: true
        };
        this.visited = false;
        this.inPath = false;
        this.parent = null;
    }
    
    reset() {
        this.visited = false;
        this.inPath = false;
        this.parent = null;
    }
}

// ==================== 8.6 岛屿迷宫 ====================

/**
 * 岛屿迷宫类
 */
class IslandMaze extends Maze {
    constructor(rows, cols, islandCount = 8) {
        super(rows, cols);
        this.islands = [];
        this.bridges = [];
        
        this.generateIslands(islandCount);
        this.generateBridges();
        
        // 设置起点和终点在不同岛屿
        if (this.islands.length > 0) {
            this.start = this.islands[0].cells[0];
            this.end = this.islands[this.islands.length - 1].cells[this.islands[this.islands.length - 1].cells.length - 1];
        }
    }
    
    generateIslands(count) {
        // 生成随机岛屿，确保分布均匀
        const attempts = count * 3;
        
        for (let attempt = 0; attempt < attempts && this.islands.length < count; attempt++) {
            const centerRow = Math.floor(Math.random() * this.rows);
            const centerCol = Math.floor(Math.random() * this.cols);
            const radius = 3 + Math.floor(Math.random() * 4); // 更大的岛屿
            
            // 检查是否与现有岛屿重叠
            let overlaps = false;
            for (const existingIsland of this.islands) {
                const dist = Math.sqrt(
                    Math.pow(centerRow - existingIsland.center.row, 2) +
                    Math.pow(centerCol - existingIsland.center.col, 2)
                );
                if (dist < radius + existingIsland.radius + 3) {
                    overlaps = true;
                    break;
                }
            }
            
            if (overlaps) continue;
            
            const island = {
                center: { row: centerRow, col: centerCol },
                radius,
                cells: []
            };
            
            // 标记岛屿内的格子
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const dist = Math.sqrt(
                        Math.pow(row - centerRow, 2) + 
                        Math.pow(col - centerCol, 2)
                    );
                    
                    if (dist <= radius) {
                        const cell = this.grid[row][col];
                        if (!cell.isLand) { // 避免重复
                            cell.isLand = true;
                            cell.islandId = this.islands.length;
                            island.cells.push(cell);
                        }
                    }
                }
            }
            
            if (island.cells.length > 5) { // 确保岛屿有足够的单元格
                this.islands.push(island);
            }
        }
        
        // 其他格子标记为水
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                if (!cell.isLand) {
                    cell.isWater = true;
                }
            }
        }
    }
    
    generateBridges() {
        // 使用最小生成树算法连接所有岛屿，但只创建少量桥梁
        const connected = new Set([0]); // 已连接的岛屿
        
        while (connected.size < this.islands.length) {
            let bestBridge = null;
            let minDist = Infinity;
            
            // 找到从已连接岛屿到未连接岛屿的最短桥梁
            for (const connectedId of connected) {
                for (let i = 0; i < this.islands.length; i++) {
                    if (connected.has(i)) continue;
                    
                    const island1 = this.islands[connectedId];
                    const island2 = this.islands[i];
                    
                    for (const cell1 of island1.cells) {
                        for (const cell2 of island2.cells) {
                            const dist = Math.abs(cell1.row - cell2.row) + 
                                        Math.abs(cell1.col - cell2.col);
                            if (dist < minDist) {
                                minDist = dist;
                                bestBridge = { from: cell1, to: cell2, toIsland: i };
                            }
                        }
                    }
                }
            }
            
            if (bestBridge) {
                bestBridge.from.hasBridge = true;
                bestBridge.to.hasBridge = true;
                this.bridges.push(bestBridge);
                connected.add(bestBridge.toIsland);
            } else {
                break; // 无法连接更多岛屿
            }
        }
    }
    
    // 重写getNeighbors以处理水域和桥梁
    getNeighbors(cell, checkWalls = false) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0, wall: 'top' },
            { row: 0, col: 1, wall: 'right' },
            { row: 1, col: 0, wall: 'bottom' },
            { row: 0, col: -1, wall: 'left' }
        ];
        
        // 如果是水域，不能移动
        if (cell.isWater) return neighbors;
        
        for (const dir of directions) {
            const newRow = cell.row + dir.row;
            const newCol = cell.col + dir.col;
            
            if (this.isValid(newRow, newCol)) {
                const neighbor = this.grid[newRow][newCol];
                
                // 只能在陆地上移动
                if (neighbor.isLand) {
                    if (!checkWalls || !cell.walls[dir.wall]) {
                        neighbors.push(neighbor);
                    }
                }
            }
        }
        
        // 添加桥梁连接
        if (cell.hasBridge) {
            for (const bridge of this.bridges) {
                if (bridge.from === cell) {
                    neighbors.push(bridge.to);
                } else if (bridge.to === cell) {
                    neighbors.push(bridge.from);
                }
            }
        }
        
        return neighbors;
    }
}

// ==================== 8.7 传送门迷宫 ====================

/**
 * 传送门迷宫类
 */
class PortalMaze extends Maze {
    constructor(rows, cols, portalCount = 5) {
        super(rows, cols);
        this.portals = [];
        
        this.generatePortals(portalCount);
    }
    
    generatePortals(count) {
        // 成对生成传送门
        for (let i = 0; i < count / 2; i++) {
            const row1 = Math.floor(Math.random() * this.rows);
            const col1 = Math.floor(Math.random() * this.cols);
            const row2 = Math.floor(Math.random() * this.rows);
            const col2 = Math.floor(Math.random() * this.cols);
            
            const portal1 = this.grid[row1][col1];
            const portal2 = this.grid[row2][col2];
            
            portal1.isPortal = true;
            portal2.isPortal = true;
            portal1.portalTarget = portal2;
            portal2.portalTarget = portal1;
            portal1.portalColor = `hsl(${i * 60}, 100%, 50%)`;
            portal2.portalColor = `hsl(${i * 60}, 100%, 50%)`;
            
            this.portals.push({ portal1, portal2 });
        }
    }
    
    getNeighbors(cell, checkWalls = false) {
        const neighbors = super.getNeighbors(cell, checkWalls);
        
        // 添加传送门目标作为邻居
        if (cell.isPortal && cell.portalTarget) {
            neighbors.push(cell.portalTarget);
        }
        
        return neighbors;
    }
}

// 导出所有类
window.MazeComplex = {
    MultiLayerMaze,
    Cell3D,
    WeightedMaze,
    DynamicMaze,
    HexMaze,
    HexCell,
    CircularMaze,
    CircularCell,
    IslandMaze,
    PortalMaze
};

console.log('🏗️ 复杂迷宫系统已加载');
