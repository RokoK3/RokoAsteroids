document.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById('gameCanvas');
    var ctx = canvas.getContext('2d');
    var startButton = document.getElementById('startButton');
    var gameInterval, asteroidInterval;
    var gameActive = false;
    // Canvas preko cijelog ekrana
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var startTime, endTime;
    var bestTime = localStorage.getItem('bestTime') || 0; //Najbolje vrijeme ili 0 ako ne postoji

    // Formatiraj vrijeme u format mm:ss.msmsms
    function formatTime(milliseconds) {
        var totalSeconds = milliseconds / 1000;
        var minutes = Math.floor(totalSeconds / 60);
        var seconds = Math.floor(totalSeconds % 60);
        var milliseconds = Math.floor((totalSeconds % 1) * 1000);
        return minutes.toString().padStart(2, '0') + ':' +
               seconds.toString().padStart(2, '0') + '.' +
               milliseconds.toString().padStart(3, '0');
    }
    // Ažuriraj timer
    function updateTimer() {
        var currentTime = formatTime(Date.now() - startTime);
        ctx.font = '18px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'right';
        ctx.fillText('Vrijeme: ' + currentTime, canvas.width - 10, 30);
        ctx.fillText('Najbolje vrijeme: ' + formatTime(bestTime), canvas.width - 10, 60);
    }

    function checkCollision() {
        for (var i = 0; i < asteroids.length; i++) {
            var a = asteroids[i];
            if (player.x < a.x + a.width && 
                player.x + player.width > a.x &&
                player.y < a.y + a.height &&
                player.y + player.height > a.y) // Ako je došlo do kolizije
                {
                endTime = Date.now();
                var elapsed = endTime - startTime;
                if (elapsed > bestTime) {
                    bestTime = elapsed;
                    localStorage.setItem('bestTime', bestTime); // Ažuriraj najbolje vrijeme
                }
                clearInterval(gameInterval);
                clearInterval(asteroidInterval);
                gameActive = false; // Zaustavi igru
                startButton.style.display = 'block'; // Ponoovo prikaži gumb za početak
                return true;
            }
        }
        return false;
    }

    // Dizajn igrača
    var player = {
        x: canvas.width / 2 - 25,
        y: canvas.height / 2 - 25,
        width: 40,
        height: 40,
        color: 'red',
        borderColor: 'black',
        borderWidth: 5,
        speed: 6 
    };
    // Nacrta igrača
    function drawPlayer() { 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.shadowColor = "black";
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        ctx.shadowColor = 'transparent';

        ctx.strokeRect(player.x, player.y, player.width, player.height);
    }

    // Dizajn asteroida
    function drawAsteroids() {
        asteroids.forEach(function(asteroid) {
            ctx.shadowBlur = asteroid.shadowBlur;
            ctx.shadowColor = asteroid.shadowColor;
            ctx.fillStyle = asteroid.color;
            ctx.fillRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
            ctx.shadowColor = 'transparent';
            ctx.strokeRect(asteroid.x, asteroid.y, asteroid.width, asteroid.height);
        });
    }

    var keys = {
        right: false,
        left: false,
        up: false,
        down: false
    };

    var asteroids = [];
    function createAsteroid() {
        var size = Math.random() * 100 + 40; // Veličina asteroida između 40 i 140
        var asteroid = {
            x: Math.random() < 0.5 ? -size : canvas.width + size, 
            y: Math.random() < 0.5 ? -size : canvas.height + size, // Pozicija izvan ekrana sa koje asteroid kreće
            width: size,
            height: size,
            color: 'grey',
            borderColor: 'black',
            borderWidth: 3,
            speedX: (Math.random() - 0.5) * 20, 
            speedY: (Math.random() - 0.5) * 20, 
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
        };
        asteroids.push(asteroid);
    }

    function updateAsteroids() {
        asteroids.forEach(function(asteroid) {
            asteroid.x += asteroid.speedX;
            asteroid.y += asteroid.speedY;
        });
    }


    // Pomicanje igrača
    function updatePlayerPosition() {
        if (keys.right && player.x + player.width < canvas.width) player.x += player.speed;
        if (keys.left && player.x > 0) player.x -= player.speed;
        if (keys.up && player.y > 0) player.y -= player.speed;
        if (keys.down && player.y + player.height < canvas.height) player.y += player.speed;
    }

    // Event listeneri za tipke
    document.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowRight') keys.right = true;
        if (event.key === 'ArrowLeft') keys.left = true;
        if (event.key === 'ArrowUp') keys.up = true;
        if (event.key === 'ArrowDown') keys.down = true;
    });

    document.addEventListener('keyup', function(event) {
        if (event.key === 'ArrowRight') keys.right = false;
        if (event.key === 'ArrowLeft') keys.left = false;
        if (event.key === 'ArrowUp') keys.up = false;
        if (event.key === 'ArrowDown') keys.down = false;
    });

    function updateGame() {
        if (gameActive) {
            drawPlayer();
            updatePlayerPosition(); // Pomiči igrača
            drawAsteroids(); // Nacrtaj asteroide
            updateAsteroids(); //  Dodaj nove asteroide
            updateTimer(); // Ažuriraj timer
            if (checkCollision()) {  
                return; // Završi igru ako je došlo do kolizije
            }
        }
    }

    // Pokreni igru
    startButton.addEventListener('click', function() {
        startButton.style.display = 'none'; // Sakrij gumb za početak
        asteroids = []; // Reset asteroida
        player.x = canvas.width / 2 - 25; // Reset pozicije igrača
        player.y = canvas.height / 2 - 25;
    
        // Reset gumbova
        keys = { right: false, left: false, up: false, down: false };
    
        // Početni asteroidi
        for (let i = 0; i < 20; i++) {
            createAsteroid();
        }
        startTime = Date.now();
        gameActive = true;
        gameInterval = setInterval(updateGame, 10); // Ažuriraj igru svakih 10 ms
        asteroidInterval = setInterval(createAsteroid, 100);  // Dodaj nove asteroide svakih 100 ms
    });
});

