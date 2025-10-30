/**
 * UI控制器 - 处理所有用户交互
 */
class Controls {
    constructor(app) {
        this.app = app;
        this.speed = 10;
        this.isGenerating = false;
        this.isSolving = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * 初始化DOM元素引用
     */
    initializeElements() {
        // 尺寸控制
        this.rowsInput = document.getElementById('rowsInput');
        this.colsInput = document.getElementById('colsInput');
        this.rowsValue = document.getElementById('rowsValue');
        this.colsValue = document.getElementById('colsValue');

        // 算法选择
        this.generatorSelect = document.getElementById('generatorSelect');
        this.solverSelect = document.getElementById('solverSelect');

        // 按钮
        this.generateBtn = document.getElementById('generateBtn');
        this.solveBtn = document.getElementById('solveBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.exportBtn = document.getElementById('exportBtn');

        // 速度控制
        this.speedButtons = document.querySelectorAll('.btn-speed');

        // 主题选择
        this.themeSelect = document.getElementById('themeSelect');

        // 扩展功能按钮
        this.exportJSONBtn = document.getElementById('exportJSONBtn');
        this.exportSVGBtn = document.getElementById('exportSVGBtn');
        this.heatmapBtn = document.getElementById('heatmapBtn');
        this.gameBtn = document.getElementById('gameBtn');

        // 信息面板
        this.statusText = document.getElementById('statusText');
        this.pathLength = document.getElementById('pathLength');
        this.visitedNodes = document.getElementById('visitedNodes');
        this.genTime = document.getElementById('genTime');
        this.solveTime = document.getElementById('solveTime');

        // Canvas覆盖层
        this.canvasOverlay = document.getElementById('canvasOverlay');
    }

    /**
     * 附加事件监听器
     */
    attachEventListeners() {
        // 尺寸滑块
        this.rowsInput.addEventListener('input', (e) => {
            this.rowsValue.textContent = e.target.value;
        });

        this.colsInput.addEventListener('input', (e) => {
            this.colsValue.textContent = e.target.value;
        });

        // 生成按钮
        this.generateBtn.addEventListener('click', () => {
            if (!this.isGenerating) {
                this.generateMaze();
            }
        });

        // 求解按钮
        this.solveBtn.addEventListener('click', () => {
            if (!this.isSolving && this.app.maze) {
                this.solveMaze();
            }
        });

        // 清除按钮
        this.clearBtn.addEventListener('click', () => {
            this.clearPath();
        });

        // 重置按钮
        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });

        // 导出按钮
        this.exportBtn.addEventListener('click', () => {
            this.exportMaze();
        });

        // 速度按钮
        this.speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.speedButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.speed = parseInt(e.target.dataset.speed);
            });
        });

        // 主题选择
        this.themeSelect.addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // 扩展功能
        if (this.exportJSONBtn) {
            this.exportJSONBtn.addEventListener('click', () => {
                this.exportJSON();
            });
        }

        if (this.exportSVGBtn) {
            this.exportSVGBtn.addEventListener('click', () => {
                this.exportSVG();
            });
        }

        if (this.heatmapBtn) {
            this.heatmapBtn.addEventListener('click', () => {
                this.showHeatmap();
            });
        }

        if (this.gameBtn) {
            this.gameBtn.addEventListener('click', () => {
                this.startGame();
            });
        }
    }

    /**
     * 生成迷宫
     */
    async generateMaze() {
        this.isGenerating = true;
        this.setButtonsState(false);
        this.updateStatus('正在生成迷宫...');
        this.hideOverlay();

        const rows = parseInt(this.rowsInput.value);
        const cols = parseInt(this.colsInput.value);
        const algorithm = this.generatorSelect.value;

        const startTime = performance.now();

        try {
            await this.app.generateMaze(rows, cols, algorithm, this.speed);
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            this.genTime.textContent = `${duration}秒`;
            this.updateStatus('迷宫生成完成');
            this.resetSolverStats();
        } catch (error) {
            console.error('生成失败:', error);
            this.updateStatus('生成失败');
        } finally {
            this.isGenerating = false;
            this.setButtonsState(true);
        }
    }

    /**
     * 求解迷宫
     */
    async solveMaze() {
        if (!this.app.maze) {
            this.updateStatus('请先生成迷宫');
            return;
        }

        this.isSolving = true;
        this.setButtonsState(false);
        this.updateStatus('正在求解迷宫...');

        const algorithm = this.solverSelect.value;
        const startTime = performance.now();

        try {
            const result = await this.app.solveMaze(algorithm, this.speed);
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);

            this.solveTime.textContent = `${duration}秒`;

            if (result.found) {
                this.pathLength.textContent = result.path.length;
                this.visitedNodes.textContent = this.app.maze.visitedCells.length;
                this.updateStatus('找到路径！');
            } else {
                this.updateStatus('无法找到路径');
                this.pathLength.textContent = '-';
                this.visitedNodes.textContent = this.app.maze.visitedCells.length;
            }
        } catch (error) {
            console.error('求解失败:', error);
            this.updateStatus('求解失败');
        } finally {
            this.isSolving = false;
            this.setButtonsState(true);
        }
    }

    /**
     * 清除路径
     */
    clearPath() {
        if (this.app.maze) {
            this.app.clearPath();
            this.resetSolverStats();
            this.updateStatus('已清除路径');
        }
    }

    /**
     * 重置
     */
    reset() {
        this.app.reset();
        this.resetAllStats();
        this.showOverlay();
        this.updateStatus('就绪');
    }

    /**
     * 导出迷宫
     */
    exportMaze() {
        if (this.app.maze) {
            this.app.renderer.exportToPNG();
            this.updateStatus('迷宫已导出');
        }
    }

    /**
     * 更改主题
     */
    changeTheme(themeName) {
        document.body.className = `theme-${themeName}`;
        this.app.renderer.setTheme(themeName);
        this.updateStatus(`主题已切换: ${themeName}`);
    }

    /**
     * 设置按钮状态
     */
    setButtonsState(enabled) {
        this.generateBtn.disabled = !enabled;
        this.solveBtn.disabled = !enabled;
        this.clearBtn.disabled = !enabled;
        this.resetBtn.disabled = !enabled;
        this.exportBtn.disabled = !enabled;
        this.generatorSelect.disabled = !enabled;
        this.solverSelect.disabled = !enabled;
        this.rowsInput.disabled = !enabled;
        this.colsInput.disabled = !enabled;
    }

    /**
     * 更新状态文本
     */
    updateStatus(text) {
        this.statusText.textContent = text;
    }

    /**
     * 重置求解器统计
     */
    resetSolverStats() {
        this.pathLength.textContent = '-';
        this.visitedNodes.textContent = '-';
        this.solveTime.textContent = '-';
    }

    /**
     * 重置所有统计
     */
    resetAllStats() {
        this.resetSolverStats();
        this.genTime.textContent = '-';
    }

    /**
     * 显示覆盖层
     */
    showOverlay() {
        this.canvasOverlay.classList.remove('hidden');
    }

    /**
     * 隐藏覆盖层
     */
    hideOverlay() {
        this.canvasOverlay.classList.add('hidden');
    }

    /**
     * 显示提示信息
     */
    showToast(message, duration = 3000) {
        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * 导出JSON
     */
    exportJSON() {
        if (this.app.maze) {
            MazeIO.exportToJSON(this.app.maze);
            this.updateStatus('已导出JSON');
        }
    }

    /**
     * 导出SVG
     */
    exportSVG() {
        if (this.app.maze) {
            MazeIO.exportToSVG(this.app.maze);
            this.updateStatus('已导出SVG');
        }
    }

    /**
     * 显示热力图
     */
    showHeatmap() {
        if (this.app.maze && this.app.maze.visitedCells.length > 0) {
            const heatmap = new HeatmapVisualizer(this.app.renderer);
            heatmap.show(this.app.maze);
            this.updateStatus('热力图已显示');
        } else {
            this.updateStatus('请先求解迷宫');
        }
    }

    /**
     * 启动游戏模式
     */
    startGame() {
        if (this.app.maze) {
            if (this.app.gameMode && this.app.gameMode.active) {
                this.app.gameMode.stop();
                this.gameBtn.textContent = '游戏模式';
                this.gameBtn.classList.remove('btn-danger');
                this.gameBtn.classList.add('btn-success');
                this.updateStatus('游戏模式已停止');
            } else {
                this.app.maze.resetVisited();
                this.app.gameMode = new GameMode(this.app.maze, this.app.renderer);
                this.app.gameMode.start();
                this.gameBtn.textContent = '停止游戏';
                this.gameBtn.classList.remove('btn-success');
                this.gameBtn.classList.add('btn-danger');
                this.updateStatus('游戏模式：使用箭头键或WASD移动');
            }
        } else {
            this.updateStatus('请先生成迷宫');
        }
    }

    /**
     * 获取算法描述
     */
    getAlgorithmDescription(type, algorithm) {
        const descriptions = {
            generator: {
                recursiveBacktracking: '递归回溯法 - 生成复杂的迷宫，路径曲折',
                prim: 'Prim算法 - 随机性强，生成分支较多的迷宫',
                kruskal: 'Kruskal算法 - 基于并查集，生成树形结构',
                recursiveDivision: '递归分割法 - 通过不断分割空间生成迷宫',
                wilson: 'Wilson算法 - 生成完全无偏的迷宫',
                eller: 'Eller算法 - 逐行生成，内存效率高',
                binaryTree: '二叉树算法 - 最简单快速，但有明显偏向',
                sidewinder: 'Sidewinder算法 - 二叉树的改进版'
            },
            solver: {
                bfs: 'BFS - 广度优先搜索，保证找到最短路径',
                dfs: 'DFS - 深度优先搜索，不保证最短路径',
                astar: 'A* - 启发式搜索，通常最高效',
                dijkstra: 'Dijkstra - 单源最短路径算法',
                bidirectionalBFS: '双向BFS - 从起点和终点同时搜索',
                greedy: '贪心最佳优先 - 快速但不保证最优'
            }
        };

        return descriptions[type][algorithm] || '';
    }
}
