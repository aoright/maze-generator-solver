/**
 * 迷宫生成器基类
 */
class MazeGenerator {
    constructor(maze) {
        this.maze = maze;
        this.steps = [];
    }

    async generate(speed = 10) {
        throw new Error('子类必须实现 generate 方法');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * 递归回溯算法（推荐）
 */
class RecursiveBacktrackingGenerator extends MazeGenerator {
    async generate(speed = 10) {
        // 对于多层迷宫，确保调用正确的setAllWalls方法
        if (this.maze.setAllWalls) {
            this.maze.setAllWalls();
        } else {
            this.maze.setAllWalls();
        }
        
        const stack = [];
        const startCell = this.maze.start;
        startCell.visited = true;
        stack.push(startCell);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const unvisited = this.maze.getUnvisitedNeighbors(current);

            if (unvisited.length > 0) {
                const next = unvisited[Math.floor(Math.random() * unvisited.length)];
                this.maze.removeWall(current, next);
                next.visited = true;
                stack.push(next);

                if (speed > 0) {
                    this.steps.push({ type: 'visit', cell: next });
                    if (this.renderer) this.renderer.draw();
                    await this.sleep(1000 / speed);
                }
            } else {
                stack.pop();
            }
        }

        // 重置访问标记
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                // 对于多层迷宫，需要重置所有层
                if (this.maze.grid3D) {
                    for (let layer = 0; layer < this.maze.layers; layer++) {
                        this.maze.grid3D[layer][row][col].visited = false;
                    }
                } else {
                    this.maze.grid[row][col].visited = false;
                }
            }
        }

        return this.steps;
    }
}

/**
 * Prim算法
 */
class PrimGenerator extends MazeGenerator {
    async generate(speed = 10) {
        // 对于多层迷宫，确保调用正确的setAllWalls方法
        if (this.maze.setAllWalls) {
            this.maze.setAllWalls();
        } else {
            this.maze.setAllWalls();
        }
        
        const walls = [];
        const startCell = this.maze.grid[Math.floor(Math.random() * this.maze.rows)][Math.floor(Math.random() * this.maze.cols)];
        startCell.visited = true;

        // 添加起始格子的墙
        this.addWalls(startCell, walls);

        while (walls.length > 0) {
            const randomIndex = Math.floor(Math.random() * walls.length);
            const { cell, neighbor } = walls[randomIndex];
            walls.splice(randomIndex, 1);

            if (!neighbor.visited) {
                this.maze.removeWall(cell, neighbor);
                neighbor.visited = true;
                this.addWalls(neighbor, walls);

                if (speed > 0) {
                    this.steps.push({ type: 'visit', cell: neighbor });
                    if (this.renderer) this.renderer.draw();
                    await this.sleep(1000 / speed);
                }
            }
        }

        // 重置访问标记
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                // 对于多层迷宫，需要重置所有层
                if (this.maze.grid3D) {
                    for (let layer = 0; layer < this.maze.layers; layer++) {
                        this.maze.grid3D[layer][row][col].visited = false;
                    }
                } else {
                    this.maze.grid[row][col].visited = false;
                }
            }
        }

        return this.steps;
    }

    addWalls(cell, walls) {
        const neighbors = this.maze.getNeighbors(cell);
        for (const neighbor of neighbors) {
            if (!neighbor.visited) {
                walls.push({ cell, neighbor });
            }
        }
    }
}

/**
 * Kruskal算法
 */
class KruskalGenerator extends MazeGenerator {
    async generate(speed = 10) {
        // 对于多层迷宫，确保调用正确的setAllWalls方法
        if (this.maze.setAllWalls) {
            this.maze.setAllWalls();
        } else {
            this.maze.setAllWalls();
        }
        
        const sets = new Map();
        const edges = [];

        // 初始化并查集
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                // 对于多层迷宫，需要处理所有层
                if (this.maze.grid3D) {
                    for (let layer = 0; layer < this.maze.layers; layer++) {
                        const cell = this.maze.grid3D[layer][row][col];
                        sets.set(cell, cell);
                    }
                } else {
                    const cell = this.maze.grid[row][col];
                    sets.set(cell, cell);
                }
            }
        }

        // 收集所有边
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                // 对于多层迷宫，需要处理所有层
                if (this.maze.grid3D) {
                    for (let layer = 0; layer < this.maze.layers; layer++) {
                        const cell = this.maze.grid3D[layer][row][col];
                        if (col < this.maze.cols - 1) {
                            edges.push({ cell1: cell, cell2: this.maze.grid3D[layer][row][col + 1] });
                        }
                        if (row < this.maze.rows - 1) {
                            edges.push({ cell1: cell, cell2: this.maze.grid3D[layer][row + 1][col] });
                        }
                    }
                } else {
                    const cell = this.maze.grid[row][col];
                    if (col < this.maze.cols - 1) {
                        edges.push({ cell1: cell, cell2: this.maze.grid[row][col + 1] });
                    }
                    if (row < this.maze.rows - 1) {
                        edges.push({ cell1: cell, cell2: this.maze.grid[row + 1][col] });
                    }
                }
            }
        }

        // 随机打乱边
        this.shuffleArray(edges);

        // 处理每条边
        for (const edge of edges) {
            const set1 = this.find(sets, edge.cell1);
            const set2 = this.find(sets, edge.cell2);

            if (set1 !== set2) {
                this.maze.removeWall(edge.cell1, edge.cell2);
                this.union(sets, set1, set2);

                if (speed > 0) {
                    this.steps.push({ type: 'connect', cells: [edge.cell1, edge.cell2] });
                    if (this.renderer) this.renderer.draw();
                    await this.sleep(1000 / speed);
                }
            }
        }

        return this.steps;
    }

    find(sets, cell) {
        if (sets.get(cell) === cell) return cell;
        const root = this.find(sets, sets.get(cell));
        sets.set(cell, root);
        return root;
    }

    union(sets, cell1, cell2) {
        sets.set(cell1, cell2);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

/**
 * 递归分割算法
 */
class RecursiveDivisionGenerator extends MazeGenerator {
    async generate(speed = 10) {
        this.maze.clearWalls();
        
        // 添加外墙
        for (let col = 0; col < this.maze.cols; col++) {
            this.maze.grid[0][col].walls.top = true;
            this.maze.grid[this.maze.rows - 1][col].walls.bottom = true;
        }
        for (let row = 0; row < this.maze.rows; row++) {
            this.maze.grid[row][0].walls.left = true;
            this.maze.grid[row][this.maze.cols - 1].walls.right = true;
        }

        await this.divide(0, 0, this.maze.cols - 1, this.maze.rows - 1, speed);
        return this.steps;
    }

    async divide(colStart, rowStart, colEnd, rowEnd, speed) {
        if (colEnd - colStart < 1 || rowEnd - rowStart < 1) return;

        const horizontal = (rowEnd - rowStart) > (colEnd - colStart);

        if (horizontal) {
            const row = rowStart + 1 + Math.floor(Math.random() * (rowEnd - rowStart - 1));
            const passage = colStart + Math.floor(Math.random() * (colEnd - colStart + 1));
            
            this.maze.addHorizontalWall(row, colStart, colEnd, passage);
            
            if (speed > 0) {
                this.steps.push({ type: 'divide', orientation: 'horizontal', row });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            await this.divide(colStart, rowStart, colEnd, row - 1, speed);
            await this.divide(colStart, row, colEnd, rowEnd, speed);
        } else {
            const col = colStart + 1 + Math.floor(Math.random() * (colEnd - colStart - 1));
            const passage = rowStart + Math.floor(Math.random() * (rowEnd - rowStart + 1));
            
            this.maze.addVerticalWall(col, rowStart, rowEnd, passage);
            
            if (speed > 0) {
                this.steps.push({ type: 'divide', orientation: 'vertical', col });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            await this.divide(colStart, rowStart, col - 1, rowEnd, speed);
            await this.divide(col, rowStart, colEnd, rowEnd, speed);
        }
    }
}

/**
 * Wilson算法（循环擦除随机游走）
 */
class WilsonGenerator extends MazeGenerator {
    async generate(speed = 10) {
        this.maze.setAllWalls();
        const unvisited = [];
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                unvisited.push(this.maze.grid[row][col]);
            }
        }

        // 随机选择第一个格子
        const first = unvisited.splice(Math.floor(Math.random() * unvisited.length), 1)[0];
        first.visited = true;

        while (unvisited.length > 0) {
            let current = unvisited[Math.floor(Math.random() * unvisited.length)];
            const path = [current];

            // 随机游走直到到达已访问的格子
            while (!current.visited) {
                const neighbors = this.maze.getNeighbors(current);
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];

                // 检查是否形成环并擦除
                const index = path.indexOf(next);
                if (index !== -1) {
                    path.splice(index + 1);
                } else {
                    path.push(next);
                }
                current = next;
            }

            // 刻画路径
            for (let i = 0; i < path.length - 1; i++) {
                this.maze.removeWall(path[i], path[i + 1]);
                path[i].visited = true;
                const idx = unvisited.indexOf(path[i]);
                if (idx !== -1) unvisited.splice(idx, 1);

                if (speed > 0) {
                    this.steps.push({ type: 'visit', cell: path[i] });
                    if (this.renderer) this.renderer.draw();
                    await this.sleep(1000 / speed);
                }
            }
        }

        // 重置访问标记
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                this.maze.grid[row][col].visited = false;
            }
        }

        return this.steps;
    }
}

/**
 * Eller算法
 */
class EllerGenerator extends MazeGenerator {
    async generate(speed = 10) {
        this.maze.setAllWalls();
        let currentSet = 0;
        const sets = new Map();

        for (let row = 0; row < this.maze.rows; row++) {
            // 分配集合编号
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                if (!sets.has(cell)) {
                    sets.set(cell, currentSet++);
                }
            }

            // 随机连接同一行的格子
            for (let col = 0; col < this.maze.cols - 1; col++) {
                const cell = this.maze.grid[row][col];
                const right = this.maze.grid[row][col + 1];
                
                if (sets.get(cell) !== sets.get(right) && (row === this.maze.rows - 1 || Math.random() < 0.5)) {
                    this.maze.removeWall(cell, right);
                    const oldSet = sets.get(right);
                    const newSet = sets.get(cell);
                    
                    // 合并集合
                    for (const [c, s] of sets.entries()) {
                        if (s === oldSet) sets.set(c, newSet);
                    }

                    if (speed > 0) {
                        this.steps.push({ type: 'connect', cells: [cell, right] });
                        if (this.renderer) this.renderer.draw();
                        await this.sleep(1000 / speed);
                    }
                }
            }

            // 向下连接（除了最后一行）
            if (row < this.maze.rows - 1) {
                const setConnections = new Map();
                
                for (let col = 0; col < this.maze.cols; col++) {
                    const cell = this.maze.grid[row][col];
                    const cellSet = sets.get(cell);
                    
                    if (!setConnections.has(cellSet)) {
                        setConnections.set(cellSet, []);
                    }
                    setConnections.get(cellSet).push(col);
                }

                // 每个集合至少连接一个下方格子
                for (const cols of setConnections.values()) {
                    const connectCount = 1 + Math.floor(Math.random() * cols.length);
                    const shuffled = cols.sort(() => Math.random() - 0.5);
                    
                    for (let i = 0; i < connectCount; i++) {
                        const col = shuffled[i];
                        const cell = this.maze.grid[row][col];
                        const below = this.maze.grid[row + 1][col];
                        
                        this.maze.removeWall(cell, below);
                        sets.set(below, sets.get(cell));

                        if (speed > 0) {
                            this.steps.push({ type: 'connect', cells: [cell, below] });
                            if (this.renderer) this.renderer.draw();
                            await this.sleep(1000 / speed);
                        }
                    }
                }
            }
        }

        return this.steps;
    }
}

/**
 * 二叉树算法
 */
class BinaryTreeGenerator extends MazeGenerator {
    async generate(speed = 10) {
        this.maze.setAllWalls();

        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                const neighbors = [];

                if (row > 0) neighbors.push(this.maze.grid[row - 1][col]);
                if (col > 0) neighbors.push(this.maze.grid[row][col - 1]);

                if (neighbors.length > 0) {
                    const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
                    this.maze.removeWall(cell, chosen);

                    if (speed > 0) {
                        this.steps.push({ type: 'connect', cells: [cell, chosen] });
                        if (this.renderer) this.renderer.draw();
                        await this.sleep(1000 / speed);
                    }
                }
            }
        }

        return this.steps;
    }
}

/**
 * Sidewinder算法
 */
class SidewinderGenerator extends MazeGenerator {
    async generate(speed = 10) {
        this.maze.setAllWalls();

        for (let row = 0; row < this.maze.rows; row++) {
            let runStart = 0;

            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                const shouldCloseRun = col === this.maze.cols - 1 || (row > 0 && Math.random() < 0.5);

                if (shouldCloseRun) {
                    // 从当前run中选择一个格子向上连接
                    if (row > 0) {
                        const runCol = runStart + Math.floor(Math.random() * (col - runStart + 1));
                        const runCell = this.maze.grid[row][runCol];
                        const above = this.maze.grid[row - 1][runCol];
                        this.maze.removeWall(runCell, above);

                        if (speed > 0) {
                            this.steps.push({ type: 'connect', cells: [runCell, above] });
                            if (this.renderer) this.renderer.draw();
                            await this.sleep(1000 / speed);
                        }
                    }
                    runStart = col + 1;
                } else {
                    // 向右连接
                    const right = this.maze.grid[row][col + 1];
                    this.maze.removeWall(cell, right);

                    if (speed > 0) {
                        this.steps.push({ type: 'connect', cells: [cell, right] });
                        if (this.renderer) this.renderer.draw();
                        await this.sleep(1000 / speed);
                    }
                }
            }
        }

        return this.steps;
    }
}

// 生成器工厂
const GeneratorFactory = {
    create(algorithmName, maze) {
        const generators = {
            'recursiveBacktracking': RecursiveBacktrackingGenerator,
            'prim': PrimGenerator,
            'kruskal': KruskalGenerator,
            'recursiveDivision': RecursiveDivisionGenerator,
            'wilson': WilsonGenerator,
            'eller': EllerGenerator,
            'binaryTree': BinaryTreeGenerator,
            'sidewinder': SidewinderGenerator
        };

        const GeneratorClass = generators[algorithmName];
        if (!GeneratorClass) {
            throw new Error(`未知的生成算法: ${algorithmName}`);
        }

        return new GeneratorClass(maze);
    }
};
