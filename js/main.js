/**
 * 主应用类 - 整合所有模块
 */
class MazeApp {
    constructor() {
        this.maze = null;
        this.renderer = null;
        this.controls = null;
        this.currentGenerator = null;
        this.currentSolver = null;

        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 获取Canvas元素
        const canvas = document.getElementById('mazeCanvas');
        if (!canvas) {
            console.error('找不到Canvas元素');
            return;
        }

        // 初始化渲染器
        this.renderer = new Renderer(canvas);

        // 初始化控制器
        this.controls = new Controls(this);

        console.log('🎯 迷宫生成与求解器已就绪');
        this.logInstructions();
    }

    /**
     * 生成迷宫
     */
    async generateMaze(rows, cols, algorithm, speed) {
        console.log(`生成迷宫: ${rows}x${cols}, 算法: ${algorithm}`);

        // 创建新迷宫
        this.maze = new Maze(rows, cols);
        this.renderer.setMaze(this.maze);

        // 创建生成器
        try {
            this.currentGenerator = GeneratorFactory.create(algorithm, this.maze);
            this.currentGenerator.renderer = this.renderer; // 传递渲染器引用
        } catch (error) {
            console.error('创建生成器失败:', error);
            throw error;
        }

        // 生成迷宫
        try {
            await this.currentGenerator.generate(speed);
            this.renderer.draw();
            console.log('✅ 迷宫生成完成');
        } catch (error) {
            console.error('生成迷宫失败:', error);
            throw error;
        }
    }

    /**
     * 求解迷宫
     */
    async solveMaze(algorithm, speed) {
        if (!this.maze) {
            throw new Error('请先生成迷宫');
        }

        console.log(`求解迷宫: ${algorithm}`);

        // 清除之前的路径
        this.maze.resetVisited();
        this.renderer.draw();

        // 创建求解器
        try {
            this.currentSolver = SolverFactory.create(algorithm, this.maze);
            this.currentSolver.renderer = this.renderer; // 传递渲染器引用
        } catch (error) {
            console.error('创建求解器失败:', error);
            throw error;
        }

        // 求解迷宫
        try {
            const result = await this.currentSolver.solve(speed);

            if (result.found) {
                console.log(`✅ 找到路径! 长度: ${result.path.length}`);
                console.log(`📊 访问节点: ${this.maze.visitedCells.length}`);
                
                // 绘制最终结果
                this.renderer.draw();
                
                // 动画显示路径（如果速度不是瞬间）
                if (speed > 0) {
                    await this.renderer.animatePath(result.path, speed * 2);
                }
            } else {
                console.log('❌ 未找到路径');
            }

            return result;
        } catch (error) {
            console.error('求解迷宫失败:', error);
            throw error;
        }
    }

    /**
     * 清除路径
     */
    clearPath() {
        if (this.maze) {
            this.maze.resetVisited();
            this.renderer.clearVisited();
            console.log('🧹 已清除路径');
        }
    }

    /**
     * 重置应用
     */
    reset() {
        this.maze = null;
        this.currentGenerator = null;
        this.currentSolver = null;
        
        // 清空Canvas
        const canvas = this.renderer.canvas;
        this.renderer.ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        console.log('🔄 应用已重置');
    }

    /**
     * 获取迷宫统计信息
     */
    getStats() {
        if (!this.maze) return null;
        return this.maze.getStats();
    }

    /**
     * 对比多个算法（用于分析）
     */
    async compareAlgorithms(algorithms, trials = 5) {
        console.log(`🔬 开始算法对比测试 (${trials}次试验)`);
        
        const results = {};

        for (const algorithm of algorithms) {
            const times = [];
            const pathLengths = [];
            const visitedCounts = [];

            for (let i = 0; i < trials; i++) {
                // 生成相同的迷宫
                await this.generateMaze(20, 20, 'recursiveBacktracking', 0);

                // 测试求解算法
                const startTime = performance.now();
                const result = await this.solveMaze(algorithm, 0);
                const endTime = performance.now();

                times.push(endTime - startTime);
                pathLengths.push(result.path.length);
                visitedCounts.push(this.maze.visitedCells.length);
            }

            // 计算平均值
            const avgTime = times.reduce((a, b) => a + b, 0) / trials;
            const avgPath = pathLengths.reduce((a, b) => a + b, 0) / trials;
            const avgVisited = visitedCounts.reduce((a, b) => a + b, 0) / trials;

            results[algorithm] = {
                avgTime: avgTime.toFixed(2),
                avgPathLength: avgPath.toFixed(2),
                avgVisitedNodes: avgVisited.toFixed(2)
            };
        }

        console.table(results);
        return results;
    }

    /**
     * 输出使用说明
     */
    logInstructions() {
        console.log(`
%c
╔══════════════════════════════════════════════════════════╗
║           🎯 迷宫生成与求解器 v1.0                       ║
╚══════════════════════════════════════════════════════════╝

📚 功能说明:
  • 支持8种生成算法
  • 支持6种求解算法  
  • 实时可视化动画
  • 多主题支持
  • 导出PNG图片

🎮 快速开始:
  1. 调整迷宫尺寸
  2. 选择生成算法
  3. 点击"生成迷宫"
  4. 选择求解算法
  5. 点击"求解迷宫"

⚡ 控制台命令:
  app.generateMaze(30, 30, 'recursiveBacktracking', 10)
  app.solveMaze('astar', 10)
  app.compareAlgorithms(['bfs', 'dfs', 'astar'])
  app.getStats()

💡 提示:
  • 速度设为"瞬间"可快速生成/求解大迷宫
  • BFS保证找到最短路径
  • A*通常是最高效的求解算法
  • 尝试不同的生成算法会产生不同风格的迷宫

`, 'color: #4a90e2; font-family: monospace;');
    }
}

// 当页面加载完成后初始化应用
let app = null;

document.addEventListener('DOMContentLoaded', () => {
    app = new MazeApp();
    
    // 将app暴露到全局作用域，方便控制台调试
    window.app = app;
});
