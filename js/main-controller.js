/**
 * 主控制器 - 整合所有7、8、9阶段功能
 */

class MazeMainController {
    constructor() {
        this.currentMazeType = 'standard';
        this.maze = null;
        this.renderer = null;
        this.generator = null;
        this.solver = null;
        this.canvas = document.getElementById('mazeCanvas');
        
        // 高级功能实例
        this.pathComparison = null;
        this.distanceMapRenderer = null;
        this.animationEffects = null;
        this.manualEditor = null;
        this.performanceOptimizer = null;
        this.algorithmExplainer = null;
        
        // 游戏模式
        this.currentGameMode = null;
        
        this.initialize();
    }
    
    initialize() {
        this.setupCanvas();
        this.bindEvents();
        this.initializeStandardMaze();
    }
    
    initializeStandardMaze() {
        // 初始化时创建标准迷宫，不调用switchMazeType
        const rows = parseInt(document.getElementById('rowsInput').value);
        const cols = parseInt(document.getElementById('colsInput').value);
        
        this.maze = new Maze(rows, cols);
        this.renderer = new Renderer(this.canvas);
        this.renderer.setMaze(this.maze);
        
        this.updateStatus('就绪');
    }
    
    setupCanvas() {
        this.canvas.width = 800;
        this.canvas.height = 800;
    }
    
    bindEvents() {
        // 尺寸滑块
        const rowsInput = document.getElementById('rowsInput');
        const colsInput = document.getElementById('colsInput');
        const rowsValue = document.getElementById('rowsValue');
        const colsValue = document.getElementById('colsValue');
        
        rowsInput.addEventListener('input', (e) => {
            rowsValue.textContent = e.target.value;
        });
        
        colsInput.addEventListener('input', (e) => {
            colsValue.textContent = e.target.value;
        });
        
        // 速度按钮
        const speedButtons = document.querySelectorAll('.btn-speed');
        speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                speedButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
        
        // 迷宫类型切换
        document.getElementById('mazeTypeSelect').addEventListener('change', (e) => {
            const mazeType = e.target.value;
            this.switchMazeType(mazeType);
            
            // 显示/隐藏层数控制
            const layersControl = document.getElementById('layersControl');
            const ringsControl = document.getElementById('ringsControl');
            
            if (mazeType === 'multilayer') {
                layersControl.style.display = 'block';
                ringsControl.style.display = 'none';
            } else if (mazeType === 'circular') {
                layersControl.style.display = 'none';
                ringsControl.style.display = 'block';
            } else {
                layersControl.style.display = 'none';
                ringsControl.style.display = 'none';
            }
        });
        
        // 层数滑块
        const layersInput = document.getElementById('layersInput');
        const layersValue = document.getElementById('layersValue');
        if (layersInput) {
            layersInput.addEventListener('input', (e) => {
                layersValue.textContent = e.target.value;
            });
        }
        
        // 环数滑块
        const ringsInput = document.getElementById('ringsInput');
        const ringsValue = document.getElementById('ringsValue');
        if (ringsInput) {
            ringsInput.addEventListener('input', (e) => {
                ringsValue.textContent = e.target.value;
            });
        }
        
        // 层切换按钮
        const prevLayerBtn = document.getElementById('prevLayerBtn');
        const nextLayerBtn = document.getElementById('nextLayerBtn');
        if (prevLayerBtn) {
            prevLayerBtn.addEventListener('click', () => {
                if (this.renderer && this.renderer.setLayer) {
                    this.renderer.setLayer(this.renderer.currentLayer - 1);
                }
            });
        }
        if (nextLayerBtn) {
            nextLayerBtn.addEventListener('click', () => {
                if (this.renderer && this.renderer.setLayer) {
                    this.renderer.setLayer(this.renderer.currentLayer + 1);
                }
            });
        }
        
        // 生成按钮
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generate();
        });
        
        // 求解按钮
        document.getElementById('solveBtn').addEventListener('click', () => {
            this.solve();
        });
        
        // 清除和重置
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearPath();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.reset();
        });
        
        // 导出功能
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportPNG();
        });
        
        document.getElementById('exportJSONBtn').addEventListener('click', () => {
            this.exportJSON();
        });
        
        document.getElementById('exportSVGBtn').addEventListener('click', () => {
            this.exportSVG();
        });
        
        // 高级功能
        document.getElementById('compareBtn').addEventListener('click', () => {
            this.compareAlgorithms();
        });
        
        document.getElementById('distanceMapBtn').addEventListener('click', () => {
            this.showDistanceMap();
        });
        
        document.getElementById('editorBtn').addEventListener('click', () => {
            this.toggleEditor();
        });
        
        document.getElementById('fogModeBtn').addEventListener('click', () => {
            this.startFogMode();
        });
        
        document.getElementById('timeTrialBtn').addEventListener('click', () => {
            this.startTimeTrial();
        });
        
        document.getElementById('heatmapBtn').addEventListener('click', () => {
            this.showHeatmap();
        });
        
        // 游戏模式开关
        const gameModeToggle = document.getElementById('gameModeToggle');
        console.log('🎮 绑定游戏模式开关事件:', gameModeToggle);
        if (gameModeToggle) {
            gameModeToggle.addEventListener('change', (e) => {
                console.log('🎮 游戏模式开关状态改变:', e.target.checked);
                this.toggleGameMode(e.target.checked);
            });
        } else {
            console.error('❌ 找不到gameModeToggle元素！');
        }
        
        // 主题切换
        document.getElementById('themeSelect').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });
    }
    
    // 切换迷宫类型
    switchMazeType(type) {
        this.currentMazeType = type;
        
        // 清理现有状态，但不调用reset（避免递归）
        if (this.dynamicInterval) {
            clearInterval(this.dynamicInterval);
            this.dynamicInterval = null;
        }
        
        // 停止无限迷宫渲染循环
        if (this.infiniteRenderLoop) {
            cancelAnimationFrame(this.infiniteRenderLoop);
            this.infiniteRenderLoop = null;
        }
        
        if (this.currentGameMode) {
            this.currentGameMode.stop();
            this.currentGameMode = null;
        }
        
        const rows = parseInt(document.getElementById('rowsInput').value);
        const cols = parseInt(document.getElementById('colsInput').value);
        
        switch(type) {
            case 'standard':
                this.createStandardMaze();
                break;
            case 'multilayer':
                const layers = parseInt(document.getElementById('layersInput')?.value || 3);
                this.createMultiLayerMaze(rows, cols, layers);
                break;
            case 'weighted':
                this.createWeightedMaze(rows, cols);
                break;
            case 'dynamic':
                this.createDynamicMaze(rows, cols);
                break;
            case 'hex':
                this.createHexMaze(rows, cols);
                break;
            case 'circular':
                const rings = parseInt(document.getElementById('ringsInput')?.value || 10);
                this.createCircularMaze(rings, 24);
                break;
            case 'island':
                this.createIslandMaze(rows, cols);
                break;
            case 'portal':
                this.createPortalMaze(rows, cols);
                break;
            case 'quantum':
                this.createQuantumMaze(rows, cols);
                break;
            case 'relativity':
                this.createRelativityMaze(rows, cols);
                break;
            case '4d':
                this.create4DMaze(5, 5, 3, 3);
                break;
            case 'chaos':
                this.createChaosMaze(rows, cols);
                break;
            case 'infinite':
                this.createInfiniteMaze();
                break;
        }
        
        // 更新迷宫说明
        this.updateMazeDescription(type);
        
        // 显示/隐藏楼梯提示
        const stairsHint = document.getElementById('stairsHint');
        const hexControlsHint = document.getElementById('hexControlsHint');
        if (stairsHint) {
            stairsHint.style.display = (type === 'multilayer') ? 'block' : 'none';
        }
        if (hexControlsHint) {
            hexControlsHint.style.display = (type === 'hex') ? 'block' : 'none';
        }
        
        // 隐藏四维迷宫的游戏模式区域
        const gameModeElements = document.querySelectorAll('.control-section h3');
        for (let i = 0; i < gameModeElements.length; i++) {
            if (gameModeElements[i].textContent.includes('游戏模式')) {
                const gameModeSection = gameModeElements[i].closest('.control-section');
                if (gameModeSection) {
                    gameModeSection.style.display = (type === '4d') ? 'none' : 'block';
                }
                break;
            }
        }
        
        // 关闭游戏模式
        if (this.currentGameMode) {
            this.currentGameMode.stop();
            this.currentGameMode = null;
            const toggle = document.getElementById('gameModeToggle');
            const statusLabel = document.getElementById('gameModeStatus');
            if (toggle) toggle.checked = false;
            if (statusLabel) {
                statusLabel.textContent = '关闭';
                statusLabel.style.color = 'var(--text-color)';
            }
        }
        
        // 更新游戏模式按钮状态 - 确保按钮状态与实际模式一致
        const gameModeToggle = document.getElementById('gameModeToggle');
        const gameModeStatus = document.getElementById('gameModeStatus');
        if (gameModeToggle && gameModeStatus) {
            gameModeToggle.checked = false;
            gameModeStatus.textContent = '关闭';
            gameModeStatus.style.color = 'var(--text-color)';
        }
        
        // 如果是量子迷宫，启动动画循环
        if (type === 'quantum') {
            this.startQuantumAnimation();
        } else {
            this.stopQuantumAnimation();
        }
        
        this.updateStatus(`切换到: ${this.getMazeTypeName(type)}`);
    }
    
    getMazeTypeName(type) {
        const names = {
            'standard': '标准迷宫',
            'multilayer': '多层3D迷宫',
            'weighted': '加权迷宫',
            'dynamic': '动态迷宫',
            'hex': '六边形迷宫',
            'circular': '环形迷宫',
            'island': '岛屿迷宫',
            'portal': '传送门迷宫',
            'quantum': '量子迷宫',
            'relativity': '相对论迷宫',
            '4d': '四维迷宫',
            'chaos': '混沌迷宫',
            'infinite': '无限迷宫'
        };
        return names[type] || type;
    }
    
    // 创建各种类型的迷宫
    createStandardMaze() {
        const rows = parseInt(document.getElementById('rowsInput').value);
        const cols = parseInt(document.getElementById('colsInput').value);
        
        this.maze = new Maze(rows, cols);
        this.renderer = new Renderer(this.canvas);
        this.renderer.setMaze(this.maze);
    }
    
    createMultiLayerMaze(rows, cols, layers) {
        this.maze = new MazeComplex.MultiLayerMaze(rows, cols, layers);
        this.renderer = new MazeComplexRenderers.MultiLayerRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createWeightedMaze(rows, cols) {
        this.maze = new MazeComplex.WeightedMaze(rows, cols);
        this.renderer = new MazeComplexRenderers.WeightedRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createDynamicMaze(rows, cols) {
        this.maze = new MazeComplex.DynamicMaze(rows, cols);
        this.renderer = new Renderer(this.canvas);
        this.renderer.setMaze(this.maze);
        this.startDynamicUpdate();
    }
    
    createHexMaze(rows, cols) {
        this.maze = new MazeComplex.HexMaze(rows, cols);
        this.renderer = new MazeComplexRenderers.HexRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createCircularMaze(rings, sectors) {
        this.maze = new MazeComplex.CircularMaze(rings, sectors);
        this.renderer = new MazeComplexRenderers.CircularRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createIslandMaze(rows, cols) {
        this.maze = new MazeComplex.IslandMaze(rows, cols, 8);
        this.renderer = new MazeComplexRenderers.IslandRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createPortalMaze(rows, cols) {
        this.maze = new MazeComplex.PortalMaze(rows, cols, 10);
        this.renderer = new MazeComplexRenderers.PortalRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createQuantumMaze(rows, cols) {
        this.maze = new MazeAdvanced.QuantumMaze(rows, cols);
        this.renderer = new MazeComplexRenderers.QuantumRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createRelativityMaze(rows, cols) {
        this.maze = new MazeAdvanced.RelativityMaze(rows, cols);
        this.renderer = new MazeComplexRenderers.RelativityRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    create4DMaze(rows, cols, depth, time) {
        this.maze = new MazeAdvanced.Maze4D(rows, cols, depth, time);
        this.renderer = new MazeComplexRenderers.Maze4DRenderer(this.canvas, this.maze);
        this.renderer.draw();
    }
    
    createChaosMaze(rows, cols) {
        this.maze = new MazeAdvanced.ChaosMaze(rows, cols);
        this.renderer = new MazeComplexRenderers.ChaosRenderer(this.canvas, this.maze);
        this.renderer.draw();
        // 启动混沌迷宫的动态更新
        this.startDynamicUpdate();
    }
    
    createInfiniteMaze() {
        this.maze = new MazeAdvanced.InfiniteMaze(20);
        this.maze.loadChunksAround(0, 0);
        
        // 使用专门的无限迷宫渲染器
        this.renderer = new MazeComplexRenderers.InfiniteRenderer(this.canvas, this.maze);
        
        // 为renderer.maze设置一个当前区块的引用（供solver等组件使用）
        const centerChunk = this.maze.generateChunk(0, 0);
        this.renderer.maze = centerChunk;
        
        // 启动无限迷宫的渲染循环
        this.startInfiniteRendering();
        
        // 探索初始区域（3x3格子）
        this.maze.exploreAround(0, 0, 1);
        
        this.renderer.draw();
    }
    
    // 启动无限迷宫的渲染循环
    startInfiniteRendering() {
        if (this.infiniteRenderLoop) {
            cancelAnimationFrame(this.infiniteRenderLoop);
        }
        
        const animate = () => {
            if (this.currentMazeType === 'infinite' && this.renderer && this.renderer.draw) {
                this.renderer.draw();
            }
            this.infiniteRenderLoop = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    // 动态迷宫更新循环
    startDynamicUpdate() {
        if (this.dynamicInterval) {
            clearInterval(this.dynamicInterval);
        }
        
        this.dynamicInterval = setInterval(() => {
            if (this.maze && this.maze.update) {
                this.maze.update(0.1);
                this.renderer.draw();
            }
        }, 100);
    }
    
    // 生成迷宫
    async generate() {
        // 隐藏overlay
        const overlay = document.getElementById('canvasOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
        
        // 读取当前尼寸
        const rows = parseInt(document.getElementById('rowsInput').value);
        const cols = parseInt(document.getElementById('colsInput').value);
        
        // 检查是否需要重新创建迷宫（尺寸改变）
        if (!this.maze || this.maze.rows !== rows || this.maze.cols !== cols) {
            // 根据当前迷宫类型重新创建
            this.switchMazeType(this.currentMazeType);
        }
        
        if (!this.maze) {
            console.error('❌ maze 不存在');
            return;
        }
        
        const algorithm = document.getElementById('generatorSelect').value;
        const speed = this.getSpeed();
        
        this.updateStatus('正在生成...');
        const startTime = performance.now();
        
        // 根据迷宫类型选择生成器
        // 无限迷宫需特殊处理：对每个已加载区块分别生成
        if (this.currentMazeType === 'infinite') {
            try {
                await this.generateInfiniteMazeCustom(speed, algorithm);
            } catch (error) {
                console.error('❌ 生成错误:', error);
                this.updateStatus('生成失败: ' + error.message);
                return;
            }
        } else {
            this.generator = this.createGenerator(algorithm);
            
            if (!this.generator) {
                console.error('❌ 无法创建生成器');
                this.updateStatus('该迷宫类型暂不支持此生成算法');
                return;
            }
            
            this.generator.renderer = this.renderer;
            
            try {
                // 如果是四维迷宫
                if (this.maze.grid4D) {
                    await this.generate4DMaze(speed);
                }
                // 如果是多层迷宫，为每一层生成
                else if (this.maze.layers && this.maze.grid3D) {
                    // 为所有层设置初始墙壁
                    this.maze.setAllWalls();
                    
                    for (let layer = 0; layer < this.maze.layers; layer++) {
                        this.maze.currentLayer = layer;
                        this.maze.grid = this.maze.grid3D[layer];
                        this.maze.start = this.maze.grid3D[layer][0][0];
                        this.maze.end = this.maze.grid3D[layer][this.maze.rows - 1][this.maze.cols - 1];
                        
                        this.updateStatus(`正在生成第${layer + 1}层...`);
                        await this.generator.generate(speed);
                        
                        // 重置当前层的visited标记
                        for (let row = 0; row < this.maze.rows; row++) {
                            for (let col = 0; col < this.maze.cols; col++) {
                                this.maze.grid3D[layer][row][col].visited = false;
                            }
                        }
                    }
                    // 恢复原始起点和终点
                    this.maze.start = this.maze.grid3D[0][0][0];
                    this.maze.end = this.maze.grid3D[this.maze.layers - 1][this.maze.rows - 1][this.maze.cols - 1];
                    this.maze.grid = this.maze.grid3D[0]; // 默认显示第一层
                } else if (this.maze.rings !== undefined) {
                    // 环形迷宫使用简化的生成
                    await this.generateCircularMazeCustom(speed);
                } else {
                    await this.generator.generate(speed);
                }
            } catch (error) {
                console.error('❌ 生成错误:', error);
                this.updateStatus('生成失败: ' + error.message);
                return;
            }
        }
        
        const endTime = performance.now();
        const time = ((endTime - startTime) / 1000).toFixed(2);
        
        document.getElementById('genTime').textContent = `${time}s`;
        this.updateStatus('生成完成');
        
        // 确保渲染器正确绘制
        if (this.renderer && typeof this.renderer.draw === 'function') {
            this.renderer.draw();
            console.log('✅ 迷宫已绘制');
        } else {
            console.error('❌ 渲染器不存在或无draw方法');
        }
    }
    
    // 四维迷宫特殊生成
    async generate4DMaze(speed) {
        this.updateStatus('正在生成四维迷宫...');
        
        // 使用递归回溯算法
        this.maze.setAllWalls();
        const stack = [this.maze.start];
        this.maze.start.visited = true;
        
        let stepCount = 0;
        const totalCells = this.maze.rows * this.maze.cols * this.maze.depth * this.maze.time;
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const unvisited = this.maze.getUnvisitedNeighbors(current);
            
            if (unvisited.length > 0) {
                const next = unvisited[Math.floor(Math.random() * unvisited.length)];
                this.maze.removeWall(current, next);
                next.visited = true;
                stack.push(next);
                stepCount++;
                
                // 每100步更新一次显示
                if (speed > 0 && stepCount % 100 === 0 && this.renderer) {
                    this.updateStatus(`正在生成... ${Math.floor(stepCount / totalCells * 100)}%`);
                    this.renderer.draw();
                    await this.sleep(1000 / speed);
                }
            } else {
                stack.pop();
            }
        }
        
        // 重置visited
        this.maze.resetVisited();
    }
    
    // 无限迷宫特殊生成（对已加载区块逐一生成）
    async generateInfiniteMazeCustom(speed, algorithm) {
        // 确保中心区域已加载
        this.maze.loadChunksAround(0, 0);
        
        // 选择生成算法类
        const GeneratorMap = {
            'recursiveBacktracking': RecursiveBacktrackingGenerator,
            'prim': PrimGenerator,
            'kruskal': KruskalGenerator,
            'recursiveDivision': RecursiveDivisionGenerator,
            'wilson': WilsonGenerator,
            'eller': EllerGenerator,
            'binaryTree': BinaryTreeGenerator,
            'sidewinder': SidewinderGenerator
        };
        const GeneratorClass = GeneratorMap[algorithm] || RecursiveBacktrackingGenerator;
        
        // 渲染器当前绑定的区块
        const firstChunk = this.renderer && this.renderer.maze ? this.renderer.maze : null;
        
        // 逐区块生成（仅对可见区块，提高性能）
        const chunks = Array.from(this.maze.chunks.values());
        for (const chunk of chunks) {
            const gen = new GeneratorClass(chunk);
            // 只有当前显示的区块才绘制动画，其余设为瞬间
            const chunkSpeed = (firstChunk === chunk) ? speed : 0;
            gen.renderer = (firstChunk === chunk) ? this.renderer : null;
            await gen.generate(chunkSpeed);
        }
        
        // 确保所有相邻区块正确连接
        this.maze.ensureAllConnections();
    }
    
    // 环形迷宫特殊生成
    async generateCircularMazeCustom(speed) {
        this.maze.setAllWalls();
        const stack = [this.maze.start];
        this.maze.start.visited = true;
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const unvisited = this.maze.getUnvisitedNeighbors(current);
            
            if (unvisited.length > 0) {
                const next = unvisited[Math.floor(Math.random() * unvisited.length)];
                this.maze.removeWall(current, next);
                next.visited = true;
                stack.push(next);
                
                if (speed > 0 && this.renderer) {
                    this.renderer.draw();
                    await this.sleep(1000 / speed);
                }
            } else {
                stack.pop();
            }
        }
        
        // 重置visited
        this.maze.resetVisited();
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    createGenerator(algorithm) {
        const GeneratorMap = {
            'recursiveBacktracking': RecursiveBacktrackingGenerator,
            'prim': PrimGenerator,
            'kruskal': KruskalGenerator,
            'recursiveDivision': RecursiveDivisionGenerator,
            'wilson': WilsonGenerator,
            'eller': EllerGenerator,
            'binaryTree': BinaryTreeGenerator,
            'sidewinder': SidewinderGenerator
        };
        
        const GeneratorClass = GeneratorMap[algorithm];
        if (!GeneratorClass) return null;
        
        return new GeneratorClass(this.maze);
    }
    
    // 求解迷宫
    async solve() {
        const activeMaze = this.getActiveMaze();
        if (!activeMaze) return;
        
        const algorithm = document.getElementById('solverSelect').value;
        const speed = this.getSpeed();
        
        // 暂停动态更新，避免求解时墙体变化导致不可解
        const hadDynamic = !!this.dynamicInterval;
        if (hadDynamic) {
            clearInterval(this.dynamicInterval);
            this.dynamicInterval = null;
        }
        
        this.maze.resetVisited();
        this.updateStatus('正在求解...');
        const startTime = performance.now();
        
        this.solver = this.createSolver(algorithm, activeMaze);
        if (!this.solver) {
            this.updateStatus('该迷宫类型暂不支持此求解算法');
            return;
        }
        
        this.solver.renderer = this.renderer;
        const result = await this.solver.solve(speed);
        
        const endTime = performance.now();
        const time = ((endTime - startTime) / 1000).toFixed(2);
        
        if (result.found) {
            document.getElementById('pathLength').textContent = result.path.length;
            document.getElementById('visitedNodes').textContent = activeMaze.visitedCells.length;
            document.getElementById('solveTime').textContent = `${time}s`;
            this.updateStatus('找到路径！');
        } else {
            this.updateStatus('未找到路径');
        }
        
        this.renderer.draw();
        
        // 恢复动态更新
        if (hadDynamic) {
            this.startDynamicUpdate();
        }
    }
    
    // 获取当前可操作的迷宫（无限迷宫时返回当前渲染区块）
    getActiveMaze() {
        if (this.currentMazeType === 'infinite' && this.renderer && this.renderer.maze) {
            return this.renderer.maze; // 当前显示的区块（Maze）
        }
        return this.maze;
    }
    
    createSolver(algorithm, mazeOverride = null) {
        const SolverMap = {
            'bfs': BFSSolver,
            'dfs': DFSSolver,
            'astar': AStarSolver,
            'dijkstra': DijkstraSolver,
            'bidirectionalBFS': BidirectionalBFSSolver,
            'greedy': GreedyBestFirstSolver,
            'jps': JPSSolver
        };
        
        const SolverClass = SolverMap[algorithm];
        if (!SolverClass) return null;
        
        const maze = mazeOverride || this.getActiveMaze();
        return new SolverClass(maze);
    }
    
    // 高级功能
    async compareAlgorithms() {
        const activeMaze = this.getActiveMaze();
        if (!activeMaze) return;
        
        this.updateStatus('正在对比算法...');
        
        const algorithms = ['bfs', 'dfs', 'astar', 'dijkstra'];
        this.pathComparison = new MazeAdvancedExtensions.PathComparison(this.renderer);
        
        const results = await this.pathComparison.compareAlgorithms(activeMaze, algorithms, 0);
        
        console.table(results);
        this.updateStatus('算法对比完成');
    }
    
    showDistanceMap() {
        const activeMaze = this.getActiveMaze();
        if (!activeMaze) return;
        
        this.distanceMapRenderer = new MazeAdvancedExtensions.DistanceMapRenderer(this.renderer);
        this.distanceMapRenderer.show(activeMaze);
        this.updateStatus('显示距离图');
    }
    
    toggleEditor() {
        if (!this.manualEditor) {
            this.manualEditor = new MazeAdvancedExtensions.ManualEditor(this.getActiveMaze(), this.renderer);
            this.manualEditor.enable();
            this.updateStatus('编辑模式已启用');
        } else {
            this.manualEditor.disable();
            this.manualEditor = null;
            this.updateStatus('编辑模式已禁用');
        }
    }
    
    startFogMode() {
        if (this.currentGameMode) {
            this.currentGameMode.stop();
        }
        
        this.currentGameMode = new MazeAdvancedExtensions.FogOfWarMode(this.getActiveMaze(), this.renderer);
        this.currentGameMode.start();
        this.updateStatus('迷雾模式已启动');
    }
    
    startTimeTrial() {
        if (this.currentGameMode) {
            this.currentGameMode.stop();
        }
        
        this.currentGameMode = new MazeAdvancedExtensions.TimeTrialMode(this.getActiveMaze(), this.renderer, 60);
        this.currentGameMode.start();
        this.updateStatus('限时挑战已启动');
    }
    
    toggleGameMode(enabled) {
        console.log('🎮 toggleGameMode called, enabled:', enabled);
        const statusLabel = document.getElementById('gameModeStatus');
        
        if (enabled) {
            console.log('🟢 尝试启动游戏模式...');
            // 启动游戏模式
            if (this.currentGameMode) {
                console.log('⚠️ 停止现有游戏模式');
                this.currentGameMode.stop();
            }
            
            console.log('🔍 检查maze和renderer:', { maze: !!this.maze, renderer: !!this.renderer });
            
            if (!this.maze || !this.renderer) {
                console.error('❌ 迷宫或渲染器不存在！');
                alert('请先生成迷宫！');
                document.getElementById('gameModeToggle').checked = false;
                statusLabel.textContent = '关闭';
                return;
            }
            
            console.log('🔍 检查GameMode类:', { exists: !!window.GameMode });
            
            if (window.GameMode) {
                console.log('✅ GameMode类存在，创建实例...');
                const gmMaze = this.getActiveMaze();
                console.log('📋 Maze info:', { 
                    type: gmMaze?.constructor?.name,
                    start: gmMaze?.start,
                    grid: !!gmMaze?.grid
                });
                console.log('📋 Renderer info:', { 
                    type: this.renderer.constructor.name,
                    canvas: !!this.renderer.canvas,
                    ctx: !!this.renderer.ctx,
                    cellSize: this.renderer.cellSize
                });
                
                try {
                    // 停止量子动画循环，避免覆盖玩家渲染
                    this.stopQuantumAnimation();
                    
                    this.currentGameMode = new GameMode(this.getActiveMaze(), this.renderer);
                    console.log('✅ GameMode实例创建成功:', this.currentGameMode);
                    this.currentGameMode.start();
                    console.log('✅ GameMode.start()调用完成');
                } catch (error) {
                    console.error('❌ 创建或启动GameMode失败:', error);
                    alert('游戏模式启动失败：' + error.message);
                    document.getElementById('gameModeToggle').checked = false;
                    statusLabel.textContent = '关闭';
                    return;
                }
                
                statusLabel.textContent = '开启';
                statusLabel.style.color = 'var(--success-color)';
                this.updateStatus('游戏模式已启动 - 使用方向键移动');
                
                // 如果是六边形迷宫，更新提示信息
                if (this.maze instanceof MazeComplex.HexMaze) {
                    this.updateStatus('游戏模式已启动 - 使用WASD/QE键移动');
                }
            } else {
                console.error('❌ GameMode类不存在！');
                alert('GameMode类未加载！');
                document.getElementById('gameModeToggle').checked = false;
                statusLabel.textContent = '关闭';
            }
        } else {
            // 关闭游戏模式
            if (this.currentGameMode) {
                this.currentGameMode.stop();
                this.currentGameMode = null;
            }
            statusLabel.textContent = '关闭';
            statusLabel.style.color = 'var(--text-color)';
            this.updateStatus('游戏模式已关闭');
            
            // 重新启动量子动画（如果是量子迷宫）
            if (this.currentMazeType === 'quantum') {
                this.startQuantumAnimation();
            }
            
            // 重新绘制迷宫
            if (this.renderer) {
                this.renderer.draw();
            }
        }
    }
    
    showHeatmap() {
        if (window.MazeExtensions && window.MazeExtensions.showHeatmap) {
            window.MazeExtensions.showHeatmap(this.getActiveMaze(), this.renderer);
            this.updateStatus('显示热力图');
        }
    }
    
    // 辅助方法
    clearPath() {
        const activeMaze = this.getActiveMaze();
        if (activeMaze) {
            activeMaze.resetVisited();
            this.renderer.draw();
            this.updateStatus('路径已清除');
        }
    }
    
    reset() {
        // 显示overlay
        const overlay = document.getElementById('canvasOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }
        
        if (this.dynamicInterval) {
            clearInterval(this.dynamicInterval);
            this.dynamicInterval = null;
        }
        
        if (this.currentGameMode) {
            this.currentGameMode.stop();
            this.currentGameMode = null;
        }
        
        // 重新创建当前类型的迷宫，不调用switchMazeType避免递归
        const rows = parseInt(document.getElementById('rowsInput').value);
        const cols = parseInt(document.getElementById('colsInput').value);
        
        switch(this.currentMazeType) {
            case 'standard':
                this.createStandardMaze();
                break;
            case 'multilayer':
                const layers2 = parseInt(document.getElementById('layersInput')?.value || 3);
                this.createMultiLayerMaze(rows, cols, layers2);
                break;
            case 'weighted':
                this.createWeightedMaze(rows, cols);
                break;
            case 'dynamic':
                this.createDynamicMaze(rows, cols);
                break;
            case 'hex':
                this.createHexMaze(rows, cols);
                break;
            case 'circular':
                const rings3 = parseInt(document.getElementById('ringsInput')?.value || 10);
                this.createCircularMaze(rings3, 24);
                break;
            case 'island':
                this.createIslandMaze(rows, cols);
                break;
            case 'portal':
                this.createPortalMaze(rows, cols);
                break;
            case 'quantum':
                this.createQuantumMaze(rows, cols);
                break;
            case 'relativity':
                this.createRelativityMaze(rows, cols);
                break;
            case '4d':
                this.create4DMaze(5, 5, 3, 3);
                break;
            case 'chaos':
                this.createChaosMaze(rows, cols);
                break;
            case 'infinite':
                this.createInfiniteMaze();
                break;
        }
        
        this.updateStatus('已重置');
    }
    
    getSpeed() {
        const speedBtns = document.querySelectorAll('.btn-speed');
        let speed = 10;
        
        speedBtns.forEach(btn => {
            if (btn.classList.contains('active')) {
                speed = parseInt(btn.dataset.speed);
            }
        });
        
        return speed;
    }
    
    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }
    
    changeTheme(theme) {
        if (this.renderer && this.renderer.setTheme) {
            this.renderer.setTheme(theme);
            this.renderer.draw();
        }
    }
    
    exportPNG() {
        const link = document.createElement('a');
        link.download = 'maze.png';
        link.href = this.canvas.toDataURL();
        link.click();
        this.updateStatus('PNG已导出');
    }
    
    exportJSON() {
        if (window.MazeExtensions && window.MazeExtensions.exportToJSON) {
            const json = window.MazeExtensions.exportToJSON(this.maze);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.download = 'maze.json';
            link.href = url;
            link.click();
            
            this.updateStatus('JSON已导出');
        }
    }
    
    exportSVG() {
        if (window.MazeExtensions && window.MazeExtensions.exportToSVG) {
            const svg = window.MazeExtensions.exportToSVG(this.maze);
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.download = 'maze.svg';
            link.href = url;
            link.click();
            
            this.updateStatus('SVG已导出');
        }
    }
    
    // 更新迷宫说明
    updateMazeDescription(type) {
        const descElement = document.getElementById('mazeDescription');
        const titleElement = document.getElementById('mazeDescTitle');
        const textElement = document.getElementById('mazeDescText');
        
        if (!descElement || !titleElement || !textElement) return;
        
        const descriptions = {
            'standard': {
                title: '标准迷宫',
                text: '经典的二维迷宫，使用各种经典算法生成和求解。适合学习和体验不同的算法。'
            },
            'multilayer': {
                title: '多层3D迷宫',
                text: '具有多个层级的三维迷宫，通过楼梯在层之间移动。需要考虑立体空间的路径规划。'
            },
            'weighted': {
                title: '加权迷宫',
                text: '每个格子有不同的地形成本（草地、水域、山脉等）。求解时需要找到成本最低的路径。'
            },
            'dynamic': {
                title: '动态迷宫',
                text: '墙壁会周期性地消失和出现，需要在不断变化的环境中找到路径。挑战你的应变能力！'
            },
            'hex': {
                title: '六边形迷宫',
                text: '使用六边形网格的迷宫，每个格子有6个邻居。提供与传统四边形迷宫不同的空间体验。'
            },
            'circular': {
                title: '环形迷宫',
                text: '使用极坐标系的环形迷宫，从中心向外扩展。在不同半径的环上探索路径。'
            },
            'island': {
                title: '岛屿迷宫',
                text: '由多个岛屿组成，通过桥梁连接。需要在岛屿之间寻找路径，挑战空间规划能力。'
            },
            'portal': {
                title: '传送门迷宫',
                text: '包含传送门的迷宫，可以瞬间移动到另一个位置。利用传送门可以找到更短的路径！'
            },
            'quantum': {
                title: '量子迷宫 ⚛️',
                text: '量子力学的迷宫世界！蓝色格子处于叠加态，观测后会塌缩并改变迷宫结构（墙壁消失或出现）。紫色连线表示纠缠，观测一个会同步改变另一个。小概率(12%)的隧穿可穿过墙壁。利用量子特性打开新路径！',
                class: 'quantum'
            },
            'relativity': {
                title: '相对论迷宫',
                text: '受广义相对论影响的迷宫，黑洞会扭曲时空，增加移动成本。体验引力对路径的影响。'
            },
            '4d': {
                title: '四维迷宫',
                text: '四维空间的迷宫，包括三维空间和一维时间。通过可视化4个二维切片来理解四维结构。在每个切片中移动，体验高维思维的挑战。这是一个思想实验，邀请您思考高维空间的奥秘，探索超越日常三维体验的思维边界。'
            },
            'chaos': {
                title: '混沌迷宫',
                text: '基于洛伦兹吸引子的混沌系统迷宫。小的扰动会导致巨大的变化（蝴蝶效应）。'
            },
            'infinite': {
                title: '∞ 无限迷宫',
                text: '程序化生成的无限世界！特性：多种生物群系（森林、沙漠、岩浆、水晶、虚空等）｜ 渐进难度（距起点越远越难）｜ 传送门快速移动 ｜ 钥匙收集系统 ｜ 旋转墙动态变化 ｜ 耐力管理 ｜ 迷雾探索。使用 WASD 或方向键移动！',
                class: 'infinite'
            }
        };
        
        const desc = descriptions[type] || descriptions['standard'];
        
        titleElement.textContent = desc.title;
        textElement.textContent = desc.text;
        
        // 更新样式类
        descElement.className = 'maze-description';
        if (desc.class) {
            descElement.classList.add(desc.class);
        }
    }
    
    // 启动量子迷宫动画
    startQuantumAnimation() {
        this.stopQuantumAnimation(); // 先停止已存在的动画
        
        if (this.renderer && this.renderer instanceof MazeComplexRenderers.QuantumRenderer) {
            this.quantumAnimationFrame = () => {
                this.renderer.draw();
                this.quantumAnimationId = requestAnimationFrame(this.quantumAnimationFrame);
            };
            this.quantumAnimationId = requestAnimationFrame(this.quantumAnimationFrame);
        }
    }
    
    // 停止量子迷宫动画
    stopQuantumAnimation() {
        if (this.quantumAnimationId) {
            cancelAnimationFrame(this.quantumAnimationId);
            this.quantumAnimationId = null;
        }
    }
}

// 初始化主控制器
let mainController;

// 确保所有脚本都加载后再初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initController);
} else {
    // DOMContentLoaded 已经触发
    initController();
}

function initController() {
    try {
        mainController = new MazeMainController();
        console.log('🎮 主控制器已初始化');
    } catch (error) {
        console.error('初始化失败:', error);
        alert('初始化失败，请刷新页面。错误: ' + error.message);
    }
}
