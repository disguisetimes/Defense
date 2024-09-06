import { Vec } from './Vector.js';
import { Mat } from './Matrix.js';

const canvas = document.getElementById("canvasId");
const ctx = canvas.getContext("2d");
const cvWidth = canvas.width;
const cvHeight = canvas.height;
const canvasSize = new Vec(canvas.width, canvas.height);
const halfCanvasSize = canvasSize.Mul(0.5);

const game = {
    gameOver: false    
};

const player = {
    position: new Vec(0, 0),
    halfSize: new Vec(5, 5),
    color: new Vec(1.0, 0.0, 0.0, 1.0),
    burstActive: false,
    ringOfFire: false,
    health: 100,
    score: 0,
    mana: 100
};

let bullets = [];
let debry = [];
let zombies = [];
let ringOfFires = [];

const manaRegenWait = 0.15;
let manaRegenCountdown = 0;
const maxNumberOfZombies = 10;
const zombieSpawnWait = 1;
let zombieSpawnCountdown = 0;

function DegreesToRadians(degrees) { return degrees * Math.PI / 180; }

document.body.addEventListener('click', (event) => {
    if (event.button === 0) /*Left Mouse Click*/ {
        const direction = new Vec(event.clientX, event.clientY).Sub(halfCanvasSize).Normalize();        
        bullets.push({
            position: player.position,
            halfSize: new Vec(2, 2),
            color: new Vec(0.0, 0.0, 0.0, 1.0),
            timeLeft: 1.5,
            direction: direction,
            speed: 240,
            damage: 25
        });   
        if (player.burstActive && player.mana > 5) {
            player.mana -= 5;
            const theta = DegreesToRadians(10);
            const ccw = direction.Rotate2D(theta);
            const cw = direction.Rotate2D(-theta);
            bullets.push({
                position: player.position,
                halfSize: new Vec(2, 2),
                color: new Vec(0.0, 0.0, 0.0, 1.0),
                timeLeft: 1.5,
                direction: ccw,
                speed: 100,
                damage: 25
            });
            bullets.push({
                position: player.position,
                halfSize: new Vec(2, 2),
                color: new Vec(0.0, 0.0, 0.0, 1.0),
                timeLeft: 1.5,
                direction: cw,
                speed: 100,
                damage: 25
            });
        }
    }
});

let spaceFirstPress = false;

document.body.addEventListener('keyup', function(e) {
    if (e.keyCode == 32/*space*/){
        spaceFirstPress = false
    }
});

document.body.addEventListener('keydown', function(e) {
    console.log(e.keyCode);
    if (e.keyCode == 69/*E*/) {
        //ringOfFires.push({
        //    speed: 50,
        //    
        //});
    }
    if (e.keyCode == 32/*space*/) {
        if (!spaceFirstPress) {
            spaceFirstPress = true;
            player.burstActive = !player.burstActive;
            //if (!player.burstActive && !player.flameThrowActive) {
            //    player.burstActive = true;
            //}
            //else if (player.burstActive) {
            //    player.burstActive = false;
            //    player.flameThrowActive = true;
            //}
            //else {
            //    player.flameThrowActive = false;
            //}
        }
        else {
            spaceFirstPress = false;
        }
    }
});

function PutPixel(position, color) {
    ctx.fillStyle = "rgba("+color[0]*255+","+color[1]*255+","+color[2]*255+","+color[3]+")";
    ctx.fillRect(position[0], position[1], 1, 1);
}

function DrawRect(position, halfSize, color) {
    ctx.beginPath();
    ctx.fillStyle = "rgba("+color[0]*255+","+color[1]*255+","+color[2]*255+","+color[3]+")";
    const topLeftPosition = position.Sub(halfSize);
    const size = halfSize.Mul(2);
    ctx.rect(topLeftPosition[0], topLeftPosition[1], size[0], size[1]);
    ctx.fill();
}

function DrawRectWorld(worldPosition, halfSize, color) {
    DrawRect(worldPosition.Sub(player.position).Add(halfCanvasSize), halfSize, color);
}

function DrawEntity(entity) { DrawRectWorld(entity.position, entity.halfSize, entity.color); }

function UpdateGame(deltaTime) {
    
    manaRegenCountdown -= deltaTime;
    if (manaRegenCountdown <= 0 && player.mana < 100) {
        manaRegenCountdown = manaRegenWait;
        ++player.mana;
    }
    
    zombieSpawnCountdown -= deltaTime;
    if (zombieSpawnCountdown <= 0 && zombies.length < maxNumberOfZombies) {
        zombieSpawnCountdown = zombieSpawnWait;
        
        const theta = Math.random() * Math.PI * 2;
        const radius = Math.random() * (300 - 200) + 200;
        const fastZombie = Math.random() > 0.9;
        zombies.push({
            position: player.position.Add(new Vec(1, 0).Rotate2D(theta).Mul(radius)),
            halfSize: new Vec(5, 5),
            color: fastZombie ? new Vec(0.0, 0.0, 1.0, 1.0) : new Vec(0.0, 1.0, 0.0, 1.0),
            speed: fastZombie ? 100 : Math.random() * (50 - 30) + 30,
            health: 100
        });
    }
    
    for (let i = 0; i < zombies.length; ++i) {
        const zombie = zombies[i];
        zombie.position = zombie.position.Add(player.position.Sub(zombie.position).Normalize().Mul(deltaTime * zombie.speed));
        if (zombie.position.Distance(player.position) <= zombie.halfSize[0] + player.halfSize[0]) {
            zombies.splice(i, 1);
            --i;
            player.health -= 10;
            if (player.health <= 0) {
                game.gameOver = true;
            }
        }
    }
    
    for (let i = 0; i < bullets.length; ++i) {
        const bullet = bullets[i];
        bullet.position = bullet.position.Add(bullet.direction.Mul(bullet.speed * deltaTime));
        bullet.timeLeft -= deltaTime;
        if (bullet.timeLeft <= 0) {
            bullets.splice(i, 1);
            --i;
        }
        else {
            for (let iZ = 0; iZ < zombies.length; ++iZ) {
                const zombie = zombies[iZ];                 
                if (bullet.position.Distance(zombie.position) <= bullet.halfSize[0] + zombie.halfSize[0]) {
                
                    zombie.health -= bullet.damage;
                    bullets.splice(i, 1);
                    --i;
                    
                    if (zombie.health <= 0) {
                        player.score += 10;
                        zombies.splice(iZ, 1);
                        --iZ;
                    }
                    
                    break;
                }
            }
        }
    }
}

function DrawGame(deltaTime) {
    ctx.clearRect(0, 0, cvWidth, cvHeight);
    DrawRect(halfCanvasSize, halfCanvasSize, new Vec(0.0, 0.0, 1.0, 0.03));
    for (const bullet of bullets) {
        DrawEntity(bullet);
    }
    for (const zombie of zombies) {
        DrawEntity(zombie);
    }
    DrawEntity(player);
}

function DrawText(text, position, color, font) {
    if (!font) {
        ctx.font = '24px serif';
    }
    else {
        ctx.font = font;
    }
    ctx.fillStyle = "rgba("+color[0]*255+","+color[1]*255+","+color[2]*255+","+color[3]+")";
    ctx.fillText(text, position[0], position[1]);
}

function DrawUserInterface(deltaTime) {
    DrawText(player.health.toString(), new Vec(5, 25),
        player.health > 75 ? new Vec(0, 1, 0, 1) :
        player.health > 50 ? new Vec(0.8, 0.9, 0.2, 1) :
        player.health > 25 ? new Vec(1, .75, 0, 1) : new Vec(1, 0, 0, 1),
        '20px sans-serif');
    DrawText(player.score.toString(), new Vec(5, 50), new Vec(1, 0.5, 1, 1), '20px sans-serif');
    DrawText(player.mana.toString(), new Vec(5, 75), new Vec(0, 0, 1, 1), '20px sans-serif');
    if (game.gameOver) {
        DrawText('Game Over :D', new Vec(50, 200), new Vec(1, 0, 0, 1), '30px sans-serif');
    }
}

let lastTime = 0;
function renderLoop(currentTime) {
    currentTime *= 0.001;
    const deltaTime = currentTime - lastTime;
    if (!game.gameOver) {
        UpdateGame(deltaTime);
    }    
    DrawGame(deltaTime);
    DrawUserInterface(deltaTime);
    lastTime = currentTime;
    requestAnimationFrame(renderLoop);
}

requestAnimationFrame(renderLoop);