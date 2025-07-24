// 游戏常量配置
const GAME_CONFIG = {
    CANVAS_SIZE: 400,
    GRID_SIZE: 20,
    INITIAL_SPEED: 150,
    SPEED_INCREMENT: 5,
    SCORE_PER_FOOD: 10,
    DIFFICULTY_LEVELS: {
        EASY: { speed: 150, name: '简单' },
        MEDIUM: { speed: 120, name: '中等' },
        HARD: { speed: 90, name: '困难' },
        EXPERT: { speed: 60, name: '专家' }
    }
};

// 方向常量
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// 游戏状态
const GAME_STATES = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
};

// 游戏类
class SnakeGame {
    constructor() {
        this.initializeElements();
        this.initializeGame();
        this.bindEvents();
        this.loadHighScore();
    }

    // 初始化DOM元素
    initializeElements() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('game-overlay');
        this.overlayTitle = document.getElementById('overlay-title');
        this.overlayText = document.getElementById('overlay-text');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.currentScoreElement = document.getElementById('current-score');
        this.highScoreElement = document.getElementById('high-score');
        this.gameTimeElement = document.getElementById('game-time');
        this.snakeLengthElement = document.getElementById('snake-length');
        this.difficultyElement = document.getElementById('difficulty');
    }

    // 初始化游戏状态
    initializeGame() {
        this.gameState = GAME_STATES.WAITING;
        this.score = 0;
        this.highScore = 0;
        this.gameStartTime = null;
        this.gameTime = 0;
        this.currentSpeed = GAME_CONFIG.INITIAL_SPEED;
        this.difficulty = 'EASY';
        
        // 初始化蛇
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = DIRECTIONS.RIGHT;
        this.nextDirection = DIRECTIONS.RIGHT;
        
        // 生成第一个食物
        this.generateFood();
        
        this.updateUI();
        this.draw();
    }

    // 绑定事件监听器
    bindEvents() {
        // 按钮事件
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 控制按钮事件
        const controlButtons = document.querySelectorAll('.control-btn');
        controlButtons.forEach(button => {
            button.addEventListener('click', () => {
                const direction = button.dataset.direction;
                this.changeDirection(direction);
            });
        });
        
        // 防止页面滚动
        document.addEventListener('keydown', (e) => {
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    // 处理键盘输入
    handleKeyPress(event) {
        if (this.gameState === GAME_STATES.WAITING) {
            if (event.code === 'Space') {
                this.startGame();
            }
            return;
        }
        
        if (this.gameState === GAME_STATES.GAME_OVER) {
            if (event.key === 'r' || event.key === 'R') {
                this.restartGame();
            }
            return;
        }
        
        if (this.gameState === GAME_STATES.PLAYING || this.gameState === GAME_STATES.PAUSED) {
            switch (event.key) {
                case 'ArrowUp':
                    this.changeDirection('up');
                    break;
                case 'ArrowDown':
                    this.changeDirection('down');
                    break;
                case 'ArrowLeft':
                    this.changeDirection('left');
                    break;
                case 'ArrowRight':
                    this.changeDirection('right');
                    break;
                case ' ':
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    this.restartGame();
                    break;
            }
        }
    }

    // 改变蛇的方向
    changeDirection(direction) {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        const newDirection = DIRECTIONS[direction.toUpperCase()];
        
        // 防止蛇反向移动
        if (newDirection.x === -this.direction.x && newDirection.y === -this.direction.y) {
            return;
        }
        
        this.nextDirection = newDirection;
    }

    // 开始游戏
    startGame() {
        this.gameState = GAME_STATES.PLAYING;
        this.gameStartTime = Date.now();
        this.hideOverlay();
        this.gameLoop();
    }

    // 重新开始游戏
    restartGame() {
        this.stopGame();
        this.initializeGame();
        this.showOverlay('开始游戏', '按空格键开始游戏', true);
    }

    // 暂停/继续游戏
    togglePause() {
        if (this.gameState === GAME_STATES.PLAYING) {
            this.gameState = GAME_STATES.PAUSED;
            this.showOverlay('游戏暂停', '按空格键继续游戏', false);
        } else if (this.gameState === GAME_STATES.PAUSED) {
            this.gameState = GAME_STATES.PLAYING;
            this.hideOverlay();
            this.gameLoop();
        }
    }

    // 停止游戏
    stopGame() {
        if (this.gameLoopId) {
            clearTimeout(this.gameLoopId);
            this.gameLoopId = null;
        }
    }

    // 游戏主循环
    gameLoop() {
        if (this.gameState !== GAME_STATES.PLAYING) return;
        
        this.update();
        this.draw();
        this.updateUI();
        
        this.gameLoopId = setTimeout(() => this.gameLoop(), this.currentSpeed);
    }

    // 更新游戏状态
    update() {
        // 更新方向
        this.direction = this.nextDirection;
        
        // 计算蛇头新位置
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // 检查边界碰撞
        if (this.checkWallCollision(head)) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        if (this.checkSelfCollision(head)) {
            this.gameOver();
            return;
        }
        
        // 移动蛇
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.eatFood();
        } else {
            this.snake.pop();
        }
        
        // 更新游戏时间
        this.updateGameTime();
    }

    // 检查墙壁碰撞
    checkWallCollision(head) {
        const gridCount = GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE;
        return head.x < 0 || head.x >= gridCount || head.y < 0 || head.y >= gridCount;
    }

    // 检查自身碰撞
    checkSelfCollision(head) {
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    // 吃到食物
    eatFood() {
        this.score += GAME_CONFIG.SCORE_PER_FOOD;
        this.generateFood();
        this.updateDifficulty();
        
        // 检查并更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
    }

    // 生成食物
    generateFood() {
        const gridCount = GAME_CONFIG.CANVAS_SIZE / GAME_CONFIG.GRID_SIZE;
        let newFood;
        
        do {
            newFood = {
                x: Math.floor(Math.random() * gridCount),
                y: Math.floor(Math.random() * gridCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }

    // 更新难度
    updateDifficulty() {
        const length = this.snake.length;
        
        if (length >= 20) {
            this.difficulty = 'EXPERT';
            this.currentSpeed = GAME_CONFIG.DIFFICULTY_LEVELS.EXPERT.speed;
        } else if (length >= 15) {
            this.difficulty = 'HARD';
            this.currentSpeed = GAME_CONFIG.DIFFICULTY_LEVELS.HARD.speed;
        } else if (length >= 10) {
            this.difficulty = 'MEDIUM';
            this.currentSpeed = GAME_CONFIG.DIFFICULTY_LEVELS.MEDIUM.speed;
        } else {
            this.difficulty = 'EASY';
            this.currentSpeed = GAME_CONFIG.DIFFICULTY_LEVELS.EASY.speed;
        }
    }

    // 游戏结束
    gameOver() {
        this.gameState = GAME_STATES.GAME_OVER;
        this.stopGame();
        
        const finalScore = this.score;
        const isNewRecord = finalScore > this.highScore;
        
        let message = `游戏结束！\n最终分数: ${finalScore}`;
        if (isNewRecord) {
            message += '\n🎉 新纪录！';
        }
        message += '\n按R键重新开始';
        
        this.showOverlay('游戏结束', message, false, true);
    }

    // 更新游戏时间
    updateGameTime() {
        if (this.gameStartTime) {
            this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
        }
    }

    // 绘制游戏画面
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#1a202c';
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_SIZE, GAME_CONFIG.CANVAS_SIZE);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制食物
        this.drawFood();
        
        // 绘制蛇
        this.drawSnake();
    }

    // 绘制网格
    drawGrid() {
        this.ctx.strokeStyle = '#2d3748';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i <= GAME_CONFIG.CANVAS_SIZE; i += GAME_CONFIG.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, GAME_CONFIG.CANVAS_SIZE);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(GAME_CONFIG.CANVAS_SIZE, i);
            this.ctx.stroke();
        }
    }

    // 绘制蛇
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * GAME_CONFIG.GRID_SIZE;
            const y = segment.y * GAME_CONFIG.GRID_SIZE;
            
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#38a169';
                this.ctx.fillRect(x + 1, y + 1, GAME_CONFIG.GRID_SIZE - 2, GAME_CONFIG.GRID_SIZE - 2);
                
                // 蛇头眼睛
                this.ctx.fillStyle = '#fff';
                const eyeSize = 3;
                const eyeOffset = 5;
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + GAME_CONFIG.GRID_SIZE - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
            } else {
                // 蛇身
                const alpha = 1 - (index * 0.1);
                this.ctx.fillStyle = `rgba(72, 187, 120, ${Math.max(alpha, 0.3)})`;
                this.ctx.fillRect(x + 2, y + 2, GAME_CONFIG.GRID_SIZE - 4, GAME_CONFIG.GRID_SIZE - 4);
            }
        });
    }

    // 绘制食物
    drawFood() {
        const x = this.food.x * GAME_CONFIG.GRID_SIZE;
        const y = this.food.y * GAME_CONFIG.GRID_SIZE;
        
        // 食物主体
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.fillRect(x + 2, y + 2, GAME_CONFIG.GRID_SIZE - 4, GAME_CONFIG.GRID_SIZE - 4);
        
        // 食物高光
        this.ctx.fillStyle = '#fc8181';
        this.ctx.fillRect(x + 4, y + 4, 6, 6);
    }

    // 显示覆盖层
    showOverlay(title, text, showStart = false, showRestart = false) {
        this.overlayTitle.textContent = title;
        this.overlayText.textContent = text;
        
        this.startButton.style.display = showStart ? 'inline-block' : 'none';
        this.restartButton.style.display = showRestart ? 'inline-block' : 'none';
        
        this.overlay.classList.remove('hidden');
    }

    // 隐藏覆盖层
    hideOverlay() {
        this.overlay.classList.add('hidden');
    }

    // 更新UI显示
    updateUI() {
        this.currentScoreElement.textContent = this.score;
        this.highScoreElement.textContent = this.highScore;
        this.snakeLengthElement.textContent = this.snake.length;
        this.difficultyElement.textContent = GAME_CONFIG.DIFFICULTY_LEVELS[this.difficulty].name;
        
        // 更新游戏时间显示
        const minutes = Math.floor(this.gameTime / 60);
        const seconds = this.gameTime % 60;
        this.gameTimeElement.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // 保存最高分
    saveHighScore() {
        localStorage.setItem('snakeGameHighScore', this.highScore.toString());
    }

    // 加载最高分
    loadHighScore() {
        const saved = localStorage.getItem('snakeGameHighScore');
        if (saved) {
            this.highScore = parseInt(saved, 10);
        }
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
    
    // 添加页面可见性变化监听，自动暂停游戏
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && game.gameState === GAME_STATES.PLAYING) {
            game.togglePause();
        }
    });
});

// 防止页面刷新时丢失游戏状态的警告
window.addEventListener('beforeunload', (e) => {
    const game = window.game;
    if (game && game.gameState === GAME_STATES.PLAYING) {
        e.preventDefault();
        e.returnValue = '游戏正在进行中，确定要离开吗？';
    }
});