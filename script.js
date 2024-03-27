window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 720;
    let enemies = [];
    let score = 0;
    let gameOver = false;
    let collisionDiffFactor = 25;
    const fullscreenButton = document.getElementById('fullscreenButton');

    class InputHandler {
        constructor() {
            this.keys = [];
            this.touchY = '';
            this.touchThreshold = 30;
            // Keyboard Events
            window.addEventListener('keydown', e => { // ES6 arrow functions don't bind 'this', but they inherit 'this' fom their parent scope - called 'lexical scoping'
                if ((
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                ) &&
                    (this.keys.indexOf(e.key) === -1)) { // This condition returns true only if the e.key is not already inside the this.keys array
                    this.keys.push(e.key);
                } else if (e.key === 'Enter' && gameOver) {
                    restartGame();
                };
                // console.log(e.key, this.keys);
            });
            window.addEventListener('keyup', e => { // ES6 arrow functions don't bind 'this', but they inherit 'this' fom their parent scope - called 'lexical scoping'
                if (
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight'
                ) {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
                // console.log(e.key, this.keys);
            });

            // Touch Events
            window.addEventListener('touchstart', e => {
                // console.log('start');
                this.touchY = e.changedTouches[0].pageY;
            });
            window.addEventListener('touchmove', e => {
                const swipeDistance = e.changedTouches[0].pageY - this.touchY;
                if ((swipeDistance < (-this.touchThreshold)) && (this.keys.indexOf('swipe up') === -1)) {
                    this.keys.push('swipe up');
                } else if ((swipeDistance > this.touchThreshold) && (this.keys.indexOf('swipe down') === -1)) {
                    this.keys.push('swipe down');
                    if (gameOver) {
                        restartGame();
                    }
                }
            });
            window.addEventListener('touchend', e => {
                this.keys.splice(this.keys.indexOf('swipe up'), 1);
                this.keys.splice(this.keys.indexOf('swipe down'), 1)
            });
        }
    };

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = (this.gameWidth * 0.5) - (this.width * 0.5) - 100;
            this.y = (this.gameHeight - this.height) - 50;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.frameY = 0;
            this.speedX = 0;
            this.speedY = 0;
            this.weight = 0.6;
        }

        draw(context) {
            // context.fillStyle = 'white';
            // context.fillRect(this.x, this.y, this.width, this.height);
            // Temp Circle
            // context.strokeStyle = 'white';
            // context.beginPath();
            // context.arc(this.x + this.width / 2, this.y + this.height / 2, ((this.width / 2) - collisionDiffFactor), 0, Math.PI * 2);
            // context.stroke();
            context.drawImage(this.image, (this.frameX * this.spriteWidth), (this.frameY * this.spriteHeight),
                this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
        }

        update(input, deltaTime, enemies) {
            // Collision Detection
            enemies.forEach(enemy => {
                const dx = ((enemy.x + (enemy.width * 0.5) - collisionDiffFactor) - (this.x + (this.width * 0.5) - collisionDiffFactor));
                const dy = ((enemy.y + (enemy.height * 0.5) - collisionDiffFactor) - (this.y + (this.height * 0.5) - collisionDiffFactor));
                let distance = Math.sqrt((dx * dx) + (dy * dy));
                let sumOfRadii = (((enemy.width * 0.5) - collisionDiffFactor) + ((this.width * 0.5) - collisionDiffFactor));

                if (distance < sumOfRadii) {
                    gameOver = true;
                }

            })
            // Sprite Animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) {
                    this.frameX = 0;
                } else {
                    this.frameX++;
                };
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // Controls
            // horizontal movement
            if (input.keys.indexOf('ArrowRight') > (-1)) {
                this.speedX = 5;
            } else if (input.keys.indexOf('ArrowLeft') > (-1)) {
                this.speedX = -5;
            } else {
                this.speedX = 0;
            }
            this.x += this.speedX;
            if (this.x < 0) {
                this.x = 0;
            };
            if (this.x > (this.gameWidth - this.width)) {
                this.x = (this.gameWidth - this.width);
            };

            // vertical movement
            if (((input.keys.indexOf('ArrowUp') > (-1) ||
                input.keys.indexOf('swipe up') > (-1)) &&
                this.onGround())) {
                this.speedY = -20;
            } else if (
                (input.keys.indexOf('ArrowDown') > (-1) ||
                    input.keys.indexOf('swipe down') > (-1))
            ) {
                this.speedY = 20;
            } else {
                if (this.onGround()) {
                    this.speedY = 0
                    this.maxFrame = 8;
                    this.frameY = 0;
                } else {
                    this.frameY = 1;
                    this.maxFrame = 5;
                    this.speedY += this.weight;
                };
            }
            this.y += this.speedY;
            if (this.y < 0) {
                this.y = 0;
            };
            if (this.y > (this.gameHeight - this.height)) {
                this.y = (this.gameHeight - this.height);
            };
        }

        onGround() {
            return this.y >= (this.gameHeight - this.height); // Returns true if the player is on the ground
        };

        restart() {
            this.x = (this.gameWidth * 0.5) - (this.width * 0.5) - 100;
            this.y = (this.gameHeight - this.height) - 50;
            this.maxFrame = 8;
            this.frameY = 0;
        }

    };

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 5;
        }

        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, (this.x + this.width - this.speed), this.y, this.width, this.height);
        }

        update() {
            this.x -= this.speed;
            if (this.x < (0 - this.width)) this.x = 0;
        };

        restart() {
            this.x = 0;
        }

    };

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.spriteWidth = 160;
            this.spriteHeight = 119;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = Math.random() * 7 + 7;
            this.markedForDeletion = 0;
        }

        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) {
                    this.frameX = 0
                } else {
                    this.frameX++;
                }
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < (0 - this.width)) {
                this.markedForDeletion = true;
                // Increment score by 1 if the player has successfully avoided collision with enemy
                score++;
            }
        }

        draw(context) {
            // Temp Circle
            // context.strokeStyle = 'white';
            // context.beginPath();
            // context.arc(this.x + this.width / 2, this.y + this.height / 2, ((this.width / 2) - collisionDiffFactor), 0, Math.PI * 2);
            // context.stroke();
            context.drawImage(this.image, (this.frameX * this.spriteWidth), 0, this.spriteWidth, this.spriteHeight,
                this.x, this.y, this.width, this.height);
        }

    };

    function toggleFullscreen() {
        // fullscreenElement returns null if not in full screen mode
        if (!document.fullscreenElement) { // Note that requestFullscreen method is called on the element you wish to full screen but fullscreenElement sits in the document object
            canvas.requestFullscreen()
                // .then() // Skipping then for this game
                .catch(err => {
                    alert(`Error, can't enable fullscreen mode: ${err.message}`);
                });
        } else {
            document.exitFullscreen(); // Note that exitFullscreen method also sits inside the document object
        }
    }

    fullscreenButton.addEventListener('click', toggleFullscreen);

    function handleEnemies(context, deltaTime) {
        let randomEnemyInterval = (Math.random() * 20000);
        if (enemyTimer > (enemyInterval + randomEnemyInterval)) {
            enemies.push(new Enemy(canvas.width, canvas.height));
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        };
        enemies.forEach(enemy => {
            enemy.update(deltaTime);
            enemy.draw(context);
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion);
    };

    function displayStatusText(context) {
        context.textAlign = 'left';
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50);
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52);
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('GAME OVER, try again!', (canvas.width * 0.5), (canvas.height * 0.5));
            context.fillText('Your Score: ' + score, (canvas.width * 0.5), (canvas.height * 0.5) + 50);
            context.fillText('Hit Enter or swipe down to restart', (canvas.width * 0.5), (canvas.height * 0.5) + 100);
            context.fillStyle = 'white';
            context.fillText('GAME OVER, try again!', ((canvas.width * 0.5) + 2), ((canvas.height * 0.5) + 2));
            context.fillText('Your Score: ' + score, ((canvas.width * 0.5) + 2), ((canvas.height * 0.5) + 52));
            context.fillText('Hit Enter or swipe down to restart', ((canvas.width * 0.5) + 2), ((canvas.height * 0.5) + 102));
        }
    };

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 700;

    function restartGame() {
        player.restart();
        background.restart();
        enemies = [];
        score = 0;
        gameOver = false;
        animate(timestamp = 0);
    };

    function animate(timestamp) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.update();
        background.draw(ctx);
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(ctx, deltaTime);
        displayStatusText(ctx);
        if (!gameOver) {
            requestAnimationFrame(animate);
        } else {

        }
    };

    animate(timestamp = 0);
})