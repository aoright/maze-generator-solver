/**
 * 迷宫生成器扩展功能包
 * 包含第7、8、9阶段的高级功能
 */

// ==================== 第7阶段：功能增强 ====================

/**
 * 7.1 导入导出功能
 */
class MazeIO {
    static exportToJSON(maze) {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            size: {
                rows: maze.rows,
                cols: maze.cols
            },
            start: { row: maze.start.row, col: maze.start.col },
            end: { row: maze.end.row, col: maze.end.col },
            walls: this.compressWalls(maze)
        };
        
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `maze-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        return data;
    }
    
    static compressWalls(maze) {
        const walls = [];
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const cell = maze.grid[row][col];
                let code = 0;
                if (cell.walls.top) code |= 1;
                if (cell.walls.right) code |= 2;
                if (cell.walls.bottom) code |= 4;
                if (cell.walls.left) code |= 8;
                walls.push(code);
            }
        }
        return walls;
    }
    
    static importFromJSON(jsonData, app) {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        
        const maze = new Maze(data.size.rows, data.size.cols);
        
        // 恢复墙壁
        let idx = 0;
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const code = data.walls[idx++];
                const cell = maze.grid[row][col];
                cell.walls.top = (code & 1) !== 0;
                cell.walls.right = (code & 2) !== 0;
                cell.walls.bottom = (code & 4) !== 0;
                cell.walls.left = (code & 8) !== 0;
            }
        }
        
        maze.start = maze.grid[data.start.row][data.start.col];
        maze.end = maze.grid[data.end.row][data.end.col];
        
        return maze;
    }
    
    static exportToSVG(maze, cellSize = 20) {
        const width = maze.cols * cellSize;
        const height = maze.rows * cellSize;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
        svg += `  <rect width="${width}" height="${height}" fill="white"/>\n`;
        
        // 绘制墙壁
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const cell = maze.grid[row][col];
                const x = col * cellSize;
                const y = row * cellSize;
                
                if (cell.walls.top) {
                    svg += `  <line x1="${x}" y1="${y}" x2="${x + cellSize}" y2="${y}" stroke="black" stroke-width="2"/>\n`;
                }
                if (cell.walls.right) {
                    svg += `  <line x1="${x + cellSize}" y1="${y}" x2="${x + cellSize}" y2="${y + cellSize}" stroke="black" stroke-width="2"/>\n`;
                }
                if (cell.walls.bottom) {
                    svg += `  <line x1="${x}" y1="${y + cellSize}" x2="${x + cellSize}" y2="${y + cellSize}" stroke="black" stroke-width="2"/>\n`;
                }
                if (cell.walls.left) {
                    svg += `  <line x1="${x}" y1="${y}" x2="${x}" y2="${y + cellSize}" stroke="black" stroke-width="2"/>\n`;
                }
            }
        }
        
        // 标记起点和终点
        svg += `  <circle cx="${maze.start.col * cellSize + cellSize/2}" cy="${maze.start.row * cellSize + cellSize/2}" r="${cellSize/4}" fill="green"/>\n`;
        svg += `  <circle cx="${maze.end.col * cellSize + cellSize/2}" cy="${maze.end.row * cellSize + cellSize/2}" r="${cellSize/4}" fill="red"/>\n`;
        
        svg += '</svg>';
        
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `maze-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        
        return svg;
    }
}

/**
 * 7.2 热力图可视化
 */
class HeatmapVisualizer {
    constructor(renderer) {
        this.renderer = renderer;
    }
    
    show(maze) {
        const visitCounts = new Map();
        let maxCount = 0;
        
        maze.visitedCells.forEach(cell => {
            const key = `${cell.row},${cell.col}`;
            const count = (visitCounts.get(key) || 0) + 1;
            visitCounts.set(key, count);
            maxCount = Math.max(maxCount, count);
        });
        
        const ctx = this.renderer.ctx;
        const cellSize = this.renderer.cellSize;
        
        for (let row = 0; row < maze.rows; row++) {
            for (let col = 0; col < maze.cols; col++) {
                const key = `${row},${col}`;
                const count = visitCounts.get(key) || 0;
                
                if (count > 0) {
                    const intensity = count / maxCount;
                    const x = col * cellSize;
                    const y = row * cellSize;
                    
                    // 颜色从蓝色（低）到红色（高）
                    const hue = (1 - intensity) * 240; // 240=蓝, 0=红
                    ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.6)`;
                    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
                }
            }
        }
        
        this.renderer.drawStartEnd();
    }
}

/**
 * 7.3 游戏模式 - 键盘控制
 */
class GameMode {
    constructor(maze, renderer) {
        this.maze = maze;
        this.renderer = renderer;
        // 对于3D迷宫，添加layer属性
        if (maze instanceof MazeComplex.MultiLayerMaze && maze.start.layer !== undefined) {
            this.player = { row: maze.start.row, col: maze.start.col, layer: maze.start.layer || 0 };
        } 
        // 对于环形迷宫，确保使用正确的属性
        else if (maze instanceof MazeComplex.CircularMaze) {
            this.player = { row: maze.start.ring, col: maze.start.sector, layer: 0 };
        } else {
            this.player = { row: maze.start.row, col: maze.start.col, layer: 0 };
        }
        this.moves = 0;
        this.totalWeight = 0; // 加权迷宫的总权重
        this.startTime = null;
        this.active = false;
        this.trail = [];
        // 绑定事件处理函数，确保可以正确移除
        this.boundHandleKeyPress = this.handleKeyPress.bind(this);
    }
    
    start() {
        this.active = true;
        this.startTime = Date.now();
        this.moves = 0;
        this.totalWeight = 0; // 重置总权重
        // 对于3D迷宫，添加layer属性
        if (this.maze instanceof MazeComplex.MultiLayerMaze && this.maze.start.layer !== undefined) {
            this.player = { row: this.maze.start.row, col: this.maze.start.col, layer: this.maze.start.layer || 0 };
        } 
        // 对于环形迷宫，确保使用正确的属性
        else if (this.maze instanceof MazeComplex.CircularMaze) {
            this.player = { row: this.maze.start.ring, col: this.maze.start.sector, layer: 0 };
        } else {
            this.player = { row: this.maze.start.row, col: this.maze.start.col, layer: 0 };
        }
        this.trail = [{ ...this.player }];
        
        // 初始化起点权重
        this.addCurrentCellWeight();
        
        document.addEventListener('keydown', this.boundHandleKeyPress);
        
        // 立即渲染一次
        this.render();
        
        // 启动渲染循环（特别是对于量子迷宫）
        this.startRenderLoop();
        
        console.log('🎮 游戏模式已启动，玩家位置:', this.player);
    }
    
    stop() {
        this.active = false;
        document.removeEventListener('keydown', this.boundHandleKeyPress);
        this.stopRenderLoop();
        console.log('🛑 游戏模式已停止');
    }
    
    startRenderLoop() {
        // 停止已存在的循环
        this.stopRenderLoop();
        
        // 使用setInterval更简单可靠
        this.renderInterval = setInterval(() => {
            if (this.active) {
                try {
                    this.render();
                } catch (e) {
                    console.error('渲染错误:', e);
                    this.stopRenderLoop();
                }
            }
        }, 1000 / 15); // 15 FPS - 降低频率以减少卡顿
        console.log('🔁 渲染循环已启动 (15 FPS)');
    }
    
    stopRenderLoop() {
        if (this.renderInterval) {
            clearInterval(this.renderInterval);
            this.renderInterval = null;
            console.log('⏹️ 渲染循环已停止');
        }
    }
    
    handleKeyPress(e) {
        if (!this.active) return;
        
        console.log('🎮 按下按键:', e.key);
        
        let moved = false;
        let layerChanged = false;
        
        // 检查是否为六边形迷宫
        if (this.maze instanceof MazeComplex.HexMaze) {
            // 六边形迷宫移动逻辑
            let newRow = this.player.row;
            let newCol = this.player.col;
            let direction = null;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    // 上右方向
                    direction = 4;
                    newRow--;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    // 下右方向
                    direction = 2;
                    newRow++;
                    e.preventDefault();
                    break;
                case 'q':
                case 'Q':
                    // 上左方向
                    direction = 5;
                    newRow--;
                    newCol++;
                    e.preventDefault();
                    break;
                case 'e':
                case 'E':
                    // 下左方向
                    direction = 3;
                    newRow++;
                    newCol--;
                    e.preventDefault();
                    break;
                case 'a':
                case 'A':
                    // 左方向
                    direction = 1;
                    newCol--;
                    e.preventDefault();
                    break;
                case 'd':
                case 'D':
                    // 右方向
                    direction = 0;
                    newCol++;
                    e.preventDefault();
                    break;
                default:
                    return;
            }
            
            // 检查移动有效性
            if (this.maze.isValid(newRow, newCol)) {
                const current = this.maze.grid[this.player.row][this.player.col];
                
                // 检查是否有墙壁阻挡
                let blocked = current.walls[direction];
                console.log('🧱 墙壁检查:', { direction, blocked, walls: current.walls });
                
                // 量子隧穿：如果是量子迷宫且被墙阻挡，尝试隧穿
                if (blocked && this.maze.canTunnel) {
                    const tunnelSuccess = this.maze.canTunnel(current, direction);
                    console.log('🔬 尝试量子隧穿:', { direction, success: tunnelSuccess });
                    if (tunnelSuccess) {
                        console.log('✨ ⚛️ 量子隧穿成功！穿过了墙壁！');
                        blocked = false;
                        this.showTunnelingEffect();
                    }
                }
                
                if (!blocked) {
                    this.player.row = newRow;
                    this.player.col = newCol;
                    moved = true;
                    console.log('✅ 移动成功！新位置:', this.player);
                    
                    // 量子观测：如果是量子迷宫，观测当前格子
                    const next = this.maze.grid[newRow][newCol];
                    if (this.maze.observe && next.quantumState && !next.quantumState.collapsed) {
                        console.log('🔭 ⚛️ 观测量子叠加态！波函数塌缩！');
                        this.maze.observe(next);
                        this.showObservationEffect();
                    }
                } else {
                    console.log('🚫 被墙壁阻挡');
                }
            } else {
                console.log('❌ 位置无效');
            }
        }
        // 检查是否为3D迷宫
        else if (this.maze instanceof MazeComplex.MultiLayerMaze) {
            // 3D迷宫移动逻辑
            let newRow = this.player.row;
            let newCol = this.player.col;
            let newLayer = this.player.layer;
            let direction = null;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'top';
                    newRow--;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'bottom';
                    newRow++;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'left';
                    newCol--;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'right';
                    newCol++;
                    e.preventDefault();
                    break;
                // 楼梯移动
                case 'PageUp':
                case 'u':
                case 'U':
                    newLayer++;
                    e.preventDefault();
                    break;
                case 'PageDown':
                case 'd':
                case 'D':
                    // 避免与方向键冲突
                    if (e.key === 'd' || e.key === 'D') {
                        // 只有当不是方向键时才处理为下楼
                        if (!(e.key === 'd' && (e.ctrlKey || e.metaKey))) {
                            newLayer--;
                            e.preventDefault();
                        }
                    } else {
                        newLayer--;
                        e.preventDefault();
                    }
                    break;
                default:
                    return;
            }
            
            // 处理层间移动（楼梯）
            if (newLayer !== this.player.layer) {
                const currentCell = this.maze.grid3D[this.player.layer][this.player.row][this.player.col];
                let canMove = false;
                
                if (newLayer > this.player.layer && currentCell.hasStairsUp) {
                    // 上楼梯
                    canMove = true;
                } else if (newLayer < this.player.layer && currentCell.hasStairsDown) {
                    // 下楼梯
                    canMove = true;
                }
                
                if (canMove && newLayer >= 0 && newLayer < this.maze.layers) {
                    this.player.layer = newLayer;
                    moved = true;
                    layerChanged = true;
                    console.log('✅ 通过楼梯移动到第', newLayer + 1, '层');
                    
                    // 更新渲染器显示的层
                    if (this.renderer && typeof this.renderer.setLayer === 'function') {
                        this.renderer.setLayer(newLayer);
                    }
                } else {
                    console.log('🚫 该位置没有楼梯或层无效');
                }
            } 
            // 处理平面移动
            else if (this.maze.isValid3D(newRow, newCol, this.player.layer)) {
                const current = this.maze.grid3D[this.player.layer][this.player.row][this.player.col];
                
                // 检查是否有墙壁
                let blocked = current.walls && current.walls[direction];
                console.log('🧱 墙壁检查:', { direction, blocked, walls: current.walls });
                
                // 量子隧穿：如果是量子迷宫且被墙阻挡，尝试隧穿
                if (blocked && this.maze.canTunnel) {
                    const tunnelSuccess = this.maze.canTunnel(current, direction);
                    console.log('🔬 尝试量子隧穿:', { direction, success: tunnelSuccess });
                    if (tunnelSuccess) {
                        console.log('✨ ⚛️ 量子隧穿成功！穿过了墙壁！');
                        blocked = false;
                        this.showTunnelingEffect();
                    }
                }
                
                if (!blocked) {
                    this.player.row = newRow;
                    this.player.col = newCol;
                    moved = true;
                    console.log('✅ 平面移动成功！新位置:', this.player);
                    
                    // 量子观测：如果是量子迷宫，观测当前格子
                    const next = this.maze.grid3D[this.player.layer][newRow][newCol];
                    if (this.maze.observe && next.quantumState && !next.quantumState.collapsed) {
                        console.log('🔭 ⚛️ 观测量子叠加态！波函数塌缩！');
                        this.maze.observe(next);
                        this.showObservationEffect();
                    }
                } else {
                    console.log('🚫 被墙壁阻挡');
                }
            } else {
                console.log('❌ 位置无效');
            }
        } else if (this.maze instanceof MazeComplex.CircularMaze) {
            // 环形迷宫移动逻辑
            const current = this.maze.grid[this.player.row][this.player.col];
            let direction = null;
            let newRing = this.player.row;
            let newSector = this.player.col;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    // 向内环移动
                    direction = 'inner';
                    newRing--;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    // 向外环移动
                    direction = 'outer';
                    newRing++;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    // 逆时针移动
                    direction = 'counterClockwise';
                    newSector--;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    // 顺时针移动
                    direction = 'clockwise';
                    newSector++;
                    e.preventDefault();
                    break;
                default:
                    return;
            }
            
            // 处理扇区环绕
            if (newRing >= 0 && newRing < this.maze.rings && this.maze.grid[newRing]) {
                const sectorsInNewRing = this.maze.grid[newRing].length;
                newSector = (newSector + sectorsInNewRing) % sectorsInNewRing;
            }
            
            // 检查是否有墙壁阻挡
            let blocked = false;
            if (newRing === this.player.row) {
                // 同环移动
                const sectorsInRing = this.maze.grid[this.player.row] ? this.maze.grid[this.player.row].length : 0;
                const sectorDiff = (newSector - this.player.col + sectorsInRing) % sectorsInRing;
                if (sectorDiff === 1) {
                    // 顺时针移动
                    blocked = current.walls.clockwise;
                } else if (sectorDiff === sectorsInRing - 1) {
                    // 逆时针移动
                    blocked = current.walls.counterClockwise;
                }
            } else if (newRing < this.player.row) {
                // 向内环移动
                blocked = current.walls.inner;
            } else if (newRing > this.player.row) {
                // 向外环移动
                blocked = current.walls.outer;
            }
            
            console.log('🧱 环形迷宫墙壁检查:', { direction, blocked, walls: current.walls });
            
            // 量子隧穿：如果是量子迷宫且被墙阻挡，尝试隧穿
            if (blocked && this.maze.canTunnel) {
                const tunnelSuccess = this.maze.canTunnel(current, direction);
                console.log('🔬 尝试量子隧穿:', { direction, success: tunnelSuccess });
                if (tunnelSuccess) {
                    console.log('✨ ⚛️ 量子隧穿成功！穿过了墙壁！');
                    blocked = false;
                    this.showTunnelingEffect();
                }
            }
            
            // 检查移动有效性
            if (!blocked && newRing >= 0 && newRing < this.maze.rings) {
                this.player.row = newRing;
                this.player.col = newSector;
                moved = true;
                // 添加轨迹点
                this.trail.push({ row: newRing, col: newSector });
                console.log('✅ 环形迷宫移动成功！新位置:', this.player);
                
                // 量子观测：如果是量子迷宫，观测当前格子
                const next = this.maze.grid[newRing][newSector];
                if (this.maze.observe && next.quantumState && !next.quantumState.collapsed) {
                    console.log('🔭 ⚛️ 观测量子叠加态！波函数塌缩！');
                    this.maze.observe(next);
                    this.showObservationEffect();
                }
            } else {
                console.log('🚫 被墙壁阻挡或位置无效');
            }
        } else {
            // 标准2D迷宫移动逻辑
            const current = this.maze.grid[this.player.row][this.player.col];
            let direction = null;
            let newRow = this.player.row;
            let newCol = this.player.col;
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    direction = 'top';
                    newRow--;
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    direction = 'bottom';
                    newRow++;
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    direction = 'left';
                    newCol--;
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    direction = 'right';
                    newCol++;
                    e.preventDefault();
                    break;
                default:
                    return;
            }
            
            // 检查是否有墙壁
            let blocked = current.walls && current.walls[direction];
            console.log('🧱 墙壁检查:', { direction, blocked, walls: current.walls });
            
            // 量子隧穿：如果是量子迷宫且被墙阻挡，尝试隧穿
            if (blocked && this.maze.canTunnel) {
                const tunnelSuccess = this.maze.canTunnel(current, direction);
                console.log('🔬 尝试量子隧穿:', { direction, success: tunnelSuccess });
                if (tunnelSuccess) {
                    console.log('✨ ⚛️ 量子隧穿成功！穿过了墙壁！');
                    blocked = false;
                    this.showTunnelingEffect();
                }
            }
            
            if (!blocked && this.maze.isValid(newRow, newCol)) {
                this.player.row = newRow;
                this.player.col = newCol;
                moved = true;
                console.log('✅ 移动成功！新位置:', this.player);
                
                // 量子观测：如果是量子迷宫，观测当前格子
                const next = this.maze.grid[newRow][newCol];
                if (this.maze.observe && next.quantumState && !next.quantumState.collapsed) {
                    console.log('🔭 ⚛️ 观测量子叠加态！波函数塌缩！');
                    this.maze.observe(next);
                    this.showObservationEffect();
                }
            } else {
                console.log('🚫 被墙壁阻挡或位置无效');
            }
        }
        
        if (moved) {
            this.moves++;
            // 只有非六边形迷宫才在这里添加轨迹点，六边形迷宫已在移动时添加
            if (!(this.maze instanceof MazeComplex.HexMaze)) {
                this.trail.push({ ...this.player });
            }
            // 添加当前格子的权重
            this.addCurrentCellWeight();
            
            // 检查传送门传送（仅对标准2D迷宫）
            if (!(this.maze instanceof MazeComplex.HexMaze) && 
                !(this.maze instanceof MazeComplex.MultiLayerMaze) && 
                !(this.maze instanceof MazeComplex.CircularMaze)) {
                this.checkPortalTeleport();
            }
            
            // 手动渲染
            this.render();
            this.checkWin();
        }
    }
    
    // 检查传送门传送
    checkPortalTeleport() {
        // 确保是传送门迷宫且玩家在有效位置
        if (this.maze instanceof MazeComplex.PortalMaze && 
            this.maze.isValid(this.player.row, this.player.col)) {
            
            const currentCell = this.maze.grid[this.player.row][this.player.col];
            
            // 如果当前格子是传送门
            if (currentCell.isPortal && currentCell.portalTarget) {
                console.log('🌀 触发传送门传送!');
                
                // 更新玩家位置到传送门目标位置
                this.player.row = currentCell.portalTarget.row;
                this.player.col = currentCell.portalTarget.col;
                
                // 添加传送轨迹点
                this.trail.push({ ...this.player });
                
                // 显示传送特效
                this.showPortalEffect();
                
                console.log('✅ 传送完成！新位置:', this.player);
            }
        }
    }
    
    // 显示传送特效
    showPortalEffect() {
        // 显示传送状态
        const statusText = document.getElementById('statusText');
        if (statusText) {
            const originalText = statusText.textContent;
            const originalColor = statusText.style.color;
            statusText.textContent = '🌀 传送门传送！';
            statusText.style.color = '#00ffff';
            statusText.style.fontWeight = 'bold';
            statusText.style.textShadow = '0 0 10px #00ffff';
            setTimeout(() => {
                statusText.textContent = originalText;
                statusText.style.color = originalColor;
                statusText.style.fontWeight = '';
                statusText.style.textShadow = '';
            }, 1500);
        }
        
        // 在画布上绘制传送效果
        const canvas = this.renderer.canvas;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
    
    showTunnelingEffect() {
        // 显示隧穿特效
        const statusText = document.getElementById('statusText');
        if (statusText) {
            const originalText = statusText.textContent;
            const originalColor = statusText.style.color;
            statusText.textContent = '⚛️ 量子隧穿！';
            statusText.style.color = '#0ff';
            statusText.style.fontWeight = 'bold';
            statusText.style.textShadow = '0 0 10px #0ff';
            setTimeout(() => {
                statusText.textContent = originalText;
                statusText.style.color = originalColor;
                statusText.style.fontWeight = '';
                statusText.style.textShadow = '';
            }, 1500);
        }
        
        // 在画布上绘制闪烁效果
        const canvas = this.renderer.canvas;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
    
    showObservationEffect() {
        // 显示观测特效
        const statusText = document.getElementById('statusText');
        if (statusText) {
            const originalText = statusText.textContent;
            const originalColor = statusText.style.color;
            statusText.textContent = '🔭 量子观测 - 迷宫结构改变！';
            statusText.style.color = '#f0f';
            statusText.style.fontWeight = 'bold';
            statusText.style.textShadow = '0 0 10px #f0f';
            setTimeout(() => {
                statusText.textContent = originalText;
                statusText.style.color = originalColor;
                statusText.style.fontWeight = '';
                statusText.style.textShadow = '';
            }, 2000);
        }
        
        // 在画布上绘制紫色闪烁效果
        const canvas = this.renderer.canvas;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 0, 255, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }
    
    render() {
        this.renderer.draw();
        
        // 获取上下文和单元格大小
        let ctx = this.renderer.ctx || this.renderer.canvas?.getContext('2d');
        const cellSize = this.renderer.cellSize || this.renderer.hexSize;
        
        // 对于六边形渲染器，确保获取正确的上下文
        if (this.renderer instanceof MazeComplexRenderers.HexRenderer) {
            if (!this.renderer.ctx) {
                console.error('❌ 六边形渲染器缺少ctx');
                return;
            }
            ctx = this.renderer.ctx;
        }
        
        if (!ctx || (!cellSize && !(this.renderer instanceof MazeComplexRenderers.HexRenderer) && !(this.renderer instanceof MazeComplexRenderers.CircularRenderer))) {
            console.error('❌ 无法获取ctx或cellSize');
            return;
        }
        
        // 检查是否为六边形迷宫
        if (this.maze instanceof MazeComplex.HexMaze) {
            // 六边形迷宫中的特殊渲染
            if (this.renderer instanceof MazeComplexRenderers.HexRenderer) {
                // 获取玩家在六边形网格中的位置
                const playerPos = this.renderer.hexToPixel(this.player.row, this.player.col);
                const x = playerPos.x;
                const y = playerPos.y;
                const playerRadius = Math.max(this.renderer.hexSize * 0.3, 6);
                
                // 绘制轨迹（在六边形中心之间连线）
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                if (this.trail.length > 0) {
                    const firstPos = this.renderer.hexToPixel(this.trail[0].row, this.trail[0].col);
                    ctx.moveTo(firstPos.x, firstPos.y);
                    
                    for (let i = 1; i < this.trail.length; i++) {
                        const pos = this.renderer.hexToPixel(this.trail[i].row, this.trail[i].col);
                        ctx.lineTo(pos.x, pos.y);
                    }
                }
                ctx.stroke();
                ctx.restore();
                
                // 绘制玩家
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                
                // 绘制外圈光晕
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FFD700';
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(x, y, playerRadius * 1.3, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制主体
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#FFD700';
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x, y, playerRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制边框
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制内圈高光
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(x - playerRadius * 0.2, y - playerRadius * 0.2, playerRadius * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            } else {
                // 如果不是专用的六边形渲染器，使用通用渲染方法
                this.renderGenericPlayer(ctx, cellSize);
            }
        } else if (this.maze instanceof MazeComplex.CircularMaze) {
            // 环形迷宫中的特殊渲染
            if (this.renderer instanceof MazeComplexRenderers.CircularRenderer) {
                // 获取玩家在环形网格中的位置
                const playerPos = this.renderer.polarToPixel(this.player.row, this.player.col);
                const x = playerPos.x;
                const y = playerPos.y;
                const playerRadius = Math.max(this.renderer.ringWidth * 0.3, 8);
                
                // 绘制轨迹（在环形中心之间连线）
                ctx.save();
                ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                
                if (this.trail.length > 0) {
                    const firstPos = this.renderer.polarToPixel(this.trail[0].row, this.trail[0].col);
                    ctx.moveTo(firstPos.x, firstPos.y);
                    
                    for (let i = 1; i < this.trail.length; i++) {
                        const pos = this.renderer.polarToPixel(this.trail[i].row, this.trail[i].col);
                        ctx.lineTo(pos.x, pos.y);
                    }
                }
                ctx.stroke();
                ctx.restore();
                
                // 绘制玩家
                ctx.save();
                ctx.globalCompositeOperation = 'source-over';
                
                // 绘制外圈光晕
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FFD700';
                ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
                ctx.beginPath();
                ctx.arc(x, y, playerRadius * 1.3, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制主体
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#FFD700';
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x, y, playerRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // 绘制边框
                ctx.shadowBlur = 0;
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制内圈高光
                ctx.fillStyle = '#FFF';
                ctx.beginPath();
                ctx.arc(x - playerRadius * 0.2, y - playerRadius * 0.2, playerRadius * 0.3, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            } else {
                // 如果不是专用的环形渲染器，使用通用渲染方法
                this.renderGenericPlayer(ctx, cellSize);
            }
        } else {
            // 标准渲染方法
            this.renderGenericPlayer(ctx, cellSize);
        }
        
        // 更新页面上的统计信息（不遮挡迷宫）
        this.updateStats();
    }
    
    // 通用玩家渲染方法
    renderGenericPlayer(ctx, cellSize) {
        // 绘制当前位置的高亮背景（减小强度）
        ctx.save();
        const currentX = this.player.col * cellSize;
        const currentY = this.player.row * cellSize;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
        ctx.fillRect(currentX, currentY, cellSize, cellSize);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(currentX + 1, currentY + 1, cellSize - 2, cellSize - 2);
        ctx.restore();
        
        // 绘制轨迹
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (this.trail.length > 0) {
            ctx.moveTo(
                this.trail[0].col * cellSize + cellSize / 2,
                this.trail[0].row * cellSize + cellSize / 2
            );
            
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(
                    this.trail[i].col * cellSize + cellSize / 2,
                    this.trail[i].row * cellSize + cellSize / 2
                );
            }
        }
        ctx.stroke();
        ctx.restore();
        
        // 绘制玩家
        const x = this.player.col * cellSize + cellSize / 2;
        const y = this.player.row * cellSize + cellSize / 2;
        const playerRadius = Math.max(cellSize * 0.3, 6); // 适中的半径，不遮挡墙壁
        
        // 确保玩家在最上层
        ctx.globalCompositeOperation = 'source-over';
        
        // 对于3D迷宫，根据层数改变玩家颜色
        let playerColor = '#FFD700'; // 默认金色
        let shadowColor = '#FFD700';
        
        if (this.maze instanceof MazeComplex.MultiLayerMaze) {
            // 根据层数改变颜色
            const hue = (this.player.layer / (this.maze.layers - 1 || 1)) * 120; // 0-120度（红到绿）
            playerColor = `hsl(${hue}, 100%, 50%)`;
            shadowColor = playerColor;
        }
        
        // 绘制外圈光晕（减小大小）
        ctx.shadowBlur = 10;
        ctx.shadowColor = shadowColor;
        ctx.fillStyle = playerColor.replace('50%', '20%'); // 更透明
        ctx.beginPath();
        ctx.arc(x, y, playerRadius * 1.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制主体
        ctx.shadowBlur = 8;
        ctx.shadowColor = shadowColor;
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(x, y, playerRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制边框
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制内圈高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x - playerRadius * 0.2, y - playerRadius * 0.2, playerRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // 对于3D迷宫，显示当前层数
        if (this.maze instanceof MazeComplex.MultiLayerMaze) {
            ctx.fillStyle = '#FFF';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${this.player.layer + 1}`, x, y);
        }
        
        ctx.restore();
    }
    
    updateStats() {
        const timeElapsed = this.startTime ? ((Date.now() - this.startTime) / 1000).toFixed(1) : 0;
        
        // 更新页面上的统计显示
        const statusText = document.getElementById('statusText');
        if (statusText && !statusText.textContent.includes('⚛️') && !statusText.textContent.includes('🔭')) {
            // 对于加权迷宫，显示总权重
            if (this.maze instanceof MazeComplex.WeightedMaze) {
                statusText.textContent = `游戏中 - 步数: ${this.moves} | 时间: ${timeElapsed}s | 权重: ${this.totalWeight}`;
            }
            // 对于3D迷宫，显示当前层数
            else if (this.maze instanceof MazeComplex.MultiLayerMaze) {
                statusText.textContent = `游戏中 - 步数: ${this.moves} | 时间: ${timeElapsed}s | 层数: ${this.player.layer + 1}/${this.maze.layers}`;
            } else {
                statusText.textContent = `游戏中 - 步数: ${this.moves} | 时间: ${timeElapsed}s`;
            }
        }
    }
    
    checkWin() {
        // 检查是否为六边形迷宫
        if (this.maze instanceof MazeComplex.HexMaze) {
            // 六边形迷宫胜利条件
            if (this.player.row === this.maze.end.row && 
                this.player.col === this.maze.end.col) {
                const time = ((Date.now() - this.startTime) / 1000).toFixed(2);
                this.stop();
                alert(`🎉 恭喜完成！\n步数: ${this.moves}\n时间: ${time}秒`);
            }
        }
        // 检查是否为3D迷宫
        else if (this.maze instanceof MazeComplex.MultiLayerMaze) {
            // 3D迷宫胜利条件：到达终点层的终点位置
            if (this.player.row === this.maze.end.row && 
                this.player.col === this.maze.end.col &&
                this.player.layer === this.maze.end.layer) {
                const time = ((Date.now() - this.startTime) / 1000).toFixed(2);
                this.stop();
                alert(`🎉 恭喜完成！\n步数: ${this.moves}\n时间: ${time}秒\n层数: ${this.player.layer + 1}`);
            }
        } else {
            // 标准2D迷宫胜利条件
            if (this.player.row === this.maze.end.row && 
                this.player.col === this.maze.end.col) {
                const time = ((Date.now() - this.startTime) / 1000).toFixed(2);
                this.stop();
                alert(`🎉 恭喜完成！\n步数: ${this.moves}\n时间: ${time}秒`);
            }
        }
    }
    
    // 添加当前格子的权重到总权重
    addCurrentCellWeight() {
        // 只有在加权迷宫中才计算权重
        if (this.maze instanceof MazeComplex.WeightedMaze) {
            let cell;
            // 对于3D迷宫
            if (this.maze instanceof MazeComplex.MultiLayerMaze && this.player.layer !== undefined) {
                cell = this.maze.grid3D[this.player.layer][this.player.row][this.player.col];
            } else {
                // 对于2D迷宫
                cell = this.maze.grid[this.player.row][this.player.col];
            }
            
            // 累加权重（如果存在）
            if (cell && cell.weight !== undefined) {
                this.totalWeight += cell.weight;
            }
        }
    }
    
    getStats() {
        const time = this.startTime ? ((Date.now() - this.startTime) / 1000).toFixed(2) : 0;
        return {
            moves: this.moves,
            time: time,
            efficiency: this.trail.length
        };
    }
}

/**
 * 7.4 单步执行模式
 */
class StepByStepMode {
    constructor(solver, renderer) {
        this.solver = solver;
        this.renderer = renderer;
        this.currentStep = 0;
        this.steps = [];
        this.paused = true;
    }
    
    async prepare(maze) {
        // 预先运行算法收集所有步骤
        this.solver.maze = maze;
        this.steps = [];
        
        const originalSleep = this.solver.sleep.bind(this.solver);
        this.solver.sleep = async () => {
            this.steps.push(this.captureState(maze));
            return Promise.resolve();
        };
        
        await this.solver.solve(0);
        this.solver.sleep = originalSleep;
        
        this.currentStep = 0;
    }
    
    captureState(maze) {
        return {
            visitedCells: [...maze.visitedCells],
            path: [...maze.path]
        };
    }
    
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
            return true;
        }
        return false;
    }
    
    prev() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
            return true;
        }
        return false;
    }
    
    goto(step) {
        if (step >= 0 && step < this.steps.length) {
            this.currentStep = step;
            this.renderStep();
        }
    }
    
    renderStep() {
        const state = this.steps[this.currentStep];
        // 重置迷宫状态
        this.solver.maze.resetVisited();
        
        // 应用当前步骤的状态
        state.visitedCells.forEach(cell => cell.visited = true);
        state.path.forEach(cell => cell.inPath = true);
        
        this.renderer.draw();
    }
}

// ==================== 第8阶段：复杂迷宫 ====================
// WeightedMaze、HexMaze、InfiniteMaze 在 complex-mazes.js 和 advanced-mazes.js 中定义
// 此处不重复定义


// ==================== 第9阶段：概念展示 ====================

/**
 * 9.1 混沌迷宫演示
 */
class ChaoticMazeDemo {
    constructor() {
        this.sensitivity = 1e-10;
    }
    
    demonstrateChaos(maze) {
        // 运行两次完全相同的求解，但初始位置有微小差异
        const solver1 = SolverFactory.create('dfs', maze);
        const solver2 = SolverFactory.create('dfs', maze);
        
        // 添加微小扰动
        const epsilon = this.sensitivity;
        console.log('演示混沌理论：初始条件微小差异导致完全不同结果');
        console.log(`扰动量: ${epsilon}`);
        
        return {
            message: '混沌迷宫：微小的初始差异会导致完全不同的路径',
            sensitivity: this.sensitivity
        };
    }
}

/**
 * 9.2 NP完全问题演示
 */
class NPCompleteDemo {
    static hamiltonianPath(maze) {
        console.log('哈密顿路径问题：找到访问每个格子恰好一次的路径');
        console.log('这是NP完全问题，对于大迷宫计算不可行');
        
        const totalCells = maze.rows * maze.cols;
        const complexity = this.factorial(totalCells);
        
        return {
            problem: 'Hamiltonian Path',
            complexity: `O(${totalCells}!) ≈ ${complexity}`,
            feasible: totalCells < 15
        };
    }
    
    static factorial(n) {
        if (n > 20) return 'Infinity';
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        return result.toExponential(2);
    }
}

// 导出所有扩展功能
window.MazeExtensions = {
    MazeIO,
    HeatmapVisualizer,
    GameMode,
    StepByStepMode,
    WeightedMaze,
    HexMaze,
    InfiniteMaze,
    ChaoticMazeDemo,
    NPCompleteDemo
};

console.log('🚀 迷宫扩展功能已加载');
