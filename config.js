// 游戏配置文件
// 用户可以通过修改这些参数来自定义游戏体验

// 基础游戏配置
const GAME_SETTINGS = {
    // 画布和网格设置
    canvas: {
        size: 400,              // 画布大小（像素）
        gridSize: 20,           // 网格大小（像素）
        backgroundColor: '#1a202c',  // 画布背景色
        gridColor: '#2d3748'    // 网格线颜色
    },
    
    // 游戏速度和难度
    gameplay: {
        initialSpeed: 75,      // 初始游戏速度（毫秒）
        speedIncrement: 5,      // 速度递增值
        scorePerFood: 10,       // 每个食物的分数
        enableDynamicDifficulty: true,  // 是否启用动态难度
        
        // 难度等级配置
        difficultyLevels: {
            easy: { 
                speed: 150, 
                name: '简单',
                lengthThreshold: 1 
            },
            medium: { 
                speed: 120, 
                name: '中等',
                lengthThreshold: 10 
            },
            hard: { 
                speed: 90, 
                name: '困难',
                lengthThreshold: 15 
            },
            expert: { 
                speed: 60, 
                name: '专家',
                lengthThreshold: 20 
            }
        }
    },
    
    // 视觉效果配置
    visual: {
        // 蛇的外观
        snake: {
            headColor: '#38a169',       // 蛇头颜色
            bodyColor: '#48bb78',       // 蛇身颜色
            eyeColor: '#ffffff',        // 眼睛颜色
            eyePupilColor: '#1a202c',   // 眼珠颜色
            bodyFadeEffect: true,       // 蛇身渐变效果
            minBodyOpacity: 0.3         // 蛇尾最小透明度
        },
        
        // 食物的外观
        food: {
            primaryColor: '#e53e3e',    // 食物主色
            highlightColor: '#fc8181',  // 食物高光色
            enableHighlight: true       // 是否显示高光效果
        },
        
        // 动画效果
        animations: {
            enableTransitions: true,    // 启用过渡动画
            buttonHoverEffect: true,    // 按钮悬停效果
            pulseAnimation: true        // 脉冲动画效果
        }
    },
    
    // 控制设置
    controls: {
        enableKeyboard: true,       // 启用键盘控制
        enableTouch: true,          // 启用触屏控制
        preventReverse: true,       // 防止反向移动
        
        // 键盘映射
        keyMapping: {
            up: ['ArrowUp', 'KeyW'],
            down: ['ArrowDown', 'KeyS'],
            left: ['ArrowLeft', 'KeyA'],
            right: ['ArrowRight', 'KeyD'],
            pause: ['Space'],
            restart: ['KeyR']
        }
    },
    
    // 音效设置（预留）
    audio: {
        enableSounds: false,        // 启用音效
        enableMusic: false,         // 启用背景音乐
        volume: 0.5,               // 音量大小
        
        // 音效文件路径（预留）
        sounds: {
            eat: null,              // 吃食物音效
            gameOver: null,         // 游戏结束音效
            levelUp: null           // 升级音效
        }
    },
    
    // 存储设置
    storage: {
        enableLocalStorage: true,   // 启用本地存储
        saveHighScore: true,        // 保存最高分
        saveSettings: false,        // 保存用户设置
        storagePrefix: 'snakeGame_' // 存储键前缀
    },
    
    // 调试和开发设置
    debug: {
        enableConsoleLog: false,    // 启用控制台日志
        showFPS: false,            // 显示帧率
        showGrid: true,            // 显示网格
        enableCheatMode: false     // 启用作弊模式
    }
};

// 主题配色方案
const THEMES = {
    default: {
        name: '默认主题',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        containerBg: 'rgba(255, 255, 255, 0.95)',
        textColor: '#333333',
        accentColor: '#38a169'
    },
    
    dark: {
        name: '暗黑主题',
        background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
        containerBg: 'rgba(45, 55, 72, 0.95)',
        textColor: '#e2e8f0',
        accentColor: '#48bb78'
    },
    
    ocean: {
        name: '海洋主题',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        containerBg: 'rgba(102, 126, 234, 0.1)',
        textColor: '#2d3748',
        accentColor: '#3182ce'
    },
    
    sunset: {
        name: '日落主题',
        background: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
        containerBg: 'rgba(255, 255, 255, 0.9)',
        textColor: '#744210',
        accentColor: '#dd6b20'
    }
};

// 预设游戏模式
const GAME_MODES = {
    classic: {
        name: '经典模式',
        description: '传统的贪吃蛇游戏',
        settings: {
            ...GAME_SETTINGS,
            gameplay: {
                ...GAME_SETTINGS.gameplay,
                initialSpeed: 150
            }
        }
    },
    
    speed: {
        name: '极速模式',
        description: '更快的游戏节奏',
        settings: {
            ...GAME_SETTINGS,
            gameplay: {
                ...GAME_SETTINGS.gameplay,
                initialSpeed: 100
            }
        }
    },
    
    zen: {
        name: '禅意模式',
        description: '放松的游戏体验',
        settings: {
            ...GAME_SETTINGS,
            gameplay: {
                ...GAME_SETTINGS.gameplay,
                initialSpeed: 200,
                enableDynamicDifficulty: false
            }
        }
    }
};

// 导出配置（如果在模块环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_SETTINGS,
        THEMES,
        GAME_MODES
    };
}

// 配置验证函数
function validateConfig(config) {
    const errors = [];
    
    // 验证画布大小
    if (config.canvas.size <= 0 || config.canvas.size % config.canvas.gridSize !== 0) {
        errors.push('画布大小必须是网格大小的整数倍');
    }
    
    // 验证速度设置
    if (config.gameplay.initialSpeed <= 0) {
        errors.push('初始速度必须大于0');
    }
    
    // 验证分数设置
    if (config.gameplay.scorePerFood <= 0) {
        errors.push('食物分数必须大于0');
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// 应用配置函数
function applyConfig(config) {
    const validation = validateConfig(config);
    
    if (!validation.isValid) {
        console.error('配置验证失败:', validation.errors);
        return false;
    }
    
    // 应用配置到全局变量
    if (typeof window !== 'undefined') {
        window.CURRENT_CONFIG = config;
    }
    
    return true;
}

// 初始化默认配置
if (typeof window !== 'undefined') {
    window.GAME_SETTINGS = GAME_SETTINGS;
    window.THEMES = THEMES;
    window.GAME_MODES = GAME_MODES;
    window.validateConfig = validateConfig;
    window.applyConfig = applyConfig;
    
    // 应用默认配置
    applyConfig(GAME_SETTINGS);
}