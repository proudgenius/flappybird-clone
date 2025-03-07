// Flappy Bird Clone - Main Game Logic

// Game constants
const CANVAS_WIDTH = 640;     // Doubled resolution
const CANVAS_HEIGHT = 960;    // Doubled resolution
const GRAVITY = 0.3;          // Adjusted for higher resolution
const FLAP_FORCE = -9;        // Adjusted for higher resolution
const PIPE_SPEED = 4;         // Adjusted for higher resolution
const PIPE_SPAWN_INTERVAL = 1500; // milliseconds
const PIPE_GAP = 240;         // Adjusted for higher resolution
const GROUND_HEIGHT = 224;    // Adjusted for higher resolution
const COLOR_CHANGE_INTERVAL = 3000; // Change colors every 3 seconds for faster testing

// Game variables
let canvas, ctx;
let lastTime = 0;
let deltaTime = 0;
let score = 0;
let highScore = 0;
let gameState = 'start'; // 'start', 'playing', 'gameover'
let gameStartTime = 0;   // Track when the game started for grace period
let currentColorScheme = 0; // Current color scheme index
let lastColorChangeTime = 0; // Last time the colors were changed
let dayNightCycle = 0; // 0 = day, 1 = night, values in between represent transition
let dayNightSpeed = 0.00002; // Speed of day/night cycle (reduced for slower transitions)
let dayNightDirection = 1; // 1 = moving toward night, -1 = moving toward day
let groundOffset = 0; // For ground parallax scrolling

// Game objects
let bird = {
    x: 100,                   // Adjusted for higher resolution
    y: CANVAS_HEIGHT / 2 - 24, // Adjusted for higher resolution
    width: 68,                // Doubled size
    height: 48,               // Doubled size
    velocity: 0,
    flapping: false,
    rotation: 0,
    frame: 0,
    frameCount: 3,
    frameDelay: 5,
    frameTimer: 0
};

let pipes = [];
let pipeTimer = 0;

// Background layers for parallax effect
const backgroundLayers = [
    { // Far clouds (slowest)
        x: 0,
        speed: 0.5,
        clouds: [
            { x: 100, y: 100, size: 1.2 },
            { x: 300, y: 50, size: 0.8 },
            { x: 500, y: 150, size: 1.5 },
            { x: 700, y: 80, size: 1.0 },
            { x: 900, y: 120, size: 1.3 }
        ]
    },
    { // Medium clouds
        x: 0,
        speed: 1,
        clouds: [
            { x: 200, y: 180, size: 1.0 },
            { x: 400, y: 70, size: 1.1 },
            { x: 600, y: 120, size: 0.9 },
            { x: 800, y: 60, size: 1.2 }
        ]
    },
    { // Near clouds (fastest)
        x: 0,
        speed: 1.5,
        clouds: [
            { x: 150, y: 200, size: 0.7 },
            { x: 350, y: 90, size: 0.6 },
            { x: 550, y: 170, size: 0.8 },
            { x: 750, y: 40, size: 0.5 }
        ]
    }
];

// Color schemes
const colorSchemes = [
    // Original (Default)
    {
        name: 'Original',
        background: '#70c5ce',  // Sky blue
        bird: '#f8e159',        // Yellow
        birdOutline: '#cb5c0d', // Brown
        birdWing: '#cb5c0d',    // Brown
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#f48c20',    // Orange
        pipe: '#74c442',        // Green
        pipeCap: '#8ed552',     // Light green
        ground: '#ded895',      // Tan
        groundLine: '#c0a080'   // Brown
    },
    // Monochromatic (Blues)
    {
        name: 'Monochromatic',
        background: '#a0d8ef',  // Light blue
        bird: '#2c75ff',        // Medium blue
        birdOutline: '#1a4b9c', // Dark blue
        birdWing: '#1a4b9c',    // Dark blue
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#5d8fdd',    // Blue-gray
        pipe: '#3a8fb7',        // Teal blue
        pipeCap: '#6eb5c0',     // Light teal
        ground: '#cad9e3',      // Light gray-blue
        groundLine: '#8da9b9'   // Gray-blue
    },
    // Analogous (Greens and Blues)
    {
        name: 'Analogous',
        background: '#89cff0',  // Baby blue
        bird: '#7fff00',        // Chartreuse
        birdOutline: '#228b22', // Forest green
        birdWing: '#228b22',    // Forest green
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#32cd32',    // Lime green
        pipe: '#00ced1',        // Dark turquoise
        pipeCap: '#40e0d0',     // Turquoise
        ground: '#98fb98',      // Pale green
        groundLine: '#3cb371'   // Medium sea green
    },
    // Complementary (Purple and Yellow)
    {
        name: 'Complementary',
        background: '#9370db',  // Medium purple
        bird: '#ffd700',        // Gold
        birdOutline: '#b8860b', // Dark goldenrod
        birdWing: '#b8860b',    // Dark goldenrod
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#daa520',    // Goldenrod
        pipe: '#8a2be2',        // Blue violet
        pipeCap: '#9932cc',     // Dark orchid
        ground: '#f0e68c',      // Khaki
        groundLine: '#bdb76b'   // Dark khaki
    },
    // Triadic (Red, Yellow, Blue)
    {
        name: 'Triadic',
        background: '#4169e1',  // Royal blue
        bird: '#ffd700',        // Gold
        birdOutline: '#b8860b', // Dark goldenrod
        birdWing: '#b8860b',    // Dark goldenrod
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#daa520',    // Goldenrod
        pipe: '#dc143c',        // Crimson
        pipeCap: '#ff4500',     // Orange red
        ground: '#f0e68c',      // Khaki
        groundLine: '#cd853f'   // Peru
    },
    // Split-complementary (Blue with Red-Orange and Yellow-Orange)
    {
        name: 'Split-complementary',
        background: '#1e90ff',  // Dodger blue
        bird: '#ff8c00',        // Dark orange
        birdOutline: '#8b4513', // Saddle brown
        birdWing: '#8b4513',    // Saddle brown
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#ff4500',    // Orange red
        pipe: '#ff6347',        // Tomato
        pipeCap: '#ff7f50',     // Coral
        ground: '#ffa500',      // Orange
        groundLine: '#cd853f'   // Peru
    },
    // Tetradic (Red, Green, Blue, Yellow)
    {
        name: 'Tetradic',
        background: '#4682b4',  // Steel blue
        bird: '#ffd700',        // Gold
        birdOutline: '#b8860b', // Dark goldenrod
        birdWing: '#b8860b',    // Dark goldenrod
        birdEye: '#ffffff',     // White
        birdPupil: '#000000',   // Black
        birdBeak: '#daa520',    // Goldenrod
        pipe: '#2e8b57',        // Sea green
        pipeCap: '#3cb371',     // Medium sea green
        ground: '#cd5c5c',      // Indian red
        groundLine: '#8b0000'   // Dark red
    }
];

// Current color scheme (starts with original)
let colors = colorSchemes[0];

// Sound effects and music using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let backgroundMusic;
let isMusicPlaying = false;
let isMusicMuted = false;

const sounds = {
    flap: () => {
        playSound(600, 0.1, 'square', 0.3);
    },
    score: () => {
        playSound(800, 0.1, 'sine', 0.5);
        setTimeout(() => playSound(1200, 0.1, 'sine', 0.5), 100);
    },
    hit: () => {
        playSound(300, 0.1, 'sawtooth', 0.5);
    },
    die: () => {
        playSound(200, 0.3, 'sawtooth', 0.5);
    }
};

// Create and play background music
function createBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.stop();
    }
    
    // Create oscillators for a simple melody
    const melody = [
        { note: 'C4', duration: 0.5 },
        { note: 'E4', duration: 0.5 },
        { note: 'G4', duration: 0.5 },
        { note: 'C5', duration: 0.5 },
        { note: 'G4', duration: 0.5 },
        { note: 'E4', duration: 0.5 },
        { note: 'C4', duration: 1 },
        { note: 'D4', duration: 0.5 },
        { note: 'F4', duration: 0.5 },
        { note: 'A4', duration: 0.5 },
        { note: 'D5', duration: 0.5 },
        { note: 'A4', duration: 0.5 },
        { note: 'F4', duration: 0.5 },
        { note: 'D4', duration: 1 }
    ];
    
    // Convert note names to frequencies
    const noteToFreq = {
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33
    };
    
    // Create gain node for volume control
    const gainNode = audioContext.createGain();
    gainNode.gain.value = isMusicMuted ? 0 : 0.2; // Lower volume for background music
    gainNode.connect(audioContext.destination);
    
    // Function to play a note
    function playNote(note, time, duration) {
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = noteToFreq[note];
        
        // Create a gain node for this note
        const noteGain = audioContext.createGain();
        noteGain.gain.value = 0;
        
        // Connect oscillator to gain node
        oscillator.connect(noteGain);
        noteGain.connect(gainNode);
        
        // Schedule note start
        oscillator.start(time);
        
        // Fade in
        noteGain.gain.setValueAtTime(0, time);
        noteGain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        
        // Fade out
        noteGain.gain.setValueAtTime(0.3, time + duration - 0.05);
        noteGain.gain.linearRampToValueAtTime(0, time + duration);
        
        // Schedule note end
        oscillator.stop(time + duration);
    }
    
    // Schedule the melody
    let currentTime = audioContext.currentTime;
    let totalDuration = 0;
    
    // Calculate total duration
    for (const note of melody) {
        totalDuration += note.duration;
    }
    
    // Function to play the melody in a loop
    function playMelody() {
        if (!isMusicPlaying) return;
        
        currentTime = audioContext.currentTime;
        
        for (const note of melody) {
            playNote(note.note, currentTime, note.duration);
            currentTime += note.duration;
        }
        
        // Schedule the next loop
        setTimeout(playMelody, totalDuration * 1000 - 50); // Slight overlap for seamless looping
    }
    
    // Start playing
    isMusicPlaying = true;
    playMelody();
    
    // Return control object
    return {
        stop: () => {
            isMusicPlaying = false;
        },
        setVolume: (volume) => {
            gainNode.gain.value = volume;
        },
        mute: () => {
            gainNode.gain.value = 0;
            isMusicMuted = true;
        },
        unmute: () => {
            gainNode.gain.value = 0.2;
            isMusicMuted = false;
        }
    };
}

// Toggle music on/off
function toggleMusic() {
    if (isMusicPlaying) {
        if (isMusicMuted) {
            backgroundMusic.unmute();
            document.getElementById('music-button').textContent = '🔊';
        } else {
            backgroundMusic.mute();
            document.getElementById('music-button').textContent = '🔇';
        }
    } else {
        backgroundMusic = createBackgroundMusic();
        document.getElementById('music-button').textContent = '🔊';
    }
}

// Helper function to play a sound
function playSound(frequency, duration, type = 'sine', volume = 0.5) {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.connect(gainNode);
        
        gainNode.connect(audioContext.destination);
        gainNode.gain.value = volume;
        
        oscillator.start();
        
        // Fade out
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        // Stop after duration
        setTimeout(() => {
            oscillator.stop();
        }, duration * 1000);
    } catch (e) {
        console.log('Error playing sound:', e);
    }
}

// Initialize the game
function init() {
    // Get canvas and context
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d', { alpha: false });
    
    // Set canvas dimensions
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Disable image smoothing for crisp pixel art
    ctx.imageSmoothingEnabled = false;
    
    // Set up event listeners
    setupEventListeners();
    
    // Load high score from local storage
    loadHighScore();
    
    // Initialize color scheme
    lastColorChangeTime = Date.now();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Set up event listeners
function setupEventListeners() {
    // Start button
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Restart button
    document.getElementById('restart-button').addEventListener('click', restartGame);
    
    // Reset score button
    document.getElementById('reset-score-button').addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent restarting the game
        resetHighScore();
    });
    
    // Music button
    document.getElementById('music-button').addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent flapping
        toggleMusic();
    });
    
    // Mouse/touch events for flapping
    canvas.addEventListener('mousedown', handleFlap);
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent scrolling
        handleFlap();
    });
    
    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            handleFlap();
        }
    });
    
    // Window resize event
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
}

// Reset high score
function resetHighScore() {
    highScore = 0;
    saveHighScore();
    
    // Update the high score display
    const highScoreMessage = document.getElementById('high-score-message');
    highScoreMessage.classList.add('hidden');
    
    // Show a confirmation message
    alert('Best score has been reset to 0');
}

// Manually change color scheme
function changeColorScheme() {
    currentColorScheme = (currentColorScheme + 1) % colorSchemes.length;
    colors = colorSchemes[currentColorScheme];
    
    // Show notification
    showColorSchemeNotification(colors.name);
    
    // Log the color scheme change
    console.log(`Color scheme changed to: ${colors.name}`);
}

// Handle flapping
function handleFlap() {
    if (gameState === 'start') {
        startGame();
        return;
    }
    
    if (gameState === 'playing') {
        bird.flapping = true;
        bird.velocity = FLAP_FORCE;
        
        // Play flap sound
        sounds.flap();
    }
    
    if (gameState === 'gameover') {
        restartGame();
    }
}

// Start the game
function startGame() {
    gameState = 'playing';
    score = 0;
    resetBird();
    pipes = [];
    pipeTimer = 0;  // Reset pipe timer
    gameStartTime = Date.now();  // Set the game start time
    
    // Always use the original color scheme
    currentColorScheme = 0;
    colors = colorSchemes[currentColorScheme];
    
    // Hide start screen
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    
    // Start background music if not already playing
    if (!isMusicPlaying) {
        backgroundMusic = createBackgroundMusic();
    }
    
    // Initial flap to give the player a boost
    bird.velocity = FLAP_FORCE / 2;
}

// Restart the game
function restartGame() {
    gameState = 'playing';
    score = 0;
    resetBird();
    pipes = [];
    pipeTimer = 0;
    gameStartTime = Date.now();  // Set the game start time
    
    // Reset the first pipe spawned flag
    firstPipeSpawned = false;
    
    // Randomly change the color scheme
    currentColorScheme = getRandomColorScheme();
    colors = colorSchemes[currentColorScheme];
    
    // Hide game over screen
    document.getElementById('game-over-screen').classList.add('hidden');
}

// Reset bird position and velocity
function resetBird() {
    bird.y = CANVAS_HEIGHT / 3 - 12;  // Position bird higher up
    bird.velocity = 0;
    bird.rotation = 0;
}

// Game over
function gameOver() {
    gameState = 'gameover';
    
    // Play hit and die sounds
    sounds.hit();
    
    setTimeout(() => {
        sounds.die();
    }, 300);
    
    // Update high score and show special message if new high score
    // For the first play, any score (even 0) is a new high score
    const isNewHighScore = score >= highScore && (score > 0 || highScore === 0);
    if (isNewHighScore) {
        highScore = score;
        saveHighScore();
        
        // Play a special sound for new high score
        setTimeout(() => {
            playSound(600, 0.1, 'sine', 0.5);
            setTimeout(() => playSound(800, 0.1, 'sine', 0.5), 100);
            setTimeout(() => playSound(1000, 0.2, 'sine', 0.5), 200);
        }, 600);
    }
    
    // Show game over screen
    document.getElementById('final-score').textContent = score;
    
    // Show or hide high score message
    const highScoreMessage = document.getElementById('high-score-message');
    if (isNewHighScore) {
        highScoreMessage.classList.remove('hidden');
    } else {
        highScoreMessage.classList.add('hidden');
    }
    
    document.getElementById('game-over-screen').classList.remove('hidden');
}

// Save high score to local storage
function saveHighScore() {
    localStorage.setItem('flappyBirdHighScore', highScore);
}

// Load high score from local storage
function loadHighScore() {
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore !== null) {
        highScore = parseInt(savedHighScore);
    }
}

// Resize canvas to maintain aspect ratio but expand view
function resizeCanvas() {
    const gameContainer = document.querySelector('.game-container');
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Update container size to fill the screen
    gameContainer.style.width = containerWidth + 'px';
    gameContainer.style.height = containerHeight + 'px';
    
    // Keep the original canvas dimensions for game logic
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Calculate the scale to fill the screen while maintaining aspect ratio
    const gameRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
    const containerRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerRatio < gameRatio) {
        canvasWidth = containerWidth;
        canvasHeight = containerWidth / gameRatio;
    } else {
        canvasHeight = containerHeight;
        canvasWidth = containerHeight * gameRatio;
    }
    
    // Apply the new dimensions to the canvas style
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    // Center the canvas
    canvas.style.position = 'absolute';
    canvas.style.left = (containerWidth - canvasWidth) / 2 + 'px';
    canvas.style.top = (containerHeight - canvasHeight) / 2 + 'px';
    
    // Disable image smoothing
    ctx.imageSmoothingEnabled = false;
}

// Function to cycle through color schemes
function updateColorScheme(timestamp) {
    // Check if it's time to change colors
    if (timestamp - lastColorChangeTime > COLOR_CHANGE_INTERVAL) {
        lastColorChangeTime = timestamp;
        currentColorScheme = (currentColorScheme + 1) % colorSchemes.length;
        colors = colorSchemes[currentColorScheme];
        
        // Log the color scheme change (for debugging)
        console.log(`Color scheme changed to: ${colors.name}`);
        
        // Display a notification on screen
        showColorSchemeNotification(colors.name);
    }
}

// Show a temporary notification when color scheme changes
function showColorSchemeNotification(schemeName) {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('color-scheme-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'color-scheme-notification';
        notification.style.position = 'absolute';
        notification.style.top = '100px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '5px';
        notification.style.fontFamily = 'Arial, sans-serif';
        notification.style.fontSize = '16px';
        notification.style.zIndex = '1000';
        notification.style.transition = 'opacity 0.5s';
        document.body.appendChild(notification);
    }
    
    // Update and show notification
    notification.textContent = `Color Scheme: ${schemeName}`;
    notification.style.opacity = '1';
    
    // Hide after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 2000);
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Limit delta time to prevent large jumps
    if (deltaTime > 100) deltaTime = 100;
    
    // Update game state
    update(deltaTime);
    
    // Render game
    render();
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Update day/night cycle regardless of game state
    updateDayNightCycle(deltaTime);
    
    // Update parallax background regardless of game state
    updateParallaxBackground(deltaTime);
    
    if (gameState !== 'playing') return;
    
    // Update bird
    updateBird(deltaTime);
    
    // Update pipes
    updatePipes(deltaTime);
    
    // Check collisions after a short grace period (1 second)
    if (Date.now() - gameStartTime > 1000 && checkCollisions()) {
        gameOver();
    }
}

// Update day/night cycle
function updateDayNightCycle(deltaTime) {
    // Update day/night cycle value
    dayNightCycle += dayNightDirection * dayNightSpeed * deltaTime;
    
    // Keep value between 0 and 1
    if (dayNightCycle >= 1) {
        dayNightCycle = 1;
        dayNightDirection = -1; // Start moving toward day
    } else if (dayNightCycle <= 0) {
        dayNightCycle = 0;
        dayNightDirection = 1; // Start moving toward night
    }
}

// Update parallax background
function updateParallaxBackground(deltaTime) {
    // Only move background when playing
    if (gameState !== 'playing') return;
    
    // Update each layer's position
    for (const layer of backgroundLayers) {
        // Update cloud positions
        for (const cloud of layer.clouds) {
            cloud.x -= layer.speed * (PIPE_SPEED / 4) * (deltaTime / 16);
            
            // Wrap clouds around when they move off screen
            if (cloud.x + 100 < 0) {
                cloud.x = CANVAS_WIDTH + 50;
                cloud.y = Math.random() * (CANVAS_HEIGHT / 2);
            }
        }
    }
    
    // Update ground position to match pipe speed
    groundOffset -= PIPE_SPEED * (deltaTime / 16);
    
    // Reset ground offset when it exceeds the pattern width
    if (groundOffset <= -80) {
        groundOffset = 0;
    }
}

// Update bird position and animation
function updateBird(deltaTime) {
    // Apply gravity
    bird.velocity += GRAVITY;
    
    // Update position
    bird.y += bird.velocity;
    
    // Update rotation based on velocity
    bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.velocity / 10)));
    
    // Update animation frame
    bird.frameTimer++;
    if (bird.frameTimer >= bird.frameDelay) {
        bird.frameTimer = 0;
        bird.frame = (bird.frame + 1) % bird.frameCount;
    }
    
    // Reset flapping flag
    bird.flapping = false;
}

// Flag to track if the first pipe has been spawned
let firstPipeSpawned = false;

// Update pipes position and spawn new pipes
function updatePipes(deltaTime) {
    // Move pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= PIPE_SPEED;
        
        // Check if pipe has passed the bird
        if (!pipes[i].scored && pipes[i].x + pipes[i].width < bird.x) {
            pipes[i].scored = true;
            score++;
            
            // Play score sound
            sounds.score();
        }
        
        // Remove pipes that are off screen
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }
    }
    
    // Handle first pipe spawning with a delay
    if (!firstPipeSpawned && gameState === 'playing' && Date.now() - gameStartTime > 1500) {
        firstPipeSpawned = true;
        spawnPipe();
        pipeTimer = 0;
        return;
    }
    
    // Only spawn additional pipes after the first one has been spawned
    if (firstPipeSpawned) {
        pipeTimer += deltaTime;
        if (pipeTimer >= PIPE_SPAWN_INTERVAL) {
            pipeTimer = 0;
            spawnPipe();
        }
    }
}

// Spawn a new pipe
function spawnPipe() {
    const minHeight = 100;    // Adjusted for higher resolution
    const maxHeight = CANVAS_HEIGHT - GROUND_HEIGHT - PIPE_GAP - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    
    pipes.push({
        x: CANVAS_WIDTH,
        topHeight: topHeight,
        bottomY: topHeight + PIPE_GAP,
        width: 104,           // Doubled size
        scored: false
    });
}

// Check collisions
function checkCollisions() {
    // Get bird hitbox (slightly smaller than the sprite for better gameplay)
    const birdHitbox = {
        x: bird.x + 5,
        y: bird.y + 5,
        width: bird.width - 10,
        height: bird.height - 10
    };
    
    // Check ground collision
    if (bird.y + bird.height >= CANVAS_HEIGHT - GROUND_HEIGHT) {
        return true;
    }
    
    // Check ceiling collision
    if (bird.y <= 0) {
        return true;
    }
    
    // Check pipe collisions
    for (const pipe of pipes) {
        // Top pipe hitbox
        const topPipeHitbox = {
            x: pipe.x,
            y: 0,
            width: pipe.width,
            height: pipe.topHeight
        };
        
        // Bottom pipe hitbox
        const bottomPipeHitbox = {
            x: pipe.x,
            y: pipe.bottomY,
            width: pipe.width,
            height: CANVAS_HEIGHT - pipe.bottomY - GROUND_HEIGHT
        };
        
        // Check collision with top pipe
        if (checkHitboxCollision(birdHitbox, topPipeHitbox)) {
            return true;
        }
        
        // Check collision with bottom pipe
        if (checkHitboxCollision(birdHitbox, bottomPipeHitbox)) {
            return true;
        }
    }
    
    return false;
}

// Check collision between two hitboxes
function checkHitboxCollision(hitboxA, hitboxB) {
    return (
        hitboxA.x < hitboxB.x + hitboxB.width &&
        hitboxA.x + hitboxA.width > hitboxB.x &&
        hitboxA.y < hitboxB.y + hitboxB.height &&
        hitboxA.y + hitboxA.height > hitboxB.y
    );
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw background
    drawBackground();
    
    // Draw pipes
    drawPipes();
    
    // Draw ground
    drawGround();
    
    // Draw bird
    drawBird();
    
    // Draw score
    drawScore();
    
    // Draw game over message if game is over
    if (gameState === 'gameover') {
        drawGameOver();
    }
}

// Draw background
function drawBackground() {
    // Create gradient for sky based on day/night cycle
    const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT - GROUND_HEIGHT);
    
    // Day/night transition colors
    let topColor, bottomColor;
    
    if (dayNightCycle < 0.5) {
        // Day to sunset transition (0 to 0.5)
        const normalizedCycle = dayNightCycle * 2; // 0 to 1
        
        // Day colors
        const dayTopColor = lightenColor(colors.background, 20);
        const dayBottomColor = colors.background;
        
        // Sunset colors
        const sunsetTopColor = '#FF7F50'; // Coral
        const sunsetBottomColor = '#FF4500'; // OrangeRed
        
        // Interpolate between day and sunset
        topColor = interpolateColor(dayTopColor, sunsetTopColor, normalizedCycle);
        bottomColor = interpolateColor(dayBottomColor, sunsetBottomColor, normalizedCycle);
    } else {
        // Sunset to night transition (0.5 to 1)
        const normalizedCycle = (dayNightCycle - 0.5) * 2; // 0 to 1
        
        // Sunset colors
        const sunsetTopColor = '#FF7F50'; // Coral
        const sunsetBottomColor = '#FF4500'; // OrangeRed
        
        // Night colors
        const nightTopColor = '#191970'; // MidnightBlue
        const nightBottomColor = '#000033'; // Dark Blue
        
        // Interpolate between sunset and night
        topColor = interpolateColor(sunsetTopColor, nightTopColor, normalizedCycle);
        bottomColor = interpolateColor(sunsetBottomColor, nightBottomColor, normalizedCycle);
    }
    
    skyGradient.addColorStop(0, topColor);
    skyGradient.addColorStop(1, bottomColor);
    
    // Fill with gradient
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw stars at night
    if (dayNightCycle > 0.6) {
        const starOpacity = Math.min(1, (dayNightCycle - 0.6) * 2.5);
        drawStars(starOpacity);
    }
    
    // Draw clouds with opacity based on day/night cycle
    const cloudOpacity = 1 - (dayNightCycle * 0.7); // Clouds fade out at night
    drawClouds(cloudOpacity);
}

// Draw stars in the night sky
function drawStars(opacity) {
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    
    // Use a fixed seed for consistent star positions
    const starPositions = [
        { x: 50, y: 50 },
        { x: 150, y: 80 },
        { x: 250, y: 30 },
        { x: 350, y: 70 },
        { x: 450, y: 40 },
        { x: 550, y: 90 },
        { x: 120, y: 120 },
        { x: 220, y: 150 },
        { x: 320, y: 100 },
        { x: 420, y: 130 },
        { x: 520, y: 110 },
        { x: 80, y: 200 },
        { x: 180, y: 180 },
        { x: 280, y: 220 },
        { x: 380, y: 170 },
        { x: 480, y: 210 },
        { x: 580, y: 190 }
    ];
    
    // Draw each star
    for (const star of starPositions) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 1 + Math.random(), 0, Math.PI * 2);
        ctx.fill();
    }
}

// Helper function to interpolate between two colors
function interpolateColor(color1, color2, factor) {
    // Convert hex to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Interpolate
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    // Convert back to hex
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

// Helper function to lighten a color
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Draw clouds in the background with parallax effect
function drawClouds(opacity = 1) {
    // Draw clouds from each parallax layer
    for (const layer of backgroundLayers) {
        // Use a lighter version of the background color for clouds with opacity
        const cloudColor = lightenColor(colors.background, 40);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        
        // Draw each cloud in this layer
        for (const cloud of layer.clouds) {
            drawCloud(cloud.x, cloud.y, cloud.size);
        }
    }
}

// Draw a single cloud
function drawCloud(x, y, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size, size);
    
    // Draw cloud using multiple circles
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.arc(25, -10, 25, 0, Math.PI * 2);
    ctx.arc(45, 0, 20, 0, Math.PI * 2);
    ctx.arc(25, 10, 25, 0, Math.PI * 2);
    ctx.arc(-25, 0, 25, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

// Draw ground
function drawGround() {
    // Create gradient for ground
    const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - GROUND_HEIGHT, 0, CANVAS_HEIGHT);
    groundGradient.addColorStop(0, colors.groundLine);
    groundGradient.addColorStop(0.1, colors.ground);
    groundGradient.addColorStop(1, colors.ground);
    
    // Draw ground with gradient
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw ground top line
    ctx.fillStyle = colors.groundLine;
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, 5);
    
    // Draw some ground details (small bumps) with parallax scrolling
    ctx.fillStyle = colors.groundLine;
    
    // Use groundOffset for parallax scrolling
    for (let i = -80; i < CANVAS_WIDTH + 80; i += 80) {
        const x = (i + groundOffset) % CANVAS_WIDTH;
        
        // Draw small bumps
        ctx.beginPath();
        ctx.arc(x + 20, CANVAS_HEIGHT - GROUND_HEIGHT + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x + 50, CANVAS_HEIGHT - GROUND_HEIGHT + 25, 8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw bird
function drawBird() {
    ctx.save();
    
    // Translate to bird position (center of rotation)
    ctx.translate(bird.x + bird.width / 2, bird.y + bird.height / 2);
    
    // Rotate bird based on velocity
    ctx.rotate(bird.rotation);
    
    // Draw bird body with rounded corners for smoother look
    ctx.fillStyle = colors.bird;
    const radius = 10;
    
    // Draw rounded rectangle for bird body
    ctx.beginPath();
    ctx.moveTo(-bird.width / 2 + radius, -bird.height / 2);
    ctx.lineTo(-bird.width / 2 + bird.width - radius, -bird.height / 2);
    ctx.quadraticCurveTo(-bird.width / 2 + bird.width, -bird.height / 2, -bird.width / 2 + bird.width, -bird.height / 2 + radius);
    ctx.lineTo(-bird.width / 2 + bird.width, -bird.height / 2 + bird.height - radius);
    ctx.quadraticCurveTo(-bird.width / 2 + bird.width, -bird.height / 2 + bird.height, -bird.width / 2 + bird.width - radius, -bird.height / 2 + bird.height);
    ctx.lineTo(-bird.width / 2 + radius, -bird.height / 2 + bird.height);
    ctx.quadraticCurveTo(-bird.width / 2, -bird.height / 2 + bird.height, -bird.width / 2, -bird.height / 2 + bird.height - radius);
    ctx.lineTo(-bird.width / 2, -bird.height / 2 + radius);
    ctx.quadraticCurveTo(-bird.width / 2, -bird.height / 2, -bird.width / 2 + radius, -bird.height / 2);
    ctx.closePath();
    ctx.fill();
    
    // Draw bird details
    ctx.fillStyle = colors.birdEye;
    ctx.beginPath();
    ctx.arc(-bird.width / 2 + 48, -bird.height / 2 + 16, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = colors.birdPupil;
    ctx.beginPath();
    ctx.arc(-bird.width / 2 + 50, -bird.height / 2 + 16, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw beak
    ctx.fillStyle = colors.birdBeak;
    ctx.beginPath();
    ctx.moveTo(-bird.width / 2 + 60, -bird.height / 2 + 24);
    ctx.lineTo(-bird.width / 2 + 68, -bird.height / 2 + 20);
    ctx.lineTo(-bird.width / 2 + 68, -bird.height / 2 + 28);
    ctx.closePath();
    ctx.fill();
    
    // Draw wing
    ctx.fillStyle = colors.birdWing;
    if (bird.frame === 0) {
        ctx.beginPath();
        ctx.ellipse(-bird.width / 2 + 20, -bird.height / 2 + 28, 16, 8, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (bird.frame === 1) {
        ctx.beginPath();
        ctx.ellipse(-bird.width / 2 + 20, -bird.height / 2 + 24, 16, 10, 0, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.ellipse(-bird.width / 2 + 20, -bird.height / 2 + 20, 16, 12, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

// Draw pipes
function drawPipes() {
    for (const pipe of pipes) {
        const capHeight = 20;  // Doubled size
        const capWidth = pipe.width + 8;  // Doubled size
        const radius = 10;  // Rounded corner radius
        
        // Draw top pipe
        ctx.fillStyle = colors.pipe;
        // Main pipe body
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight - radius);
        // Rounded bottom corners
        ctx.beginPath();
        ctx.moveTo(pipe.x, pipe.topHeight - radius);
        ctx.lineTo(pipe.x + pipe.width, pipe.topHeight - radius);
        ctx.quadraticCurveTo(pipe.x + pipe.width, pipe.topHeight, pipe.x + pipe.width - radius, pipe.topHeight);
        ctx.lineTo(pipe.x + radius, pipe.topHeight);
        ctx.quadraticCurveTo(pipe.x, pipe.topHeight, pipe.x, pipe.topHeight - radius);
        ctx.closePath();
        ctx.fill();
        
        // Draw pipe cap with rounded corners
        ctx.fillStyle = colors.pipeCap;
        ctx.beginPath();
        ctx.moveTo(pipe.x - 4 + radius, pipe.topHeight - capHeight);
        ctx.lineTo(pipe.x + capWidth - 4 - radius, pipe.topHeight - capHeight);
        ctx.quadraticCurveTo(pipe.x + capWidth - 4, pipe.topHeight - capHeight, pipe.x + capWidth - 4, pipe.topHeight - capHeight + radius);
        ctx.lineTo(pipe.x + capWidth - 4, pipe.topHeight);
        ctx.lineTo(pipe.x - 4, pipe.topHeight);
        ctx.lineTo(pipe.x - 4, pipe.topHeight - capHeight + radius);
        ctx.quadraticCurveTo(pipe.x - 4, pipe.topHeight - capHeight, pipe.x - 4 + radius, pipe.topHeight - capHeight);
        ctx.closePath();
        ctx.fill();
        
        // Draw bottom pipe
        ctx.fillStyle = colors.pipe;
        // Main pipe body
        ctx.fillRect(pipe.x, pipe.bottomY + radius, pipe.width, CANVAS_HEIGHT - pipe.bottomY - GROUND_HEIGHT - radius);
        // Rounded top corners
        ctx.beginPath();
        ctx.moveTo(pipe.x, pipe.bottomY + radius);
        ctx.lineTo(pipe.x + pipe.width, pipe.bottomY + radius);
        ctx.quadraticCurveTo(pipe.x + pipe.width, pipe.bottomY, pipe.x + pipe.width - radius, pipe.bottomY);
        ctx.lineTo(pipe.x + radius, pipe.bottomY);
        ctx.quadraticCurveTo(pipe.x, pipe.bottomY, pipe.x, pipe.bottomY + radius);
        ctx.closePath();
        ctx.fill();
        
        // Draw pipe cap with rounded corners
        ctx.fillStyle = colors.pipeCap;
        ctx.beginPath();
        ctx.moveTo(pipe.x - 4 + radius, pipe.bottomY);
        ctx.lineTo(pipe.x + capWidth - 4 - radius, pipe.bottomY);
        ctx.quadraticCurveTo(pipe.x + capWidth - 4, pipe.bottomY, pipe.x + capWidth - 4, pipe.bottomY + radius);
        ctx.lineTo(pipe.x + capWidth - 4, pipe.bottomY + capHeight);
        ctx.lineTo(pipe.x - 4, pipe.bottomY + capHeight);
        ctx.lineTo(pipe.x - 4, pipe.bottomY + radius);
        ctx.quadraticCurveTo(pipe.x - 4, pipe.bottomY, pipe.x - 4 + radius, pipe.bottomY);
        ctx.closePath();
        ctx.fill();
    }
}

// Function to get a random color scheme
function getRandomColorScheme() {
    return Math.floor(Math.random() * colorSchemes.length);
}

// Draw score
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;  // Thicker outline for higher resolution
    ctx.font = '48px Arial';  // Larger font for higher resolution
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Add shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    
    // Draw current score
    ctx.strokeText(score, CANVAS_WIDTH / 2, 40);
    ctx.fillText(score, CANVAS_WIDTH / 2, 40);
    
    // Draw high score
    ctx.font = '32px Arial';  // Larger font for higher resolution
    ctx.strokeText('Best: ' + highScore, CANVAS_WIDTH / 2, 100);
    ctx.fillText('Best: ' + highScore, CANVAS_WIDTH / 2, 100);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
}

// Draw game over message
function drawGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
}

// Initialize the game when the page loads
window.addEventListener('load', init);