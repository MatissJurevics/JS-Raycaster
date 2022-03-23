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
const TICK = 45;
const context = canvas.getContext('2d');
const CELL_SIZE = 64;
const FOV = toRadians(80);
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]


]
const player = {
    x: CELL_SIZE*1.5,
    y: CELL_SIZE*2,
    angle: Math.PI / 2,
    speed: 0
}
const playerSize = 10;
const COLORS = {
    rays: '#dddd00', 
    wallDark: '#666666',
    wallDarkSecondary: '#555555',
    wallLight: '#888888',
    wallLightSecondary: '#777777',
    floor: '#f4a460',
    ceiling: '#44f'
}
const TEXTURE_RES = 16
const texture = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]


// Defining all the functions used in the gameloop 
const clearScreen = () => {
    // sets display to red to make it clear the changes were made
    context.fillStyle = 'lightblue'
    context.fillRect(0, 0, screenWidth, screenHeight)
}
// This function is used for player movement and collision detection
const movePlayer = () => {
    let futureX = Math.floor((player.x += Math.cos(player.angle) * player.speed) / CELL_SIZE + 0.1)
    let futureY = Math.floor((player.y += Math.sin(player.angle) * player.speed) / CELL_SIZE + 0.1)
    
    wall = map[futureY][futureX]

    if(wall === 0) {
        player.x += Math.cos(player.angle) * player.speed;
        player.y += Math.sin(player.angle) * player.speed;
    } else {
        player.x -= Math.cos(player.angle) * player.speed;
        player.y -= Math.sin(player.angle) * player.speed;
    }

}

const outOfBounds = (x,y) => {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}
const distance = (x1,y1,x2,y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

const getVCollision = (angle) => {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);
    const firstX = right 
        ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE 
        : Math.floor(player.x / CELL_SIZE) * CELL_SIZE

    const firstY = player.y + (firstX - player.x) * Math.tan(angle);

    const xA = right ? CELL_SIZE : -CELL_SIZE;
    const yA = xA * Math.tan(angle)

    let wall;
    let nextX = firstX ;
    let nextY = firstY;
    let cellX, cellY

    while(!wall) {
         cellX = right 
            ? Math.floor(nextX / CELL_SIZE) 
            : Math.floor(nextX / CELL_SIZE) - 1;

         cellY =  Math.floor(nextY / CELL_SIZE);

        if (outOfBounds(cellX, cellY)) {
            break;
        }
        wall = map[cellY][cellX]
        if(!wall) {
            nextX += xA;
            nextY += yA;
        } else {

        }
    }
    let mapcord
    if (wall) {
        mapcord = map[cellY][cellX]
    }
    const textureCol = Math.ceil(nextY % TEXTURE_RES) 
    return{
        angle, 
        distance: distance(player.x, player.y,nextX, nextY), 
        vertical: true,
        textureCol,
        mapcord,
    }
}
const getHCollision = (angle) => {
    // Determines whether the ray is heading up or down
    const up = Math.abs(Math.floor((angle / Math.PI)) % 2);
    const firstY = up 
        ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE 
        : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE ;

    const firstX = player.x + (firstY - player.y) / Math.tan(angle);

    const yA = up ? -CELL_SIZE : CELL_SIZE;
    const xA = yA / Math.tan(angle)

    let wall;
    let nextX = firstX ;
    let nextY = firstY;
    let cellX, cellY

    while(!wall) {
        cellY = up 
            ? Math.floor(nextY / CELL_SIZE) -1
            : Math.floor(nextY / CELL_SIZE) ;

        cellX =  Math.floor(nextX / CELL_SIZE);

        if (outOfBounds(cellX, cellY)) {
            break;
        }
        wall = map[cellY][cellX]
        if(!wall) {
            nextX += xA;
            nextY += yA;
        } else {

        }
    }
    let mapcord
    if (wall) {
        mapcord = map[cellY][cellX]
    }
    const textureCol = Math.ceil(nextX % TEXTURE_RES)
    return{
        angle, 
        distance: distance(player.x, player.y,nextX, nextY), 
        vertical: false,
        textureCol,
        mapcord,
    }
}



const castRay = (angle) => {
    const vCollision = getVCollision(angle);
    const hCollision = getHCollision(angle);
    
    return  hCollision . distance  >=  vCollision . distance  ?  vCollision  :  hCollision ; 
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

const fixFishEye = (distance, angle, playerAngle) => {
    const diff = angle - playerAngle;
    return distance * Math.cos(diff)
}

const renderTexture = (ray, i, wallHeight) => {
    let pixel = wallHeight / TEXTURE_RES // this might be kinda sketch
    let startY = (screenHeight/2)-wallHeight/2

    for (let j = 0; j < TEXTURE_RES; j++) {
        if (ray.vertical) {
            if (texture[j][ray.textureCol]) {
                context.fillStyle = COLORS.wallDarkSecondary 
            } else {
                context.fillStyle = COLORS.wallDark 
            }
         } else {
            if (texture[j][ray.textureCol]) {
                context.fillStyle = COLORS.wallLightSecondary 
            } else {
                context.fillStyle = COLORS.wallLight 
            }
         }
     
         context.fillRect(i,startY, 1, pixel);
         startY += pixel;
    }

}

const renderScene = (rays) => {
    rays.forEach((ray,i) => {
        const distance = fixFishEye(ray.distance, ray.angle, player.angle);
        const wallHeight = ((CELL_SIZE * 5) / distance) * 277  // arbitrary height, can be adjusted
        renderTexture(ray,i,wallHeight)

        // creates a floor
        context.fillStyle = COLORS.floor;
        context.fillRect(i,(screenHeight/2)+wallHeight/2,i,(screenHeight/2)-wallHeight/2)

        // creates a ceiling 
        context.fillStyle = COLORS.ceiling;
        context.fillRect(i,0,i,(screenHeight/2)-wallHeight/2)
    })
}
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
    renderMinimap(0,0, 0.25, rays)
}

// will run the game loop once every 30 milliseconds
setInterval(gameLoop,TICK)


document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp'){
        player.speed = 3
    };
    if (e.key === 'ArrowDown'){
        player.speed = -3
    }
})
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'){
        player.angle -= toRadians(5)
    }
    if (e.key === 'ArrowRight'){
        player.angle += toRadians(5)
    }
})

document.addEventListener('keyup', e => {
    if(e.key === 'ArrowUp' || e.key === 'ArrowDown'){
        player.speed = 0
    }
})

// document.addEventListener('mousemove', e => {
//     player.angle += toRadians(e.movementX)
// })