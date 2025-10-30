/**
 * 迷宫求解器基类
 */
class MazeSolver {
    constructor(maze) {
        this.maze = maze;
        this.steps = [];
    }

    async solve(speed = 10) {
        throw new Error('子类必须实现 solve 方法');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 曼哈顿距离启发函数
    heuristic(cell1, cell2) {
        return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col);
    }
}

/**
 * 广度优先搜索 (BFS) - 保证最短路径
 */
class BFSSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        const queue = [this.maze.start];
        this.maze.start.visited = true;
        this.maze.start.distance = 0;

        while (queue.length > 0) {
            const current = queue.shift();
            this.maze.visitedCells.push(current);

            if (speed > 0) {
                this.steps.push({ type: 'visit', cell: current });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            if (current === this.maze.end) {
                this.maze.reconstructPath();
                return { found: true, path: this.maze.path };
            }

            const neighbors = this.maze.getNeighbors(current, true);
            for (const neighbor of neighbors) {
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.parent = current;
                    neighbor.distance = current.distance + 1;
                    queue.push(neighbor);
                }
            }
        }

        return { found: false, path: [] };
    }
}

/**
 * 深度优先搜索 (DFS)
 */
class DFSSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        const stack = [this.maze.start];
        this.maze.start.visited = true;

        while (stack.length > 0) {
            const current = stack.pop();
            this.maze.visitedCells.push(current);

            if (speed > 0) {
                this.steps.push({ type: 'visit', cell: current });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            if (current === this.maze.end) {
                this.maze.reconstructPath();
                return { found: true, path: this.maze.path };
            }

            const neighbors = this.maze.getNeighbors(current, true);
            for (const neighbor of neighbors) {
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.parent = current;
                    stack.push(neighbor);
                }
            }
        }

        return { found: false, path: [] };
    }
}

/**
 * A* 算法 - 启发式搜索
 */
class AStarSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        const openSet = new PriorityQueue();
        const gScore = new Map();
        const fScore = new Map();

        this.maze.start.visited = true;
        gScore.set(this.maze.start, 0);
        fScore.set(this.maze.start, this.heuristic(this.maze.start, this.maze.end));
        openSet.enqueue(this.maze.start, fScore.get(this.maze.start));

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();
            this.maze.visitedCells.push(current);

            if (speed > 0) {
                this.steps.push({ type: 'visit', cell: current });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            if (current === this.maze.end) {
                this.maze.reconstructPath();
                return { found: true, path: this.maze.path };
            }

            const neighbors = this.maze.getNeighbors(current, true);
            for (const neighbor of neighbors) {
                const tentativeGScore = gScore.get(current) + 1;

                if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                    neighbor.parent = current;
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, this.maze.end));

                    if (!neighbor.visited) {
                        neighbor.visited = true;
                        openSet.enqueue(neighbor, fScore.get(neighbor));
                    }
                }
            }
        }

        return { found: false, path: [] };
    }
}

/**
 * Dijkstra 算法
 */
class DijkstraSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        const pq = new PriorityQueue();
        
        this.maze.start.distance = 0;
        pq.enqueue(this.maze.start, 0);

        while (!pq.isEmpty()) {
            const current = pq.dequeue();

            if (current.visited) continue;
            current.visited = true;
            this.maze.visitedCells.push(current);

            if (speed > 0) {
                this.steps.push({ type: 'visit', cell: current });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            if (current === this.maze.end) {
                this.maze.reconstructPath();
                return { found: true, path: this.maze.path };
            }

            const neighbors = this.maze.getNeighbors(current, true);
            for (const neighbor of neighbors) {
                const newDistance = current.distance + 1;
                
                if (newDistance < neighbor.distance) {
                    neighbor.distance = newDistance;
                    neighbor.parent = current;
                    pq.enqueue(neighbor, newDistance);
                }
            }
        }

        return { found: false, path: [] };
    }
}

/**
 * 双向BFS - 从起点和终点同时搜索
 */
class BidirectionalBFSSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        
        const frontQueue = [this.maze.start];
        const backQueue = [this.maze.end];
        
        const frontVisited = new Map();
        const backVisited = new Map();
        
        frontVisited.set(this.maze.start, null);
        backVisited.set(this.maze.end, null);

        while (frontQueue.length > 0 && backQueue.length > 0) {
            // 前向搜索
            const frontResult = await this.bfsStep(frontQueue, frontVisited, backVisited, speed, 'front');
            if (frontResult.found) {
                this.reconstructBidirectionalPath(frontResult.meeting, frontVisited, backVisited);
                return { found: true, path: this.maze.path };
            }

            // 后向搜索
            const backResult = await this.bfsStep(backQueue, backVisited, frontVisited, speed, 'back');
            if (backResult.found) {
                this.reconstructBidirectionalPath(backResult.meeting, frontVisited, backVisited);
                return { found: true, path: this.maze.path };
            }
        }

        return { found: false, path: [] };
    }

    async bfsStep(queue, visited, otherVisited, speed, direction) {
        if (queue.length === 0) return { found: false };

        const current = queue.shift();
        this.maze.visitedCells.push(current);

        if (speed > 0) {
            this.steps.push({ type: 'visit', cell: current, direction });
            if (this.renderer) this.renderer.draw();
            await this.sleep(1000 / speed);
        }

        // 检查是否与另一方向的搜索相遇
        if (otherVisited.has(current)) {
            return { found: true, meeting: current };
        }

        const neighbors = this.maze.getNeighbors(current, true);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.set(neighbor, current);
                queue.push(neighbor);
            }
        }

        return { found: false };
    }

    reconstructBidirectionalPath(meeting, frontVisited, backVisited) {
        this.maze.path = [];

        // 从起点到相遇点
        let current = meeting;
        const frontPath = [];
        while (current !== null) {
            frontPath.unshift(current);
            current = frontVisited.get(current);
        }

        // 从相遇点到终点
        current = backVisited.get(meeting);
        const backPath = [];
        while (current !== null) {
            backPath.push(current);
            current = backVisited.get(current);
        }

        this.maze.path = [...frontPath, ...backPath];
        this.maze.path.forEach(cell => cell.inPath = true);
    }
}

/**
 * 贪心最佳优先搜索
 */
class GreedyBestFirstSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        const pq = new PriorityQueue();
        
        this.maze.start.visited = true;
        pq.enqueue(this.maze.start, this.heuristic(this.maze.start, this.maze.end));

        while (!pq.isEmpty()) {
            const current = pq.dequeue();
            this.maze.visitedCells.push(current);

            if (speed > 0) {
                this.steps.push({ type: 'visit', cell: current });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            if (current === this.maze.end) {
                this.maze.reconstructPath();
                return { found: true, path: this.maze.path };
            }

            const neighbors = this.maze.getNeighbors(current, true);
            for (const neighbor of neighbors) {
                if (!neighbor.visited) {
                    neighbor.visited = true;
                    neighbor.parent = current;
                    const priority = this.heuristic(neighbor, this.maze.end);
                    pq.enqueue(neighbor, priority);
                }
            }
        }

        return { found: false, path: [] };
    }
}

/**
 * 优先队列实现（用于A*和Dijkstra）
 */
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority) {
        const element = { item, priority };
        let added = false;

        for (let i = 0; i < this.items.length; i++) {
            if (element.priority < this.items[i].priority) {
                this.items.splice(i, 0, element);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(element);
        }
    }

    dequeue() {
        return this.items.shift().item;
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }
}

/**
 * 跳点搜索 (Jump Point Search) - A*的优化版本
 */
class JPSSolver extends MazeSolver {
    async solve(speed = 10) {
        this.maze.resetVisited();
        const openSet = new PriorityQueue();
        const gScore = new Map();
        const fScore = new Map();

        this.maze.start.visited = true;
        gScore.set(this.maze.start, 0);
        fScore.set(this.maze.start, this.heuristic(this.maze.start, this.maze.end));
        openSet.enqueue(this.maze.start, fScore.get(this.maze.start));

        while (!openSet.isEmpty()) {
            const current = openSet.dequeue();
            this.maze.visitedCells.push(current);

            if (speed > 0) {
                this.steps.push({ type: 'visit', cell: current });
                if (this.renderer) this.renderer.draw();
                await this.sleep(1000 / speed);
            }

            if (current === this.maze.end) {
                this.maze.reconstructPath();
                return { found: true, path: this.maze.path };
            }

            // 查找跳点
            const jumpPoints = this.findJumpPoints(current);
            
            for (const jp of jumpPoints) {
                const tentativeGScore = gScore.get(current) + 
                    this.distance(current, jp);

                if (!gScore.has(jp) || tentativeGScore < gScore.get(jp)) {
                    jp.parent = current;
                    gScore.set(jp, tentativeGScore);
                    fScore.set(jp, tentativeGScore + this.heuristic(jp, this.maze.end));

                    if (!jp.visited) {
                        jp.visited = true;
                        openSet.enqueue(jp, fScore.get(jp));
                    }
                }
            }
        }

        return { found: false, path: [] };
    }

    findJumpPoints(current) {
        const jumpPoints = [];
        const directions = [
            { row: -1, col: 0, wall: 'top' },
            { row: 0, col: 1, wall: 'right' },
            { row: 1, col: 0, wall: 'bottom' },
            { row: 0, col: -1, wall: 'left' }
        ];

        for (const dir of directions) {
            const jp = this.jump(current, dir);
            if (jp) jumpPoints.push(jp);
        }

        return jumpPoints;
    }

    jump(current, direction) {
        if (current.walls[direction.wall]) return null;

        const next = this.maze.getCell(
            current.row + direction.row,
            current.col + direction.col
        );

        if (!next || next.visited) return null;
        if (next === this.maze.end) return next;

        // 检查是否为跳点
        if (this.hasStrongNeighbor(next, direction)) {
            return next;
        }

        // 继续跳跃
        return this.jump(next, direction);
    }

    hasStrongNeighbor(cell, direction) {
        // 简化的跳点判断
        const perpDirs = this.getPerpendicularDirections(direction);
        for (const pd of perpDirs) {
            const neighbor = this.maze.getCell(
                cell.row + pd.row,
                cell.col + pd.col
            );
            if (neighbor && !cell.walls[pd.wall]) {
                return true;
            }
        }
        return false;
    }

    getPerpendicularDirections(direction) {
        if (direction.row !== 0) {
            return [
                { row: 0, col: 1, wall: 'right' },
                { row: 0, col: -1, wall: 'left' }
            ];
        } else {
            return [
                { row: -1, col: 0, wall: 'top' },
                { row: 1, col: 0, wall: 'bottom' }
            ];
        }
    }

    distance(cell1, cell2) {
        return Math.abs(cell1.row - cell2.row) + Math.abs(cell1.col - cell2.col);
    }
}

// 求解器工厂
const SolverFactory = {
    create(algorithmName, maze) {
        const solvers = {
            'bfs': BFSSolver,
            'dfs': DFSSolver,
            'astar': AStarSolver,
            'dijkstra': DijkstraSolver,
            'bidirectionalBFS': BidirectionalBFSSolver,
            'greedy': GreedyBestFirstSolver,
            'jps': JPSSolver
        };

        const SolverClass = solvers[algorithmName];
        if (!SolverClass) {
            throw new Error(`未知的求解算法: ${algorithmName}`);
        }

        return new SolverClass(maze);
    }
};
