const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const gravity = 0.6;
let gameOver = false;

// Load images
const backgroundImage = new Image();
backgroundImage.src = 'background.png';

const playerRightImage = new Image();
playerRightImage.src = 'player right.png';

const playerLeftImage = new Image();
playerLeftImage.src = 'player left.png';

const enemyRightImage = new Image();
enemyRightImage.src = 'enemy right.png';

const enemyLeftImage = new Image();
enemyLeftImage.src = 'enemy left.png';

const bulletImage = new Image();
bulletImage.src = 'bullet.gif';

const tileImage = new Image();
tileImage.src = 'tile.png';
let tilePattern;

tileImage.onload = () => {
    tilePattern = ctx.createPattern(tileImage, 'repeat');
};

// Player
const player = {
    name: 'Mushmush',
    x: 100,
    y: canvasHeight - 160, // Adjusted for ground
    width: 140,
    height: 110,
    health: 100,
    speed: 5,
    velocityY: 0,
    isJumping: false,
    onPlatform: false,
    direction: 'right'
};

// Enemy
const enemy = {
    name: 'Groooooom',
    x: canvasWidth - 150,
    y: canvasHeight - 125, // Adjusted for ground
    width: 100,
    height: 75,
    health: 100,
    speed: 1,
    direction: 'left',
    shootCooldown: 120, // 2 seconds
    velocityY: 0,
    isJumping: false,
    onPlatform: false
};

// Bullets
const bullets = [];
const enemyBullets = [];

// Platforms
const platforms = [
    { x: 0, y: canvasHeight - 50, width: canvasWidth, height: 50 }, // Ground
    { x: canvasWidth / 2 - 150, y: canvasHeight - 250, width: 300, height: 40 } // Middle platform
];

// Keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'KeyW' && !player.isJumping) {
        player.velocityY = -16;
        player.isJumping = true;
        player.onPlatform = false;
    }
    if (e.code === 'Space') {
        shootBullet();
    }
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });

function shootBullet() {
    bullets.push({
        x: player.x + (player.direction === 'right' ? player.width - 20 : 0),
        y: player.y + player.height / 2 - 10,
        width: 20,
        height: 20,
        speed: 7,
        direction: player.direction
    });
}

function enemyShoot() {
    enemyBullets.push({
        x: enemy.x + (enemy.direction === 'right' ? enemy.width : 0),
        y: enemy.y + enemy.height / 2,
        width: 15,
        height: 8,
        speed: 5,
        direction: enemy.direction
    });
}

function drawPlayer() {
    const currentImage = player.direction === 'right' ? playerRightImage : playerLeftImage;
    ctx.drawImage(currentImage, player.x, player.y, player.width, player.height);
}

function drawEnemy() {
    const currentImage = enemy.direction === 'right' ? enemyRightImage : enemyLeftImage;
    ctx.drawImage(currentImage, enemy.x, enemy.y, enemy.width, enemy.height);
}

function update() {
    if (gameOver) return;

    // Player movement
    if (keys['KeyA']) {
        player.x -= player.speed;
        player.direction = 'left';
    }
    if (keys['KeyD']) {
        player.x += player.speed;
        player.direction = 'right';
    }

    // Player gravity and platform collision
    player.y += player.velocityY;
    if (!player.onPlatform) {
        player.velocityY += gravity;
    }

    player.onPlatform = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + player.velocityY + 1) {
            player.velocityY = 0;
            player.isJumping = false;
            player.y = platform.y - player.height;
            player.onPlatform = true;
        }
    });

    // Enemy gravity and platform collision
    enemy.y += enemy.velocityY;
    if (!enemy.onPlatform) {
        enemy.velocityY += gravity;
    }

    enemy.onPlatform = false;
    platforms.forEach(platform => {
        if (enemy.x < platform.x + platform.width &&
            enemy.x + enemy.width > platform.x &&
            enemy.y + enemy.height > platform.y &&
            enemy.y + enemy.height < platform.y + enemy.velocityY + 1) {
            enemy.velocityY = 0;
            enemy.isJumping = false;
            enemy.y = platform.y - enemy.height;
            enemy.onPlatform = true;
        }
    });

    // Enemy AI
    if (Math.abs(player.x - enemy.x) > 200) {
        if (enemy.x > player.x) {
            enemy.x -= enemy.speed;
            enemy.direction = 'left';
        } else {
            enemy.x += enemy.speed;
            enemy.direction = 'right';
        }
    } else {
        enemy.direction = (player.x > enemy.x) ? 'right' : 'left';
        if (enemy.shootCooldown <= 0) {
            enemyShoot();
            enemy.shootCooldown = Math.random() * 60 + 120; // Randomize shooting
        } else {
            enemy.shootCooldown--;
        }
    }

    // Update bullets
    bullets.forEach((bullet, index) => {
        bullet.x += (bullet.direction === 'right' ? bullet.speed : -bullet.speed);
        if (bullet.x > canvasWidth || bullet.x < 0) bullets.splice(index, 1);

        if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
            enemy.health -= 10;
            bullets.splice(index, 1);
            if (enemy.health <= 0) {
                gameOver = true;
                alert('You Win! Refresh to play again.');
            }
        }
    });

    // Update enemy bullets
    enemyBullets.forEach((bullet, index) => {
        bullet.x += (bullet.direction === 'right' ? bullet.speed : -bullet.speed);
        if (bullet.x > canvasWidth || bullet.x < 0) enemyBullets.splice(index, 1);

        if (bullet.x < player.x + player.width && bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height && bullet.y + bullet.height > player.y) {
            player.health -= 5;
            enemyBullets.splice(index, 1);
            if (player.health <= 0) {
                gameOver = true;
                alert('You Lose! Refresh to play again.');
            }
        }
    });
}

function drawPixelHealthBar(x, y, width, height, health, isPlayer = false) {
    const segmentWidth = 10;
    const segmentHeight = 20;
    const segments = Math.floor(width / segmentWidth);

    // Draw background/border
    ctx.fillStyle = '#333'; // Dark grey for border
    ctx.fillRect(x - 2, y - 2, width + 4, height + 4);
    ctx.fillStyle = isPlayer ? '#555' : '#111'; // Lighter grey for player's empty bar
    ctx.fillRect(x, y, width, height);

    // Draw health segments
    const healthSegments = Math.ceil((health / 100) * segments);
    ctx.fillStyle = health > 50 ? '#00FF00' : (health > 25 ? '#FFFF00' : '#FF0000');
    for (let i = 0; i < healthSegments; i++) {
        ctx.fillRect(x + i * segmentWidth, y, segmentWidth - 2, segmentHeight);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

    // Draw platforms using individual tiles
    platforms.forEach(platform => {
        const tileWidth = 40; // Assuming each tile is 40px wide
        const numTiles = Math.ceil(platform.width / tileWidth);
        for (let i = 0; i < numTiles; i++) {
            ctx.drawImage(tileImage, 
                platform.x + (i * tileWidth), 
                platform.y, 
                tileWidth, 
                platform.height
            );
        }
    });

    drawPlayer();
    drawEnemy();

    // Draw bullets
    bullets.forEach(b => ctx.drawImage(bulletImage, b.x, b.y, b.width, b.height));
    ctx.fillStyle = '#FF6347'; // Tomato color for enemy bullets
    enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));

    // UI - Health bars and names
    ctx.font = '20px "Press Start 2P", cursive'; // A good pixel font
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(player.name, 10, 30);
    drawPixelHealthBar(10, 40, 200, 20, player.health, true);

    ctx.textAlign = 'right';
    ctx.fillText(enemy.name, canvasWidth - 10, 30);
    drawPixelHealthBar(canvasWidth - 210, 40, 200, 20, enemy.health);
}

function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Wait for all images to load
let imagesLoaded = 0;
const totalImages = 6; // Added tileImage
[backgroundImage, playerLeftImage, playerRightImage, enemyLeftImage, enemyRightImage, bulletImage, tileImage].forEach(img => {
    img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
            if (tileImage.complete) { // Ensure tile pattern is created
                tilePattern = ctx.createPattern(tileImage, 'repeat');
            }
            gameLoop();
        }
    };
    img.onerror = () => console.error(`Failed to load ${img.src}`);
});

// Add a link to Google Fonts in your index.html for the pixel font
// <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">