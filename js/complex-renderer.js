/**
 * 复杂迷宫渲染器
 * 支持多层3D、六边形、环形、量子、相对论等特殊迷宫的渲染
 */

// ==================== 多层3D迷宫渲染器 ====================

class MultiLayerRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = Math.min(600 / maze.rows, 600 / maze.cols);
        this.currentLayer = 0;
        this.view3D = false; // 是否使用3D视图
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.view3D) {
            this.draw3DIsometric();
        } else {
            // 默认显示单层，更清晰
            this.drawSingleLayer();
        }
        
        this.drawLayerIndicator();
    }
    
    // 绘制单层（默认模式）
    drawSingleLayer() {
        const layer = this.maze.grid3D[this.currentLayer];
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = layer[row][col];
                this.drawCell3DWithOffset(cell, row, col, 0, 0);
            }
        }
    }
    
    // 绘制所有层（叠加显示，备用）
    drawAllLayers() {
        // 从下往上绘制所有层
        for (let layer = 0; layer < this.maze.layers; layer++) {
            const layerGrid = this.maze.grid3D[layer];
            const offsetX = layer * 50; // 每层横向偏移
            const offsetY = layer * 50; // 每层纵向偏移
            
            for (let row = 0; row < this.maze.rows; row++) {
                for (let col = 0; col < this.maze.cols; col++) {
                    const cell = layerGrid[row][col];
                    this.drawCell3DWithOffset(cell, row, col, offsetX, offsetY);
                }
            }
            
            // 绘制层标签
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(`第${layer + 1}层`, offsetX + 5, offsetY + 15);
        }
    }
    
    // 绘制单层（旧版本，保留以防其他代码使用）
    draw2DLayer() {
        const layer = this.maze.grid3D[this.currentLayer];
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = layer[row][col];
                this.drawCell3D(cell, row, col);
            }
        }
    }
    
    // 绘制带偏移的单元格（用于多层显示）
    drawCell3DWithOffset(cell, row, col, offsetX = 0, offsetY = 0) {
        const x = col * this.cellSize + offsetX;
        const y = row * this.cellSize + offsetY;
        
        // 背景色（根据层数变化）
        const layerOpacity = 0.6 + (cell.layer / this.maze.layers) * 0.3;
        this.ctx.fillStyle = `rgba(40, 40, 50, ${layerOpacity})`;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 绘制墙壁
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${layerOpacity})`;
        this.ctx.lineWidth = 2;
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
        
        // 绘制楼梯
        if (cell.hasStairsUp) {
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = `${this.cellSize / 2}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('↑', x + this.cellSize / 2, y + this.cellSize / 2);
        }
        if (cell.hasStairsDown) {
            this.ctx.fillStyle = '#0ff';
            this.ctx.fillText('↓', x + this.cellSize / 2, y + this.cellSize / 2);
        }
        
        // 访问状态
        if (cell.visited) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        if (cell.inPath) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.6)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        // 起点和终点
        if (cell === this.maze.start) {
            this.ctx.fillStyle = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        if (cell === this.maze.end) {
            this.ctx.fillStyle = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawCell3D(cell, row, col) {
        const x = col * this.cellSize;
        const y = row * this.cellSize;
        
        // 背景色（根据层数变化）
        const opacity = 0.3 + (cell.layer / this.maze.layers) * 0.7;
        this.ctx.fillStyle = `rgba(50, 50, 50, ${opacity})`;
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 绘制墙壁
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
        
        // 绘制楼梯
        if (cell.hasStairsUp) {
            this.ctx.fillStyle = '#ff0';
            this.ctx.font = `${this.cellSize / 2}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('↑', x + this.cellSize / 2, y + this.cellSize / 2);
        }
        if (cell.hasStairsDown) {
            this.ctx.fillStyle = '#0ff';
            this.ctx.fillText('↓', x + this.cellSize / 2, y + this.cellSize / 2);
        }
        
        // 访问状态
        if (cell.visited) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        if (cell.inPath) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
    }
    
    // 绘制等距3D视图
    draw3DIsometric() {
        const scale = 20;
        const offsetX = this.canvas.width / 2;
        const offsetY = 100;
        
        // 从后往前绘制各层
        for (let layer = this.maze.layers - 1; layer >= 0; layer--) {
            const layerOpacity = 0.3 + (layer / this.maze.layers) * 0.7;
            
            for (let row = this.maze.rows - 1; row >= 0; row--) {
                for (let col = 0; col < this.maze.cols; col++) {
                    const cell = this.maze.grid3D[layer][row][col];
                    this.drawCell3DIsometric(cell, row, col, layer, scale, offsetX, offsetY, layerOpacity);
                }
            }
        }
    }
    
    drawCell3DIsometric(cell, row, col, layer, scale, offsetX, offsetY, opacity) {
        // 等距投影坐标
        const x = offsetX + (col - row) * scale * 0.5;
        const y = offsetY + (col + row) * scale * 0.25 - layer * scale * 0.5;
        
        // 绘制立方体顶面
        this.ctx.fillStyle = `rgba(100, 100, 100, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + scale * 0.5, y + scale * 0.25);
        this.ctx.lineTo(x, y + scale * 0.5);
        this.ctx.lineTo(x - scale * 0.5, y + scale * 0.25);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制墙壁
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawGravitationalLensing() {
        // 绘制引力透镜效应的弯曲光线
        const pulse = Math.sin(this.animationTime) * 0.5 + 0.5;
        
        for (const bh of this.maze.blackHoles) {
            // 绘制从黑洞发出的弯曲场线
            this.ctx.strokeStyle = `rgba(255, 200, 100, ${0.2 + pulse * 0.1})`;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                this.ctx.beginPath();
                const startX = bh.col * this.cellSize + this.cellSize / 2;
                const startY = bh.row * this.cellSize + this.cellSize / 2;
                
                for (let r = this.cellSize; r < this.cellSize * 5; r += this.cellSize / 5) {
                    // 弯曲的螺旋线
                    const bendAngle = angle + (r / (this.cellSize * 3)) * Math.PI / 4;
                    const x = startX + Math.cos(bendAngle) * r;
                    const y = startY + Math.sin(bendAngle) * r;
                    
                    if (r === this.cellSize) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    // 叠加粗线高亮路径
    drawPathOverlay(color = '#ffd700') {
        const path = this.maze.path;
        if (!path || path.length < 2) return;
        const outlineWidth = Math.max(6, Math.floor(this.cellSize / 3));
        const lineWidth = Math.max(4, Math.floor(this.cellSize / 4));
        
        // 黑色描边
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = outlineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        const first = path[0];
        this.ctx.moveTo(first.col * this.cellSize + this.cellSize / 2, first.row * this.cellSize + this.cellSize / 2);
        for (let i = 1; i < path.length; i++) {
            const c = path[i];
            this.ctx.lineTo(c.col * this.cellSize + this.cellSize / 2, c.row * this.cellSize + this.cellSize / 2);
        }
        this.ctx.stroke();
        
        // 发光彩色路径
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = color;
        this.ctx.beginPath();
        this.ctx.moveTo(first.col * this.cellSize + this.cellSize / 2, first.row * this.cellSize + this.cellSize / 2);
        for (let i = 1; i < path.length; i++) {
            const c = path[i];
            this.ctx.lineTo(c.col * this.cellSize + this.cellSize / 2, c.row * this.cellSize + this.cellSize / 2);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawStartEnd() {
        // 将层信息显示在迷宫外部（画布顶部居中）
        const indicatorWidth = 200;
        const indicatorHeight = 40;
        const x = (this.canvas.width - indicatorWidth) / 2; // 居中
        const y = 10; // 顶部位置
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(x, y, indicatorWidth, indicatorHeight);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        if (this.view3D) {
            this.ctx.fillText('3D视图', x + indicatorWidth / 2, y + indicatorHeight / 2);
        } else {
            this.ctx.fillText(`第 ${this.currentLayer + 1} 层 / 共 ${this.maze.layers} 层`, x + indicatorWidth / 2, y + indicatorHeight / 2);
        }
    }
    
    setLayer(layer) {
        this.currentLayer = Math.max(0, Math.min(this.maze.layers - 1, layer));
        this.draw();
    }
}

// ==================== 六边形迷宫渲染器 ====================

class HexRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        // 计算合适的六边形大小
        this.hexSize = Math.min(
            (canvas.width - 200) / (maze.cols * 1.5 + 0.5),
            (canvas.height - 200) / (maze.rows * Math.sqrt(3))
        );
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawHexCell(cell);
            }
        }
    }
    
    drawHexCell(cell) {
        const pos = this.hexToPixel(cell.row, cell.col);
        const x = pos.x;
        const y = pos.y;
        
        // 绘制六边形背景（使用更明亮的颜色）
        if (cell === this.maze.start) {
            this.ctx.fillStyle = '#0f0'; // 绿色起点
        } else if (cell === this.maze.end) {
            this.ctx.fillStyle = '#f00'; // 红色终点
        } else if (cell.inPath) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.7)'; // 金色路径
        } else if (cell.visited) {
            this.ctx.fillStyle = 'rgba(100, 200, 255, 0.3)'; // 浅蓝色访问
        } else {
            this.ctx.fillStyle = '#333'; // 灰色背景
        }
        
        this.drawHexagon(x, y, this.hexSize, true);
        
        // 绘制墙壁（更粗的线条）
        this.ctx.strokeStyle = '#ffff00'; // 黄色墙壁，更明显
        this.ctx.lineWidth = 3;
        
        for (let i = 0; i < 6; i++) {
            if (cell.walls[i]) {
                const angle1 = (Math.PI / 3) * i - Math.PI / 6; // 调整角度，使其对齐
                const angle2 = (Math.PI / 3) * (i + 1) - Math.PI / 6;
                
                const x1 = x + this.hexSize * Math.cos(angle1);
                const y1 = y + this.hexSize * Math.sin(angle1);
                const x2 = x + this.hexSize * Math.cos(angle2);
                const y2 = y + this.hexSize * Math.sin(angle2);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        }
    }
    
    drawHexagon(x, y, size, fill = false) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6; // 与wall角度一致
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        
        if (fill) {
            this.ctx.fill();
        }
        // 不绘制边框，让drawHexCell单独绘制墙壁
    }
    
    hexToPixel(row, col) {
        const x = 100 + col * this.hexSize * 1.5;
        const y = 100 + row * this.hexSize * Math.sqrt(3) + (col % 2) * this.hexSize * Math.sqrt(3) / 2;
        return { x, y };
    }
}

// ==================== 环形迷宫渲染器 ====================

class CircularRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;
        this.innerRadius = 50;
        this.ringWidth = Math.min(200 / maze.rings, 30);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let ring = 0; ring < this.maze.rings; ring++) {
            for (let sector = 0; sector < (this.maze.grid[ring] ? this.maze.grid[ring].length : 0); sector++) {
                const cell = this.maze.grid[ring][sector];
                this.drawCircularCell(cell);
            }
        }
        
        // 绘制起点和终点
        this.drawStartEndMarkers();
    }
    
    drawStartEndMarkers() {
        // 起点（中心）
        if (this.maze.start) {
            this.ctx.fillStyle = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, 15, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('S', this.centerX, this.centerY);
        }
        
        // 终点（最外环）
        if (this.maze.end) {
            const ring = this.maze.end.ring;
            const sector = this.maze.end.sector;
            const sectorsInRing = this.maze.grid[ring] ? this.maze.grid[ring].length : 0;
            
            const angle = (sector / sectorsInRing) * Math.PI * 2 - Math.PI / 2 + (Math.PI / sectorsInRing);
            const radius = this.innerRadius + (ring + 0.5) * this.ringWidth;
            
            const x = this.centerX + radius * Math.cos(angle);
            const y = this.centerY + radius * Math.sin(angle);
            
            this.ctx.fillStyle = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('E', x, y);
        }
    }
    
    drawCircularCell(cell) {
        const ring = cell.ring;
        const sector = cell.sector;
        const sectorsInRing = this.maze.grid[ring] ? this.maze.grid[ring].length : 0;
        
        const angleStart = (sector / sectorsInRing) * Math.PI * 2 - Math.PI / 2;
        const angleEnd = ((sector + 1) / sectorsInRing) * Math.PI * 2 - Math.PI / 2;
        const radiusInner = this.innerRadius + ring * this.ringWidth;
        const radiusOuter = this.innerRadius + (ring + 1) * this.ringWidth;
        
        // 背景
        this.ctx.fillStyle = cell.visited ? 'rgba(0, 255, 0, 0.3)' : '#222';
        if (cell.inPath) this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, radiusOuter, angleStart, angleEnd);
        this.ctx.arc(this.centerX, this.centerY, radiusInner, angleEnd, angleStart, true);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 墙壁
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        
        // 内圈墙
        if (cell.walls.inner) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radiusInner, angleStart, angleEnd);
            this.ctx.stroke();
        }
        
        // 外圈墙
        if (cell.walls.outer) {
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, radiusOuter, angleStart, angleEnd);
            this.ctx.stroke();
        }
        
        // 径向墙
        if (cell.walls.clockwise) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + radiusInner * Math.cos(angleEnd),
                this.centerY + radiusInner * Math.sin(angleEnd)
            );
            this.ctx.lineTo(
                this.centerX + radiusOuter * Math.cos(angleEnd),
                this.centerY + radiusOuter * Math.sin(angleEnd)
            );
            this.ctx.stroke();
        }
        
        if (cell.walls.counterClockwise) {
            this.ctx.beginPath();
            this.ctx.moveTo(
                this.centerX + radiusInner * Math.cos(angleStart),
                this.centerY + radiusInner * Math.sin(angleStart)
            );
            this.ctx.lineTo(
                this.centerX + radiusOuter * Math.cos(angleStart),
                this.centerY + radiusOuter * Math.sin(angleStart)
            );
            this.ctx.stroke();
        }
    }
    
    // 将环形坐标转换为像素坐标
    polarToPixel(ring, sector) {
        // 确保ring和sector在有效范围内
        if (ring < 0 || ring >= this.maze.rings || !this.maze.grid[ring]) {
            // 返回中心点作为默认位置
            return { x: this.centerX, y: this.centerY };
        }
        
        const sectorsInRing = this.maze.grid[ring].length || 1;
        // 确保sector在有效范围内
        const validSector = ((sector % sectorsInRing) + sectorsInRing) % sectorsInRing;
        const angle = (validSector / sectorsInRing) * Math.PI * 2 - Math.PI / 2 + (Math.PI / sectorsInRing);
        const radius = this.innerRadius + (ring + 0.5) * this.ringWidth;
        
        const x = this.centerX + radius * Math.cos(angle);
        const y = this.centerY + radius * Math.sin(angle);
        
        return { x, y };
    }
}

// ==================== 加权迷宫渲染器 ====================

class WeightedRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = Math.min(600 / maze.rows, 600 / maze.cols);
        this.showWeights = true;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawWeightedCell(cell);
            }
        }
    }
    
    drawWeightedCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;
        
        // 根据权重着色
        const weight = cell.weight || 1;
        const hue = 120 - (weight / 10) * 120; // 绿色(低权重)到红色(高权重)
        this.ctx.fillStyle = `hsl(${hue}, 70%, 40%)`;
        
        if (cell.visited) {
            this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        }
        if (cell.inPath) {
            this.ctx.fillStyle = '#ff0';
        }
        
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 绘制墙壁
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 3;
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
        
        // 显示权重数字
        if (this.showWeights && this.cellSize > 20) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${Math.floor(this.cellSize / 3)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(weight, x + this.cellSize / 2, y + this.cellSize / 2);
        }
    }
}

// ==================== 量子迷宫渲染器 ====================

class QuantumRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = Math.min(600 / maze.rows, 600 / maze.cols);
        this.showProbabilities = true;
        this.animationTime = 0;
        this.pulseSpeed = 2;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 更新动画时间
        this.animationTime += 0.05;
        
        // 先绘制叠加态连接（在格子之前）
        this.drawQuantumConnections();
        
        // 再绘制纠缠连接
        this.drawEntanglementLines();
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawQuantumCell(cell);
            }
        }
        
        // 绘制起点和终点
        this.drawStartEnd();
    }
    
    drawQuantumCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;
        
        // 计算脉冲效果
        const pulse = Math.sin(this.animationTime * this.pulseSpeed) * 0.5 + 0.5;
        
        // 叠加态用波动效果表示
        if (cell.isSuperposition && cell.quantumState && !cell.quantumState.collapsed) {
            // 多层光晕效果
            this.ctx.shadowBlur = 15 + pulse * 10;
            this.ctx.shadowColor = `rgba(0, 255, 255, ${0.8 + pulse * 0.2})`;
            
            // 渐变背景
            const gradient = this.ctx.createRadialGradient(
                x + this.cellSize / 2, y + this.cellSize / 2, 0,
                x + this.cellSize / 2, y + this.cellSize / 2, this.cellSize
            );
            gradient.addColorStop(0, `rgba(0, 255, 255, ${0.4 + pulse * 0.2})`);
            gradient.addColorStop(1, `rgba(0, 100, 150, ${0.2 + pulse * 0.1})`);
            this.ctx.fillStyle = gradient;
        } else if (cell.quantumState && cell.quantumState.collapsed) {
            // 塌缩后显示红色
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = 'rgba(255, 100, 100, 0.5)';
            this.ctx.fillStyle = 'rgba(100, 50, 50, 0.3)';
        } else {
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#1a1a1a';
        }
        
        // 纠缠态的特殊效果
        if (cell.isEntangled) {
            const entangleGradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
            entangleGradient.addColorStop(0, `rgba(255, 0, 255, ${0.3 + pulse * 0.2})`);
            entangleGradient.addColorStop(1, `rgba(150, 0, 255, ${0.2 + pulse * 0.1})`);
            this.ctx.fillStyle = entangleGradient;
            this.ctx.shadowColor = 'rgba(255, 0, 255, 0.6)';
        }
        
        if (cell.visited) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.25)';
        }
        if (cell.inPath) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'rgba(255, 0, 0, 0.8)';
        }
        
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 绘制墙壁（叠加态的墙壁半透明）
        this.ctx.shadowBlur = 0;
        if (cell.isSuperposition && !cell.quantumState.collapsed) {
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + pulse * 0.2})`;
            this.ctx.lineWidth = 1.5;
        } else {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
        }
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
        
        // 显示概率和特殊标记
        if (this.cellSize > 15) {
            this.ctx.shadowBlur = 0;
            
            // 显示叠加态数量
            if (cell.quantumState && cell.quantumState.positions.length > 1 && !cell.quantumState.collapsed) {
                const numStates = cell.quantumState.positions.length;
                this.ctx.fillStyle = '#0ff';
                this.ctx.font = `bold ${Math.floor(this.cellSize / 3)}px Arial`;
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(`Ψ${numStates}`, x + this.cellSize / 2, y + this.cellSize / 2);
            }
            
            // 显示纠缠标记
            if (cell.isEntangled && this.cellSize > 20) {
                this.ctx.fillStyle = '#f0f';
                this.ctx.font = `${Math.floor(this.cellSize / 5)}px Arial`;
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText('↔', x + 2, y + 2);
            }
        }
    }
    
    drawQuantumConnections() {
        const pulse = Math.sin(this.animationTime * this.pulseSpeed) * 0.5 + 0.5;
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                
                if (cell.quantumState && cell.quantumState.positions.length > 1 && !cell.quantumState.collapsed) {
                    const x1 = col * this.cellSize + this.cellSize / 2;
                    const y1 = row * this.cellSize + this.cellSize / 2;
                    
                    for (let i = 1; i < cell.quantumState.positions.length; i++) {
                        const pos = cell.quantumState.positions[i];
                        const x2 = pos.col * this.cellSize + this.cellSize / 2;
                        const y2 = pos.row * this.cellSize + this.cellSize / 2;
                        
                        // 波动的叠加态连线
                        this.ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 + pulse * 0.2})`;
                        this.ctx.lineWidth = 1.5 + pulse;
                        this.ctx.setLineDash([5 + pulse * 3, 5]);
                        
                        // 绘制曲线
                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, y1);
                        
                        // 使用贝塞尔曲线产生波动效果
                        const midX = (x1 + x2) / 2 + Math.sin(this.animationTime + i) * 10;
                        const midY = (y1 + y2) / 2 + Math.cos(this.animationTime + i) * 10;
                        this.ctx.quadraticCurveTo(midX, midY, x2, y2);
                        this.ctx.stroke();
                        
                        // 绘制叠加态位置的光点
                        this.ctx.fillStyle = `rgba(0, 255, 255, ${0.5 + pulse * 0.3})`;
                        this.ctx.beginPath();
                        this.ctx.arc(x2, y2, 3 + pulse * 2, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawEntanglementLines() {
        const pulse = Math.sin(this.animationTime * this.pulseSpeed * 1.5) * 0.5 + 0.5;
        
        // 绘制纠缠连线
        if (this.maze.entangledPairs) {
            for (const pair of this.maze.entangledPairs) {
                const cell1 = pair.cell1;
                const cell2 = pair.cell2;
                
                const x1 = cell1.col * this.cellSize + this.cellSize / 2;
                const y1 = cell1.row * this.cellSize + this.cellSize / 2;
                const x2 = cell2.col * this.cellSize + this.cellSize / 2;
                const y2 = cell2.row * this.cellSize + this.cellSize / 2;
                
                // 纠缠线（紫色脉冲）
                this.ctx.strokeStyle = `rgba(255, 0, 255, ${0.2 + pulse * 0.2})`;
                this.ctx.lineWidth = 2 + pulse * 1.5;
                this.ctx.setLineDash([10, 5]);
                
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
                
                // 绘制纠缠点的特殊效果
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = 'rgba(255, 0, 255, 0.8)';
                this.ctx.fillStyle = `rgba(255, 0, 255, ${0.6 + pulse * 0.3})`;
                
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, 4 + pulse * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.beginPath();
                this.ctx.arc(x2, y2, 4 + pulse * 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.shadowBlur = 0;
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawStartEnd() {
        // 起点
        if (this.maze.start) {
            const x = this.maze.start.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.start.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#0f0';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
        }
        
        // 终点
        if (this.maze.end) {
            const x = this.maze.end.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.end.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#f00';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
        }
    }
}

// ==================== 4D迷宫渲染器 ====================

class Maze4DRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = Math.min(200 / maze.rows, 200 / maze.cols);
        this.currentTimeSlice = 0;
        this.currentDepthSlice = 0;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制4个2D切片（时间-深度的4个组合）
        this.draw2DSlice(0, 0, this.currentTimeSlice, this.currentDepthSlice);
        this.draw2DSlice(this.canvas.width / 2, 0, this.currentTimeSlice, (this.currentDepthSlice + 1) % this.maze.depth);
        this.draw2DSlice(0, this.canvas.height / 2, (this.currentTimeSlice + 1) % this.maze.time, this.currentDepthSlice);
        this.draw2DSlice(this.canvas.width / 2, this.canvas.height / 2, (this.currentTimeSlice + 1) % this.maze.time, (this.currentDepthSlice + 1) % this.maze.depth);
        
        this.drawDimensionIndicator();
    }
    
    draw2DSlice(offsetX, offsetY, time, depth) {
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid4D[time][depth][row][col];
                this.drawCell4D(cell, row, col, offsetX, offsetY);
            }
        }
        
        // 标签
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`T=${time}, D=${depth}`, offsetX + 10, offsetY + 20);
    }
    
    drawCell4D(cell, row, col, offsetX, offsetY) {
        const x = offsetX + col * this.cellSize;
        const y = offsetY + row * this.cellSize;
        
        // 背景
        this.ctx.fillStyle = cell.visited ? 'rgba(0, 255, 0, 0.3)' : '#222';
        if (cell.inPath) this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 墙壁
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
    }
    
    drawDimensionIndicator() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, this.canvas.height - 50, 200, 40);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`时间: ${this.currentTimeSlice}  深度: ${this.currentDepthSlice}`, 20, this.canvas.height - 25);
    }
}

// ==================== 岛屿迷宫渲染器 ====================

class IslandRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = Math.min(600 / maze.rows, 600 / maze.cols);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawIslandCell(cell);
            }
        }
        
        // 绘制桥梁
        this.drawBridges();
        
        // 绘制起点和终点
        this.drawStartEnd();
    }
    
    drawIslandCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;
        
        // 背景颜色
        if (cell.isWater) {
            // 水域：蓝色
            this.ctx.fillStyle = '#1e90ff';
        } else if (cell.isLand) {
            // 陆地：根据岛屿ID使用不同的棕色/绿色
            const hue = 30 + (cell.islandId * 40) % 120; // 30-150度（棕色到绿色）
            this.ctx.fillStyle = `hsl(${hue}, 60%, 40%)`;
            
            if (cell.visited) {
                this.ctx.fillStyle = `hsl(${hue}, 60%, 60%)`;
            }
            if (cell.inPath) {
                this.ctx.fillStyle = '#ffd700'; // 金色路径
            }
        }
        
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 只在陆地上绘制墙壁
        if (cell.isLand) {
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            
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
                this.ctx.moveTo(x, y + this.cellSize);
                this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
            }
            if (cell.walls.left) {
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x, y + this.cellSize);
            }
            this.ctx.stroke();
        }
    }
    
    drawBridges() {
        this.ctx.strokeStyle = '#ff8c00'; // 橙色桥梁
        this.ctx.lineWidth = 4;
        
        for (const bridge of this.maze.bridges) {
            const x1 = bridge.from.col * this.cellSize + this.cellSize / 2;
            const y1 = bridge.from.row * this.cellSize + this.cellSize / 2;
            const x2 = bridge.to.col * this.cellSize + this.cellSize / 2;
            const y2 = bridge.to.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // 绘制桥梁端点
            this.ctx.fillStyle = '#ff8c00';
            this.ctx.beginPath();
            this.ctx.arc(x1, y1, 6, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(x2, y2, 6, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawStartEnd() {
        // 起点
        if (this.maze.start) {
            const x = this.maze.start.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.start.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // 终点
        if (this.maze.end) {
            const x = this.maze.end.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.end.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}

// ==================== 传送门迷宫渲染器 ====================

class PortalRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = Math.min(600 / maze.rows, 600 / maze.cols);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制标准迷宫
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawCell(cell);
            }
        }
        
        // 绘制传送门连接线
        this.drawPortalConnections();
        
        // 绘制传送门标记
        this.drawPortals();
        
        // 绘制起点和终点
        this.drawStartEnd();
    }
    
    drawCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;
        
        // 背景
        this.ctx.fillStyle = cell.visited ? 'rgba(0, 255, 0, 0.3)' : '#222';
        if (cell.inPath) this.ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
        
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        
        // 墙壁
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 2;
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
    }
    
    drawPortalConnections() {
        // 绘制传送门之间的连接线
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 2;
        
        for (const portalPair of this.maze.portals) {
            const p1 = portalPair.portal1;
            const p2 = portalPair.portal2;
            
            const x1 = p1.col * this.cellSize + this.cellSize / 2;
            const y1 = p1.row * this.cellSize + this.cellSize / 2;
            const x2 = p2.col * this.cellSize + this.cellSize / 2;
            const y2 = p2.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.strokeStyle = p1.portalColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawPortals() {
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                
                if (cell.isPortal) {
                    const x = cell.col * this.cellSize + this.cellSize / 2;
                    const y = cell.row * this.cellSize + this.cellSize / 2;
                    
                    // 外圈光晕
                    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.cellSize / 2);
                    gradient.addColorStop(0, cell.portalColor);
                    gradient.addColorStop(0.7, cell.portalColor.replace('50%', '30%'));
                    gradient.addColorStop(1, 'transparent');
                    
                    this.ctx.fillStyle = gradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.cellSize / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 传送门内圈
                    this.ctx.fillStyle = cell.portalColor;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
                    this.ctx.fill();
                    
                    // 白色边框
                    this.ctx.strokeStyle = '#fff';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                    
                    // 传送门符号
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 16px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText('P', x, y);
                }
            }
        }
    }
    
    drawStartEnd() {
        // 起点
        if (this.maze.start) {
            const x = this.maze.start.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.start.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        // 终点
        if (this.maze.end) {
            const x = this.maze.end.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.end.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}

// ==================== 相对论迷宫渲染器 ====================

class RelativityRenderer {
    constructor(canvas, maze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = 20;
        this.animationTime = 0;
        this.showMetric = true;
        this.showEventHorizons = true;
        this.calculateCellSize();
        this.resizeCanvas();
    }
    
    calculateCellSize() {
        const maxWidth = 800;
        const maxHeight = 600;
        const cellSizeByWidth = Math.floor(maxWidth / this.maze.cols);
        const cellSizeByHeight = Math.floor(maxHeight / this.maze.rows);
        this.cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, 30);
        this.cellSize = Math.max(this.cellSize, 5);
    }
    
    resizeCanvas() {
        this.canvas.width = this.maze.cols * this.cellSize;
        this.canvas.height = this.maze.rows * this.cellSize;
    }
    
    draw() {
        // 防御式尺寸校正
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.calculateCellSize();
            this.resizeCanvas();
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.animationTime += 0.02;
        
        // 绘制引力场背景
        this.drawGravitationalField();
        
        // 绘制格子
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawRelativityCell(cell);
            }
        }
        
        // 路径高亮（粗线叠加）
        this.drawPathOverlay();
        
        // 绘制黑洞和事件视界
        this.drawBlackHoles();
        
        // 绘制引力透镜效果线
        this.drawGravitationalLensing();
        
        // 绘制起点和终点
        this.drawStartEnd();
        
        // 绘制信息面板
        this.drawInfoPanel();
    }
    
    drawGravitationalField() {
        // 绘制引力场的热力图
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                
                const metric = this.maze.getMetric(row, col);
                
                // 根据引力强度着色（蓝色=弱引力，红色=强引力）
                const intensity = Math.min(metric / 10, 1);
                const hue = 240 - intensity * 240; // 240(蓝)到0(红)
                const alpha = 0.1 + intensity * 0.2;
                
                this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            }
        }
    }
    
    drawRelativityCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;
        
        // 事件视界内的格子 - 黑色，无法进入
        if (cell.inEventHorizon) {
            const pulse = Math.sin(this.animationTime * 3) * 0.5 + 0.5;
            this.ctx.fillStyle = `rgba(0, 0, 0, ${0.9 + pulse * 0.1})`;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            
            // 绘制警告标记
            this.ctx.strokeStyle = `rgba(255, 0, 0, ${0.5 + pulse * 0.5})`;
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            
            // X标记
            this.ctx.beginPath();
            this.ctx.moveTo(x + 4, y + 4);
            this.ctx.lineTo(x + this.cellSize - 4, y + this.cellSize - 4);
            this.ctx.moveTo(x + this.cellSize - 4, y + 4);
            this.ctx.lineTo(x + 4, y + this.cellSize - 4);
            this.ctx.stroke();
            return;
        }
        
        // 高引力区域
        if (cell.isHighGravity) {
            const pulse = Math.sin(this.animationTime * 2) * 0.3 + 0.7;
            this.ctx.fillStyle = `rgba(255, 100, 0, ${0.3 * pulse})`;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
        
        // 访问状态
        if (cell.visited) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        if (cell.inPath) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        // 绘制墙壁（在高引力区域墙壁扭曲）
        const baseLine = Math.max(2, Math.floor(this.cellSize / 6));
        if (cell.isHighGravity) {
            this.ctx.strokeStyle = 'rgba(255, 150, 0, 0.9)';
            this.ctx.lineWidth = baseLine + 1;
        } else {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = baseLine;
        }
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
        
        // 显示时间膨胀系数
        if (this.showMetric && this.cellSize > 20 && cell.timeDilation < 0.9) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${Math.floor(this.cellSize / 4)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const dilationText = cell.timeDilation.toFixed(2);
            this.ctx.fillText(dilationText, x + this.cellSize / 2, y + this.cellSize / 2);
        }
    }
    
    drawBlackHoles() {
        const pulse = Math.sin(this.animationTime * 2) * 0.5 + 0.5;
        
        for (const bh of this.maze.blackHoles) {
            const x = bh.col * this.cellSize + this.cellSize / 2;
            const y = bh.row * this.cellSize + this.cellSize / 2;
            
            // 多层光环效果
            for (let i = 5; i > 0; i--) {
                const radius = this.cellSize * (0.3 + i * 0.15) * (1 + pulse * 0.1);
                const alpha = (0.1 / i) * (1 - pulse * 0.3);
                
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(255, 100, 0, ${alpha * 2})`);
                gradient.addColorStop(0.5, `rgba(255, 50, 0, ${alpha})`);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 黑洞核心
            this.ctx.fillStyle = '#000';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 边缘光环（吸积盘）
            this.ctx.strokeStyle = `rgba(255, 150, 0, ${0.8 + pulse * 0.2})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize * 0.35, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 黑洞符号
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('⚫', x, y);
        }
    }
    
    drawGravitationalLensing() {
        // 绘制引力透镜效应的弯曲光线
        const pulse = Math.sin(this.animationTime) * 0.5 + 0.5;
        
        for (const bh of this.maze.blackHoles) {
            // 绘制从黑洞发出的弯曲场线
            this.ctx.strokeStyle = `rgba(255, 200, 100, ${0.2 + pulse * 0.1})`;
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            
            for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                this.ctx.beginPath();
                const startX = bh.col * this.cellSize + this.cellSize / 2;
                const startY = bh.row * this.cellSize + this.cellSize / 2;
                
                for (let r = this.cellSize; r < this.cellSize * 5; r += this.cellSize / 5) {
                    // 弯曲的螺旋线
                    const bendAngle = angle + (r / (this.cellSize * 3)) * Math.PI / 4;
                    const x = startX + Math.cos(bendAngle) * r;
                    const y = startY + Math.sin(bendAngle) * r;
                    
                    if (r === this.cellSize) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                }
                this.ctx.stroke();
            }
        }
        
        this.ctx.setLineDash([]);
    }
    
    // 叠加粗线高亮路径
    drawPathOverlay(color = '#ffd700') {
        const path = this.maze.path;
        if (!path || path.length < 2) return;
        const outlineWidth = Math.max(6, Math.floor(this.cellSize / 3));
        const lineWidth = Math.max(4, Math.floor(this.cellSize / 4));
        
        // 黑色描边
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = outlineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        const first = path[0];
        this.ctx.moveTo(first.col * this.cellSize + this.cellSize / 2, first.row * this.cellSize + this.cellSize / 2);
        for (let i = 1; i < path.length; i++) {
            const c = path[i];
            this.ctx.lineTo(c.col * this.cellSize + this.cellSize / 2, c.row * this.cellSize + this.cellSize / 2);
        }
        this.ctx.stroke();
        
        // 发光彩色路径
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = color;
        this.ctx.beginPath();
        this.ctx.moveTo(first.col * this.cellSize + this.cellSize / 2, first.row * this.cellSize + this.cellSize / 2);
        for (let i = 1; i < path.length; i++) {
            const c = path[i];
            this.ctx.lineTo(c.col * this.cellSize + this.cellSize / 2, c.row * this.cellSize + this.cellSize / 2);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawStartEnd() {
        // 起点
        if (this.maze.start) {
            const x = this.maze.start.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.start.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#0f0';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
            
            // S标记
            this.ctx.fillStyle = '#000';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('S', x, y);
        }
        
        // 终点
        if (this.maze.end) {
            const x = this.maze.end.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.end.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#f00';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
            
            // E标记
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('E', x, y);
        }
    }
    
    drawInfoPanel() {
        // 信息面板
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 280, 120);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const lines = [
            '🌌 相对论迷宫',
            `⚫ 黑洞数量: ${this.maze.blackHoles.length}`,
            `🚫 事件视界: ${this.maze.eventHorizons.length} 格`,
            `🔥 高引力区: 红色区域`,
            `⏱️ 数字 = 时间膨胀系数`,
            `   (越小时间流逝越慢)`
        ];
        
        lines.forEach((line, i) => {
            this.ctx.fillText(line, 20, 35 + i * 18);
        });
        
        // 图例
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 140, 280, 80);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('图例:', 20, 160);
        
        // 事件视界示例
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(20, 170, 20, 20);
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(20, 170, 20, 20);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('= 事件视界（不可进入）', 50, 183);
        
        // 高引力区示例
        this.ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
        this.ctx.fillRect(20, 195, 20, 20);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText('= 高引力区（路径弯曲）', 50, 208);
    }
}

// ==================== 混沌迷宫渲染器 ====================

class ChaosRenderer {
    constructor(canvas, maze) {
        this.showInfo = false;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maze = maze;
        this.cellSize = 20;
        this.animationTime = 0;
        this.calculateCellSize();
        this.resizeCanvas();
    }
    
    calculateCellSize() {
        const maxWidth = 800;
        const maxHeight = 600;
        const cellSizeByWidth = Math.floor(maxWidth / this.maze.cols);
        const cellSizeByHeight = Math.floor(maxHeight / this.maze.rows);
        this.cellSize = Math.min(cellSizeByWidth, cellSizeByHeight, 30);
        this.cellSize = Math.max(this.cellSize, 5);
    }
    
    resizeCanvas() {
        this.canvas.width = this.maze.cols * this.cellSize;
        this.canvas.height = this.maze.rows * this.cellSize;
    }
    
    draw() {
        // 防御式尺寸校正
        if (this.canvas.width === 0 || this.canvas.height === 0) {
            this.calculateCellSize();
            this.resizeCanvas();
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.animationTime += 0.05;
        
        // 绘制混沌能量场
        this.drawChaosField();
        
        // 绘制涡旋效果
        this.drawVortices();
        
        // 绘制格子
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const cell = this.maze.grid[row][col];
                this.drawChaosCell(cell);
            }
        }
        
        // 路径高亮（粗线叠加）
        this.drawPathOverlay();
        
        // 绘制分形边界
        this.drawFractalBoundaries();
        
        // 绘制吸引子陷阱
        this.drawAttractorTraps();
        
        // 绘制洛伦兹轨迹
        this.drawLorenzTrail();
        
        // 绘制起点和终点
        this.drawStartEnd();
        
        // 绘制信息面板（默认关闭，可通过方法开启）
        if (this.showInfo) this.drawInfoPanel();
    }
    
    drawChaosField() {
        // 绘制混沌能量场的热力图
        for (let row = 0; row < this.maze.rows; row++) {
            for (let col = 0; col < this.maze.cols; col++) {
                const x = col * this.cellSize;
                const y = row * this.cellSize;
                const cell = this.maze.grid[row][col];
                
                if (cell.chaosValue) {
                    // 根据混沌值着色
                    const intensity = Math.min(cell.chaosValue / 50, 1);
                    const hue = (cell.lorenzPhase || 0) * 180 / Math.PI; // 使用相位决定色相
                    const alpha = 0.1 + intensity * 0.3;
                    
                    this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }
        }
    }
    
    drawVortices() {
        const pulse = Math.sin(this.animationTime * 2) * 0.5 + 0.5;
        
        for (const vortex of this.maze.chaoticVortices) {
            const x = vortex.col * this.cellSize + this.cellSize / 2;
            const y = vortex.row * this.cellSize + this.cellSize / 2;
            
            // 绘制多层涡旋效果
            for (let i = 0; i < 3; i++) {
                const radius = (vortex.radius * this.cellSize) * (1 + i * 0.5) * (1 + pulse * 0.2);
                const alpha = (0.2 / (i + 1)) * (1 - pulse * 0.5);
                
                // 旋转渐变
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
                gradient.addColorStop(0, `rgba(255, 0, 255, ${alpha * 2})`);
                gradient.addColorStop(0.5, `rgba(150, 0, 255, ${alpha})`);
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 绘制旋转符号
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(this.animationTime * vortex.strength);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + pulse * 0.2})`;
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🌀', 0, 0);
            this.ctx.restore();
        }
    }
    
    drawChaosCell(cell) {
        const x = cell.col * this.cellSize;
        const y = cell.row * this.cellSize;
        
        // 访问状态
        if (cell.visited) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        if (cell.inPath) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.7)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        // 绘制墙壁（不稳定墙壁用虚线）
        const isUnstable = cell.hasUnstableWall;
        
        if (isUnstable) {
            const pulse = Math.sin(this.animationTime * 5) * 0.5 + 0.5;
            this.ctx.strokeStyle = `rgba(255, 100, 255, ${0.7})`;
            this.ctx.lineWidth = Math.max(2, Math.floor(this.cellSize / 6));
            this.ctx.setLineDash([6, 6]);
        } else {
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = Math.max(2, Math.floor(this.cellSize / 6));
            this.ctx.setLineDash([]);
        }
        
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
            this.ctx.moveTo(x, y + this.cellSize);
            this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
        }
        if (cell.walls.left) {
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x, y + this.cellSize);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 显示混沌值
        if (this.cellSize > 25 && cell.chaosValue) {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${Math.floor(this.cellSize / 4)}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(cell.chaosValue.toFixed(0), x + this.cellSize / 2, y + this.cellSize / 2);
        }
    }
    
    drawFractalBoundaries() {
        for (const cell of this.maze.fractalBoundaries) {
            const x = cell.col * this.cellSize;
            const y = cell.row * this.cellSize;
            
            // 分形边界用复杂的图案
            const gradient = this.ctx.createLinearGradient(x, y, x + this.cellSize, y + this.cellSize);
            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 0, 255, 0.6)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            
            // 绘制分形纹理
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const offset = i * this.cellSize / 4;
                this.ctx.strokeRect(x + offset, y + offset, this.cellSize - offset * 2, this.cellSize - offset * 2);
            }
        }
    }
    
    drawAttractorTraps() {
        const pulse = Math.sin(this.animationTime * 3) * 0.5 + 0.5;
        
        for (const trap of this.maze.attractorTraps) {
            const x = trap.col * this.cellSize + this.cellSize / 2;
            const y = trap.row * this.cellSize + this.cellSize / 2;
            
            // 绘制吸引子陷阱效果
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.cellSize);
            gradient.addColorStop(0, `rgba(255, 0, 0, ${0.6 + pulse * 0.3})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 绘制陷阱符号
            this.ctx.fillStyle = `rgba(255, 255, 0, ${0.8 + pulse * 0.2})`;
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🕸️', x, y);
        }
    }
    
    drawLorenzTrail() {
        // 绘制洛伦兹吸引子的轨迹
        if (this.maze.chaosHistory.length < 2) return;
        
        this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        
        const step = Math.floor(this.maze.chaosHistory.length / 100); // 只绘制部分轨迹
        
        for (let i = 0; i < this.maze.chaosHistory.length; i += step) {
            const point = this.maze.chaosHistory[i];
            const row = Math.floor((point.y + 20) * this.maze.rows / 40) % this.maze.rows;
            const col = Math.floor((point.x + 20) * this.maze.cols / 40) % this.maze.cols;
            
            const x = col * this.cellSize + this.cellSize / 2;
            const y = row * this.cellSize + this.cellSize / 2;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        
        this.ctx.stroke();
    }
    
    // 叠加粗线高亮路径
    drawPathOverlay(color = '#ffd700') {
        const path = this.maze.path;
        if (!path || path.length < 2) return;
        const outlineWidth = Math.max(6, Math.floor(this.cellSize / 3));
        const lineWidth = Math.max(4, Math.floor(this.cellSize / 4));
        
        // 黑色描边
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = outlineWidth;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowBlur = 0;
        this.ctx.beginPath();
        const first = path[0];
        this.ctx.moveTo(first.col * this.cellSize + this.cellSize / 2, first.row * this.cellSize + this.cellSize / 2);
        for (let i = 1; i < path.length; i++) {
            const c = path[i];
            this.ctx.lineTo(c.col * this.cellSize + this.cellSize / 2, c.row * this.cellSize + this.cellSize / 2);
        }
        this.ctx.stroke();
        
        // 发光彩色路径
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = color;
        this.ctx.beginPath();
        this.ctx.moveTo(first.col * this.cellSize + this.cellSize / 2, first.row * this.cellSize + this.cellSize / 2);
        for (let i = 1; i < path.length; i++) {
            const c = path[i];
            this.ctx.lineTo(c.col * this.cellSize + this.cellSize / 2, c.row * this.cellSize + this.cellSize / 2);
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }
    
    drawStartEnd() {
        // 起点
        if (this.maze.start) {
            const x = this.maze.start.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.start.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#0f0';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#0f0';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
        }
        
        // 终点
        if (this.maze.end) {
            const x = this.maze.end.col * this.cellSize + this.cellSize / 2;
            const y = this.maze.end.row * this.cellSize + this.cellSize / 2;
            
            this.ctx.fillStyle = '#f00';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#f00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.shadowBlur = 0;
            this.ctx.stroke();
        }
    }
    
    toggleInfo(show = null) {
        if (show === null) this.showInfo = !this.showInfo;
        else this.showInfo = !!show;
    }
    
    drawInfoPanel() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(10, 10, 300, 140);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const lines = [
            '🌀 混沌迷宫',
            `🌀 涡旋: ${this.maze.chaoticVortices.length} 个`,
            `🕸️ 吸引子陷阱: ${this.maze.attractorTraps.length} 个`,
            `🔸 分形边界: ${this.maze.fractalBoundaries.size} 个`,
            `⚡ 不稳定墙壁: ${this.maze.unstableWalls.length} 个`,
            `🕒 时间: ${this.maze.time.toFixed(2)}`,
            `🐛 蝴蝶效应: 微小改变→巨大影响`
        ];
        
        lines.forEach((line, i) => {
            this.ctx.fillText(line, 20, 35 + i * 18);
        });
    }
}

// ==================== 无限迷宫渲染器 ====================

class InfiniteRenderer {
    constructor(canvas, infiniteMaze) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.infiniteMaze = infiniteMaze;
        this.cellSize = 25;
        this.viewportCols = Math.floor(800 / this.cellSize);
        this.viewportRows = Math.floor(600 / this.cellSize);
        this.cameraPos = { row: 0, col: 0 };
        this.animationTime = 0;
        
        // 当前渲染的迷宫区块（用于solver等需要标准Maze接口的组件）
        this.maze = null;
        
        this.resizeCanvas();
        this.setupKeyboardControl();
    }
    
    resizeCanvas() {
        this.canvas.width = this.viewportCols * this.cellSize;
        this.canvas.height = this.viewportRows * this.cellSize;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.animationTime += 0.05;
        
        // 更新旋转墙
        this.infiniteMaze.updateRotatingWalls();
        
        // 计算视口范围
        const startRow = this.cameraPos.row - Math.floor(this.viewportRows / 2);
        const startCol = this.cameraPos.col - Math.floor(this.viewportCols / 2);
        
        // 加载周围区块
        this.infiniteMaze.loadChunksAround(this.cameraPos.row, this.cameraPos.col);
        
        // 绘制可见区域
        for (let viewRow = 0; viewRow < this.viewportRows; viewRow++) {
            for (let viewCol = 0; viewCol < this.viewportCols; viewCol++) {
                const globalRow = startRow + viewRow;
                const globalCol = startCol + viewCol;
                
                const cell = this.infiniteMaze.getCell(globalRow, globalCol);
                const chunk = this.infiniteMaze.getChunkForCell(globalRow, globalCol);
                
                this.drawInfiniteCell(cell, viewRow, viewCol, chunk.biome, globalRow, globalCol);
            }
        }
        
        // 绘制玩家位置
        this.drawPlayer();
        
        // 绘制迷雾（未探索区域）
        this.drawFogOfWar(startRow, startCol);
        
        // 绘制信息面板
        this.drawInfoPanel();
        
        // 绘制小地图
        this.drawMinimap();
    }
    
    drawInfiniteCell(cell, viewRow, viewCol, biome, globalRow, globalCol) {
        const x = viewCol * this.cellSize;
        const y = viewRow * this.cellSize;
        
        // 背景色（根据生物群系）
        const isExplored = this.infiniteMaze.isExplored(globalRow, globalCol);
        if (isExplored) {
            this.ctx.fillStyle = biome.color;
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
            this.ctx.globalAlpha = 1.0;
        } else {
            // 未探索区域显示为暗色
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
        }
        
        // 访问状态
        if (cell.visited && isExplored) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.15)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        if (cell.inPath && isExplored) {
            this.ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
            this.ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        }
        
        // 绘制墙壁
        if (isExplored) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            
            // 检查是否是旋转墙
            const isRotating = this.infiniteMaze.rotatingWalls.has(`${globalRow},${globalCol}`);
            if (isRotating) {
                const pulse = Math.sin(this.animationTime * 3) * 0.5 + 0.5;
                this.ctx.strokeStyle = `rgba(200, 100, 255, ${0.8 + pulse * 0.2})`;
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([5, 5]);
            }
            
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
                this.ctx.moveTo(x, y + this.cellSize);
                this.ctx.lineTo(x + this.cellSize, y + this.cellSize);
            }
            if (cell.walls.left) {
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x, y + this.cellSize);
            }
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // 绘制传送门
            if (cell.portal) {
                const pulse = Math.sin(this.animationTime * 2) * 0.5 + 0.5;
                this.ctx.save();
                this.ctx.translate(x + this.cellSize / 2, y + this.cellSize / 2);
                this.ctx.rotate(this.animationTime);
                
                // 绘制多层旋转光环
                for (let i = 0; i < 3; i++) {
                    const radius = (this.cellSize / 4) * (1 + i * 0.3);
                    const alpha = (0.4 / (i + 1)) * (1 + pulse * 0.5);
                    
                    this.ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
                
                this.ctx.restore();
                
                // 传送门符号
                this.ctx.fillStyle = `rgba(100, 200, 255, ${0.8 + pulse * 0.2})`;
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🌀', x + this.cellSize / 2, y + this.cellSize / 2);
            }
            
            // 绘制锁门
            if (cell.hasLockedDoor) {
                this.ctx.fillStyle = '#8b4513';
                this.ctx.fillRect(x + this.cellSize/4, y + this.cellSize/4, this.cellSize/2, this.cellSize/2);
                this.ctx.fillStyle = '#ffd700';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🔒', x + this.cellSize / 2, y + this.cellSize / 2);
            }
            
            // 绘制钥匙
            if (cell.hasKey) {
                this.ctx.fillStyle = '#ffd700';
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#ffd700';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🔑', x + this.cellSize / 2, y + this.cellSize / 2);
                this.ctx.shadowBlur = 0;
            }
            
            // 绘制食物
            if (cell.hasFood) {
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#ff6b6b';
                this.ctx.font = 'bold 16px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText('🍎', x + this.cellSize / 2, y + this.cellSize / 2);
                this.ctx.shadowBlur = 0;
            }
        }
    }
    
    drawPlayer() {
        const playerViewRow = this.infiniteMaze.playerPos.row - (this.cameraPos.row - Math.floor(this.viewportRows / 2));
        const playerViewCol = this.infiniteMaze.playerPos.col - (this.cameraPos.col - Math.floor(this.viewportCols / 2));
        
        const x = playerViewCol * this.cellSize + this.cellSize / 2;
        const y = playerViewRow * this.cellSize + this.cellSize / 2;
        
        // 玩家光环
        const pulse = Math.sin(this.animationTime * 4) * 0.5 + 0.5;
        this.ctx.fillStyle = `rgba(255, 255, 100, ${0.3 + pulse * 0.2})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.cellSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 玩家图标
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ff0';
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.cellSize / 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawFogOfWar(startRow, startCol) {
        // 绘制未探索区域的迷雾
        this.ctx.globalAlpha = 0.8;
        for (let viewRow = 0; viewRow < this.viewportRows; viewRow++) {
            for (let viewCol = 0; viewCol < this.viewportCols; viewCol++) {
                const globalRow = startRow + viewRow;
                const globalCol = startCol + viewCol;
                
                if (!this.infiniteMaze.isExplored(globalRow, globalCol)) {
                    const x = viewCol * this.cellSize;
                    const y = viewRow * this.cellSize;
                    
                    this.ctx.fillStyle = '#000';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }
            }
        }
        this.ctx.globalAlpha = 1.0;
    }
    
    drawInfoPanel() {
        // 信息面板
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(10, 10, 280, 160);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        
        const chunk = this.infiniteMaze.getChunkForCell(this.infiniteMaze.playerPos.row, this.infiniteMaze.playerPos.col);
        const distance = Math.sqrt(
            chunk.chunkCoords.row * chunk.chunkCoords.row +
            chunk.chunkCoords.col * chunk.chunkCoords.col
        ).toFixed(1);
        
        const lines = [
            '∞ 无限迷宫',
            `位置: (${this.infiniteMaze.playerPos.row}, ${this.infiniteMaze.playerPos.col})`,
            `生物群系: ${chunk.biome.name}`,
            `距起点: ${distance} 区块`,
            `难度: ${chunk.difficulty.toFixed(1)}x`,
            `耐力: ${this.infiniteMaze.stamina.toFixed(0)}%`,
            `钥匙: ${this.infiniteMaze.collectedKeys.size}`,  
            `食物: ${this.infiniteMaze.collectedFood}`,
            `已探索: ${this.infiniteMaze.exploredCells.size} 格`,
            `已加载区块: ${this.infiniteMaze.loadedChunks.size}`
        ];
        
        lines.forEach((line, i) => {
            this.ctx.fillText(line, 20, 30 + i * 16);
        });
    }
    
    drawMinimap() {
        const minimapSize = 120;
        const minimapX = this.canvas.width - minimapSize - 10;
        const minimapY = 10;
        
        // 背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX, minimapY, minimapSize, minimapSize);
        
        // 绘制已加载区块
        const chunkScale = minimapSize / (this.infiniteMaze.viewDistance * 2 + 1);
        const centerChunk = this.infiniteMaze.getChunkCoords(this.cameraPos.row, this.cameraPos.col);
        
        for (let dr = -this.infiniteMaze.viewDistance; dr <= this.infiniteMaze.viewDistance; dr++) {
            for (let dc = -this.infiniteMaze.viewDistance; dc <= this.infiniteMaze.viewDistance; dc++) {
                const chunkRow = centerChunk.chunkRow + dr;
                const chunkCol = centerChunk.chunkCol + dc;
                const key = `${chunkRow},${chunkCol}`;
                
                if (this.infiniteMaze.loadedChunks.has(key)) {
                    const chunk = this.infiniteMaze.chunks.get(key);
                    const x = minimapX + (dc + this.infiniteMaze.viewDistance) * chunkScale;
                    const y = minimapY + (dr + this.infiniteMaze.viewDistance) * chunkScale;
                    
                    this.ctx.fillStyle = chunk.biome.color;
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.fillRect(x, y, chunkScale, chunkScale);
                    this.ctx.globalAlpha = 1.0;
                    
                    this.ctx.strokeStyle = '#666';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x, y, chunkScale, chunkScale);
                }
            }
        }
        
        // 玩家位置标记
        const playerX = minimapX + minimapSize / 2;
        const playerY = minimapY + minimapSize / 2;
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(playerX, playerY, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    setupKeyboardControl() {
        // 方向键控制玩家移动
        document.addEventListener('keydown', (e) => {
            if (!this.infiniteMaze) return;
            
            const { row, col } = this.infiniteMaze.playerPos;
            let newRow = row;
            let newCol = col;
            
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    newRow--;
                    break;
                case 'ArrowDown': case 's': case 'S':
                    newRow++;
                    break;
                case 'ArrowLeft': case 'a': case 'A':
                    newCol--;
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    newCol++;
                    break;
                default:
                    return;
            }
            
            // 尝试移动玩家
            console.log(`尝试从 (${row}, ${col}) 移动到 (${newRow}, ${newCol})`);
            if (this.infiniteMaze.movePlayer(newRow, newCol)) {
                this.cameraPos = { row: newRow, col: newCol };
                this.draw();
                e.preventDefault();
            } else {
                console.log("移动失败");
            }
        });
    }
    
    getDirection(fromRow, fromCol, toRow, toCol) {
        if (toRow < fromRow) return 'top';
        if (toRow > fromRow) return 'bottom';
        if (toCol < fromCol) return 'left';
        if (toCol > fromCol) return 'right';
        return null;
    }
}

// 导出渲染器
window.MazeComplexRenderers = {
    MultiLayerRenderer,
    HexRenderer,
    CircularRenderer,
    WeightedRenderer,
    QuantumRenderer,
    Maze4DRenderer,
    IslandRenderer,
    PortalRenderer,
    RelativityRenderer,
    ChaosRenderer,
    InfiniteRenderer
};

console.log('🎨 复杂迷宫渲染器已加载');
