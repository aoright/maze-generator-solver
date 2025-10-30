/**
 * Cell 类 - 表示迷宫中的单个格子
 */
class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
        this.visited = false;
        this.inPath = false;
        this.distance = Infinity;
        this.parent = null;
    }

    reset() {
        this.visited = false;
        this.inPath = false;
        this.distance = Infinity;
        this.parent = null;
    }
}

/**
 * Maze 类 - 迷宫的主要数据结构
 */
class Maze {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.grid = [];
        this.start = null;
        this.end = null;
        this.path = [];
        this.visitedCells = [];
        
        this.initializeGrid();
    }

    /**
     * 初始化网格
     */
    initializeGrid() {
        this.grid = [];
        for (let row = 0; row < this.rows; row++) {
            const currentRow = [];
            for (let col = 0; col < this.cols; col++) {
                currentRow.push(new Cell(row, col));
            }
            this.grid.push(currentRow);
        }

        // 设置起点和终点
        this.start = this.grid[0][0];
        this.end = this.grid[this.rows - 1][this.cols - 1];
    }

    /**
     * 获取指定位置的格子
     */
    getCell(row, col) {
        if (this.isValid(row, col)) {
            return this.grid[row][col];
        }
        return null;
    }

    /**
     * 检查坐标是否有效
     */
    isValid(row, col) {
        return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
    }

    /**
     * 移除两个格子之间的墙
     */
    removeWall(cell1, cell2) {
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

    /**
     * 获取相邻的格子
     */
    getNeighbors(cell, checkWalls = false) {
        const neighbors = [];
        const directions = [
            { row: -1, col: 0, wall: 'top' },    // 上
            { row: 0, col: 1, wall: 'right' },   // 右
            { row: 1, col: 0, wall: 'bottom' },  // 下
            { row: 0, col: -1, wall: 'left' }    // 左
        ];

        for (const dir of directions) {
            const newRow = cell.row + dir.row;
            const newCol = cell.col + dir.col;
            
            if (this.isValid(newRow, newCol)) {
                // 如果需要检查墙壁，确保没有墙才添加邻居
                if (!checkWalls || !cell.walls[dir.wall]) {
                    neighbors.push(this.grid[newRow][newCol]);
                }
            }
        }

        return neighbors;
    }

    /**
     * 获取未访问的相邻格子
     */
    getUnvisitedNeighbors(cell) {
        return this.getNeighbors(cell).filter(neighbor => !neighbor.visited);
    }

    /**
     * 重置所有格子的访问状态（用于求解算法）
     */
    resetVisited() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                this.grid[row][col].reset();
            }
        }
        this.path = [];
        this.visitedCells = [];
    }

    /**
     * 重建路径（从终点回溯到起点）
     */
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

    /**
     * 清除所有墙壁（用于某些生成算法）
     */
    clearWalls() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
                cell.walls = {
                    top: false,
                    right: false,
                    bottom: false,
                    left: false
                };
            }
        }
    }

    /**
     * 设置所有墙壁（用于某些生成算法）
     */
    setAllWalls() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = this.grid[row][col];
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

    /**
     * 添加水平墙（用于递归分割算法）
     */
    addHorizontalWall(row, colStart, colEnd, passage) {
        for (let col = colStart; col <= colEnd; col++) {
            if (col !== passage) {
                if (row > 0) {
                    this.grid[row][col].walls.top = true;
                    this.grid[row - 1][col].walls.bottom = true;
                }
            }
        }
    }

    /**
     * 添加垂直墙（用于递归分割算法）
     */
    addVerticalWall(col, rowStart, rowEnd, passage) {
        for (let row = rowStart; row <= rowEnd; row++) {
            if (row !== passage) {
                if (col > 0) {
                    this.grid[row][col].walls.left = true;
                    this.grid[row][col - 1].walls.right = true;
                }
            }
        }
    }

    /**
     * 获取迷宫统计信息
     */
    getStats() {
        let totalCells = this.rows * this.cols;
        let visitedCount = this.visitedCells.length;
        let pathLength = this.path.length;
        
        return {
            totalCells,
            visitedCount,
            pathLength,
            efficiency: pathLength > 0 ? (pathLength / visitedCount * 100).toFixed(2) : 0
        };
    }

    /**
     * 克隆迷宫（用于对比测试）
     */
    clone() {
        const newMaze = new Maze(this.rows, this.cols);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                newMaze.grid[row][col].walls = { ...this.grid[row][col].walls };
            }
        }
        
        return newMaze;
    }
}
