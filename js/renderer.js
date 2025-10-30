/**
 * 渲染引擎 - 负责绘制迷宫和可视化
 */
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = null;
        this.cellSize = 20;
        this.theme = this.themes.classic;
        this.animationFrame = null;
    }

    /**
     * 主题配置
     */
    themes = {
        classic: {
            background: '#000000',
            wall: '#ffffff',
            path: '#000000',
            start: '#00ff00',
            end: '#ff0000',
            visited: '#ffff0080',
            solution: '#0000ff',
            current: '#ff00ff'
        },
        neon: {
            background: '#0a0e27',
            wall: '#00ffff',
            path: '#1a1f3a',
            start: '#00ff00',
            end: '#ff0000',
            visited: '#ff00ff40',
            solution: '#00ffff',
            current: '#ffff00'
        },
        nature: {
            background: '#2d5016',
            wall: '#8bc34a',
            path: '#1b5e20',
            start: '#ffeb3b',
            end: '#ff5722',
            visited: '#cddc3960',
            solution: '#ff9800',
            current: '#ffc107'
        },
        cyberpunk: {
            background: '#120458',
            wall: '#ff00ff',
            path: '#1e0a46',
            start: '#00ffff',
            end: '#ff0080',
            visited: '#ff00ff40',
            solution: '#00ff00',
            current: '#ffff00'
        },
        minimal: {
            background: '#ffffff',
            wall: '#333333',
            path: '#ffffff',
            start: '#4caf50',
            end: '#f44336',
            visited: '#2196f340',
            solution: '#ff9800',
            current: '#9c27b0'
        }
    };

    /**
     * 设置主题
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.theme = this.themes[themeName];
            this.draw();
        }
    }

    /**
     * 设置迷宫
     */
    setMaze(maze) {
        this.maze = maze;
        this.calculateCellSize();
        this.resizeCanvas();
        this.draw();
    }

    /**
     * 计算格子大小
     */
    calculateCellSize() {
        if (!this.maze) return;

        const maxWidth = 800;
        const maxHeight = 600;
        const cellSizeByWidth = Math.floor(maxWidth / this.maze.cols);
        const cellSizeByHeight = Math.floor(maxHeight / this.maze.rows);
        
        this.cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, 30);
        this.cellSize = Math.max(this.cellSize, 5); // 最小5px
    }

    /**
     * 调整Canvas大小
     */
    resizeCanvas() {
        if (!this.maze) return;

        this.canvas.width = this.maze.cols * this.cellSize;
        this.canvas.height = this.maze.rows * this.cellSize;
    }

    /**
     * 绘制整个迷宫
     */
    draw() {
        if (!this.maze) return;

        // 清空画布
        this.ctx.fillStyle = this.theme.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制格子
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawCell(cell);
            }
        }

        // 绘制起点和终点
        // 如果有路径，叠加粗线高亮
        if (this.maze.path && this.maze.path.length > 1) {
            this.drawPath(this.maze.path, '#ffd700');
        }
        this.drawStartEnd();
    }

    /**
     * 绘制单个格子
     */
    drawCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;

        // 绘制背景
        if (cell.inPath) {
            // 使用半透明金色铺底，避免主题颜色干扰
            this.ctx.fillStyle = 'rgba(255, 221, 0, 0.25)';
            this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
        } else if (cell.visited) {
            this.ctx.fillStyle = this.theme.visited;
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }

        // 绘制墙壁（随格子大小自适应线宽）
        this.ctx.strokeStyle = this.theme.wall;
        this.ctx.lineWidth = Math.max(2, Math.floor(this.cellSize / 6));
        this.ctx.beginPath();

        if (cell.walls.top) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + this.cellSize, y);
        }
        if (cell.walls.right) {
            this.ctx.moveTo(x + this.cellSize, y);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.bottom) {
            this.ctx.moveTo(x + this.cellSize, y + this.cellSize);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x, y);
        }

        this.ctx.stroke();
    }

    /**
     * 绘制起点和终点
     */
    drawStartEnd() {
        if (!this.maze.start || !this.maze.end) return;

        const drawMarker = (cell, color) => {
            const x = cell.col * this.cellSize + this.cellSize / 2;
            const y = cell.row * this.cellSize + this.cellSize / 2;
            const radius = Math.min(this.cellSize / 3, 8);

            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        };

        drawMarker(this.maze.start, this.theme.start);
        drawMarker(this.maze.end, this.theme.end);
    }

    /**
     * 高亮显示格子（用于动画）
     */
    highlightCell(cell, color = null) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;

        this.ctx.fillStyle = color || this.theme.current;
        this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);

        // 重新绘制该格子的边框
        this.drawCell(cell);
    }

    /**
     * 绘制路径
     */
    drawPath(path, color = null) {
        if (!path || path.length === 0) return;

        const pathColor = color || '#ffd700';
        const outlineWidth = Math.max(6, Math.floor(this.cellSize / 3));
        const lineWidth = Math.max(4, Math.floor(this.cellSize / 4));
        
        // 先绘制黑色描边
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = outlineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        const first = path[0];
        this.ctx.moveTo(
            first.col * this.cellSize + this.cellSize / 2,
            first.row * this.cellSize + this.cellSize / 2
        );
        for (let i = 1; i < path.length; i++) {
            const cell = path[i];
            this.ctx.lineTo(
                cell.col * this.cellSize + this.cellSize / 2,
                cell.row * this.cellSize + this.cellSize / 2
            );
        }
        this.ctx.stroke();
        
        // 再绘制发光的彩色路径
        this.ctx.strokeStyle = pathColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = pathColor;
        this.ctx.beginPath();
        this.ctx.moveTo(
            first.col * this.cellSize + this.cellSize / 2,
            first.row * this.cellSize + this.cellSize / 2
        );
        for (let i = 1; i < path.length; i++) {
            const cell = path[i];
            this.ctx.lineTo(
                cell.col * this.cellSize + this.cellSize / 2,
                cell.row * this.cellSize + this.cellSize / 2
            );
        }
        this.ctx.stroke();
        
        // 重置阴影
        this.ctx.shadowBlur = 0;
    }

    /**
     * 动画绘制路径
     */
    async animatePath(path, speed = 10) {
        for (let i = 0; i < path.length; i++) {
            path[i].inPath = true;
            this.draw();
            
            if (speed > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000 / speed / 2));
            }
        }
    }

    /**
     * 清除所有访问标记
     */
    clearVisited() {
        if (!this.maze) return;

        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                cell.visited = false;
                cell.inPath = false;
            }
        }

        this.draw();
    }

    /**
     * 导出为PNG图片
     */
    exportToPNG() {
        const link = document.createElement('a');
        link.download = `maze-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }

    /**
     * 绘制网格（可选，用于调试）
     */
    drawGrid() {
        if (!this.maze) return;

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;

        for (let row = 0; row <= this.maze.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, row * this.cellSize);
            this.ctx.lineTo(this.maze.cols * this.cellSize, row * this.cellSize);
            this.ctx.stroke();
        }

        for (let col = 0; col <= this.maze.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(col * this.cellSize, 0);
            this.ctx.lineTo(col * this.cellSize, this.maze.rows * this.cellSize);
            this.ctx.stroke();
        }
    }

    /**
     * 绘制热力图（显示访问频率）
     */
    drawHeatmap(visitCounts) {
        if (!this.maze) return;

        const maxVisits = Math.max(...Object.values(visitCounts));

        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const key = `${row},${col}`;
                const visits = visitCounts[key] || 0;
                
                if (visits > 0) {
                    const intensity = visits / maxVisits;
                    const x = col * this.cellSize;
                    const y = row * this.cellSize;

                    this.ctx.fillStyle = `rgba(255, 0, 0, ${intensity * 0.7})`;
                    this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
                }
            }
        }
    }

    /**
     * 绘制距离图（显示每个格子到终点的距离）
     */
    drawDistanceMap() {
        if (!this.maze) return;

        this.ctx.font = `${Math.max(8, this.cellSize / 3)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#fff';

        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                if (cell.distance !== Infinity) {
                    const x = col * this.cellSize + this.cellSize / 2;
                    const y = row * this.cellSize + this.cellSize / 2;
                    this.ctx.fillText(cell.distance.toString(), x, y);
                }
            }
        }
    }
}
