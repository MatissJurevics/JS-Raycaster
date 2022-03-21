const screenWidth = window.innerWidth
const screenHeight = window.innerHeight

// creates a canvas element and sets its width and height to match the display port
const canvas = document.createElement('canvas')
canvas.setAttribute('width', screenWidth);
canvas.setAttribute('height', screenHeight);
document.body.appendChild(canvas)

// defining this before FOV as FOV relies on this function
const toRadians = (degree) => {
    return (degree * Math.PI) / 180
}

// setting important data neccesary for the function of the engine
// TICK :       The amount of time in milliseconds for a new frame to be created
// context :    the context of the canvas
// map :        this is a 2d array containing booleans that represent the presense
//              of a wall
// player :     This object contains information about the player on the map
const TICK = 30;
const context = canvas.getContext('2d');
const CELL_SIZE = 64;
const FOV = toRadians(60);
const map = [
    [1 , 1 , 1 , 1 , 1 , 1 , 1 , 1],
    [1 , 0 , 0 , 0 , 0 , 0 , 0 , 1],
    [1 , 0 , 1 , 0 , 0 , 0 , 0 , 1],
    [1 , 0 , 1 , 0 , 1 , 1 , 0 , 1],
    [1 , 0 , 0 , 0 , 1 , 0 , 0 , 1],
    [1 , 1 , 0 , 0 , 1 , 0 , 0 , 1],
    [1 , 0 , 0 , 0 , 0 , 0 , 0 , 1],
    [1 , 1 , 1 , 1 , 1 , 1 , 1 , 1],

]
const player = {
    x: CELL_SIZE*1.5,
    y: CELL_SIZE*2,
    angle: Math.PI / 2,
    speed: 0
}
const playerSize = 10;
const COLORS = {
    rays: '#dddd00'

}


// Defining all the functions used in the gameloop 
const clearScreen = () => {
    // sets display to red to make it clear the changes were made
    context.fillStyle = 'blue'
    context.fillRect(0, 0, screenWidth, screenHeight)
}
// This function is used for player movement
const movePlayer = () => {
    player.x += Math.cos(player.angle) * player.speed;
    player.y += Math.sin(player.angle) * player.speed;
}

const outOfBounds = (x,y) => {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length
}
const distance = (x1,y1,x2,y2) => {
    return Math.sqrt(Math.pow((x2-x1), 2) + Math.pow((y2-y1), 2))
}

const getVCollision = (ang) => {
    const right = Math.abs(Math.floor((ang - Math.PI / 2) / Math.PI) % 2);
    const firstX = right ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE : Math.floor(player.x / CELL_SIZE) * CELL_SIZE
    const firstY = player.y + (firstX - player.x) * Math.tan(ang)

    const xA = right ? CELL_SIZE : -CELL_SIZE;
    const yA = xA * Math.tan(ang)

    let wall;
    let nextX = firstX ;
    let nextY = firstY;

    while(!wall) {
        const cellX = right ? Math.floor(nextX / CELL_SIZE) : Math.floor(nextX / CELL_SIZE) - 1;
        const cellY =  Math.floor(nextY / CELL_SIZE);

        if (outOfBounds(cellX, cellY)) {
            wall = map[cellY][cellX]
            if(!wall) {
                nextX + xA;
                nextY + yA;
            }
        }
    }
    return{angle, distance: distance(player.x, player.y,nextX, nextY), vertical: true}
}

const castRay = (angle) => {
    const vCollision = getVCollision(angle);
    const hCollision = getHCollision(angle);
    return hCollision.distance >= vCollision.distance ? hCollision.distance : vCollision.distance;
}

const getRays = () => {
    let initialAngle = player.angle - FOV / 2;
    let numberOfRays = screenWidth;
    let angleStep  = FOV / numberOfRays;
    return Array.from({length: numberOfRays}, (_,i) => {
        const angle = initialAngle + i * angleStep;
        const ray = castRay(angle);
        return ray
    })
}
const renderScene = (rays) => {}
// This function renders the minimap containing the map data inserted above
// (I think the data is inserted above anyway lmao...)
const renderMinimap = (posX=0,posY=0,scale=0.75,rays) => {
    // sets the size of each cell on the mini map (both height and width)
    const cellSize = scale * CELL_SIZE;
    // loops throught the first set of arrays on the 2d array (the rows)
    // and labels each row as the cells y coordinate
    map.forEach((row, y) => {
        // loops throught the rows
        row.forEach((cell,x) => {
            // if there is a cell it will create a square 
            if (cell) {
                context.fillStyle = 'white';
                context.fillRect(posX + x*cellSize, posY + y*cellSize, cellSize, cellSize)
            }
        })
    })

    // Draws all of the rays coming from the rays object
    context.strokeStyle = COLORS.rays
    rays.forEach(ray => {
        context.beginPath();
        context.moveTo(posX + player.x * scale, posY + player.y * scale);
        context.lineTo(
            // This uses some basic triganoetry to determine what the x and y 
            // offset is based off of the angle using cosine and sine respectivly
            (player.x + Math.cos(ray.angle) * ray.distance) * scale,
            (player.y + Math.sin(ray.angle) * ray.distance) * scale,
        )
        context.closePath()
        context.stroke()
    })

    // Creates a player on the positions in the player object
    context.fillStyle = 'yellow';
    context.fillRect(
        posX + player.x * scale - playerSize/2,
        posY + player.y * scale - playerSize/2,
        playerSize,
        playerSize
    )
    // This creates a ray coming from the player at the angle specified 
    // in the player object.
    const rayLength = playerSize * 2;
    context.strokeStyle = 'yellow'
    context.beginPath()
    context.moveTo(posX + player.x * scale, posY + player.y * scale)
    context.lineTo(
        // This is the same as the one above:
        // This uses some basic triganoetry to determine what the x and y 
        // offset is based off of the angle using cosine and sine respectivly
        (player.x + Math.cos(player.angle) * rayLength) * scale,
        (player.y + Math.sin(player.angle) * rayLength) * scale,
    )
    context.closePath()
    context.stroke()
}

// The gameloop runs every function neccesary for the raycasting engine to 
// work. This will be set to run in the setInterval function once every 
// 30 milliseconds
const gameLoop = () => {
    clearScreen();
    movePlayer();
    const rays = getRays();
    renderScene(rays);
    renderMinimap(0,0, 0.5, rays)
}

// will run the game loop once every 30 milliseconds
setInterval(gameLoop,TICK)


document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp'){
        player.speed = 2
    };
    if (e.key === 'ArrowDown'){
        player.speed = -2
    }
})

document.addEventListener('keyup', e => {
    if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
        player.speed = 0
    }
})

document.addEventListener('mousemove', e => {
    player.angle += toRadians(e.movementX)
})