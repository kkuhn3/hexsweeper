let WIDTH = 30;
let HEIGHT = 16;
let GAMESTARTED = false;
let livestotal = 3;
let livesleft = 3;
let flagsleft = 99;
let revealsleft = WIDTH * HEIGHT - flagsleft;
const hexratio = 1.6;
const triangleratio = 1.155;
let mode = 4;

// Load the "unselected" grid
function loadDivs() {
    // Save the settings, so they don't update mid-gameplay
    GAMESTARTED = false;
    grid.innerHTML = "";
    livestotal = lifesSetting.value;
    setLivesLeft(lifesSetting.value);
    setFlagsLeft(bombSetting.value);
    WIDTH = widthSetting.value;
    HEIGHT = heightSetting.value;
    revealsleft = WIDTH * HEIGHT - flagsleft;
    results.innerHTML = "";
    settings.style.display = "none";

    // Different shapes (triangles, squares, hexes) need slightly different CSS to fit
    grid.style.gridTemplateColumns = "repeat(" + WIDTH + ", 1fr)";
    grid.style.gridTemplateRows = "repeat(" + HEIGHT + ", 1fr)";
    if (triSetting.checked) {
        mode = 3;
        grid.style.marginLeft = "0px";
        grid.style.marginRight = "0px";
        grid.style.paddingRight = "calc((80dvw / (" + WIDTH * triangleratio + ")))";
        grid.style.paddingBottom = "0px";
    }
    else if (hexSetting.checked) {
        mode = 6;
        grid.style.marginLeft = "-7.5dvw";
        grid.style.marginRight = "-7.5dvw";
        grid.style.paddingRight = "calc((95dvw / (" + WIDTH * hexratio * 5 + ")))";
        grid.style.paddingBottom = "calc((95dvw / (" + WIDTH * hexratio * 2 + ")))";
    }
    else {
        mode = 4;
        grid.style.marginLeft = "0px";
        grid.style.marginRight = "0px";
        grid.style.paddingRight = "0px";
        grid.style.paddingBottom = "0px";
    }

    // Go through each row/col, add a new div for the cell.
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            const div = document.createElement("div");
            div.classList.add("cell", "unrevealed");
            // Similar to the grid, each shape needs slightly different css
            if (mode === 3) {
                div.classList.add("triangle");
                if ((i % 2 === 1 && j % 2 === 0) ||
                    (i % 2 === 0 && j % 2 === 1)) {
                     div.classList.add("down");
                }
                div.style.marginRight = "-1000px";
                div.style.marginBottom = "calc((80dvw / (" + WIDTH * triangleratio * 16 + ")))"
                div.style.width = "calc((80dvw / (" + WIDTH * triangleratio * .5 + ")))";
                div.style.fontSize = "calc(80dvw / (" + WIDTH * 1.5 + "))";
            }
            else if (mode == 6) {
                div.classList.add("hex");
                if (i % 2 === 1) {
                    div.classList.add("odd-row");
                }
                div.style.marginBottom = "calc((95dvw / (" + WIDTH * hexratio * -2.1 + ")))";
                div.style.width = "calc((95dvw / (" + WIDTH * hexratio + ")))";
                div.style.fontSize = "calc(95dvw / (" + 3 * WIDTH + "))";
            }
            else {
                div.style.fontSize = "calc(80dvw / (2 * " + WIDTH + "))";
            }
            // Add the mouse handling
            div.id = `cell-${j}-${i}`;
            div.onmousedown = (e) => {mouseDown(div, e);};
            div.onmouseup = (e) => {mouseUp(div, e);};
            div.onmouseout = (e) => {mouseOut(div, e);};
            div.onmouseenter = (e) => {mouseEnter(div, e);};
            div.oncontextmenu = (e) => {
                e.preventDefault();
                return false;
            };
            
            grid.appendChild(div);
        }
    }
}

// Called when a mouse button is pressed down
function mouseDown(div, e) {
    // For left click, "highlight" or "peak" the cell.
    if (e.button === 0 && div.classList.contains("unrevealed")  && !div.classList.contains("flag")) {
         div.classList.add("peaked");
    }
    // For middle click, peak all neighboring cells and the selected cell
    else if (e.button == 1) {
        if (div.classList.contains("unrevealed") && !div.classList.contains("flag")) {
            div.classList.add("peaked");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed") && !neighbor.classList.contains("flag")) {
                neighbor.classList.add("peaked");
            }
        }
    }
    e.preventDefault();
    return false;
}
// Called when a mous button is released
function mouseUp(div, e) {
    // On left click, reveal the cell, and start the game if it isn't already
    if (e.button === 0) {
        if (!GAMESTARTED) {
            startGame(div);
        }
        revealCell(div);
    }
    // On middle click, reveal all neighboring cells
    else if (e.button == 1) {
        revealAllCells(div);
    }
    // On right click, flag or unflag the cell
    else {
        flagCell(div);
    }
    e.preventDefault();
    return false;
}
// On mouse leaving a given cell
function mouseOut(div, e) {
    // On a left click leaving, stop peaking the cell
    if (div.classList.contains("unrevealed") && div.classList.contains("peaked")) {
        div.classList.remove("peaked");
    }
    // On middle click leaving, stop peaking all neighboring cells.
    if (e.buttons & 4) {
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed") && neighbor.classList.contains("peaked")) {
                neighbor.classList.remove("peaked");
            }
        }
    }
    e.preventDefault();
    return false;
}
// When the mouse enters a given cell, effectively a copy of `mouseDown``
function mouseEnter(div, e) {
    // On left click, peak that cell.
    if (e.buttons & 1 && div.classList.contains("unrevealed")  && !div.classList.contains("flag")) {
        div.classList.add("peaked");
    }
    // On middle click, peak all neighboring cells.
    else if (e.buttons & 4) {
        if (div.classList.contains("unrevealed") && !div.classList.contains("flag")) {
            div.classList.add("peaked");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed") && !neighbor.classList.contains("flag")) {
                neighbor.classList.add("peaked");
            }
        }
    }
    e.preventDefault();
    return false;
}

// Start the game! Triggered on first cell click
function startGame(div) {
    GAMESTARTED = true;
    let bombs = flagsleft;
    const neighbors = getNeighbors(div);
    while (bombs > 0) {
        const randomX = Math.floor(Math.random() * WIDTH);
        const randomY = Math.floor(Math.random() * HEIGHT);
        const randomDiv = document.getElementById(`cell-${randomX}-${randomY}`);
        // Place all bombs randomly, except at the selected cell or it's neighbors.
        // IE - first click always reveals a 0
        if (div != randomDiv && !neighbors.includes(randomDiv) && !randomDiv.classList.contains("bomb")) {
            randomDiv.classList.add("bomb");
            bombs--;
        }
    }

    // If we don't have an archipelago socket, try to connect!
    if (reconnect || !socket || socket.readyState !== WebSocket.OPEN) {
        connect(()=>{});
    }
}
// Helper used to decrease (or increase) the lives left
function setLivesLeft(num) {
    livesleft = num;
    lifes.innerHTML = "";
    if (livesleft > 3) {
        lifes.innerHTML += "" + livesleft + "x💖";
    }
    else {
        // Only show up to 3 hearts on screen, for visual appeal.
        for (let i = 0; i < 3; i++) {
            if (i < livesleft) {
                lifes.innerHTML += "💖";
            }
            else if (i < livestotal) {
                lifes.innerHTML += "💔";
            }
        }
    }
}
// Helper to decrease (or increase) the flags left.
function setFlagsLeft(num) {
    flagsleft = num;
    flags.innerHTML = "🚩 " + flagsleft;
}

// Retrieve all neighbors of a given cell.
function getNeighbors(div) {
    const x = parseInt(div.id.split("-")[1]);
    const y = parseInt(div.id.split("-")[2]);
    let divs = []
    // Triangles only have 3 neighbors.
    if (mode === 3) {
        let neighbors = [
            [-1, 0],
            [1, 0],
            [0, div.classList.contains("down") ? -1 : 1]
        ];
        for (const [dx, dy] of neighbors) {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
                divs.push(document.getElementById(`cell-${newX}-${newY}`));
            }
        }
    }
    // Hexagon have 6 neighbors
    else if (mode === 6) {
        const isOddRow = y % 2 === 1;
        const neighbors = [
            [isOddRow ? 0 : -1, -1],  // top left
            [isOddRow ? 0 : -1, 1],  // bottom left
            [0, -2],     // top
            [0, 2], //bottom
            [isOddRow ? 1 : 0, -1],  // bottom left
            [isOddRow ? 1 : 0, 1],  // bottom left
        ];

        for (const [dx, dy] of neighbors) {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newX < WIDTH && newY >= 0 && newY < HEIGHT) {
                divs.push(document.getElementById(`cell-${newX}-${newY}`));
            }
        }
    }
    // Squares have 8 neighbors
    else {
        for (let i = x-1; i <= x+1; i++) {
            for (let j = y-1; j <= y+1; j++) {
                if ((i != x || j != y) && 
                    i >= 0 && i < WIDTH && 
                    j >= 0 && j < HEIGHT) {
                    divs.push(document.getElementById(`cell-${i}-${j}`));
                }
            }
        }
    }
    return divs;
}

// Reveal the contents of a given cell, maybe exploding.
function revealCell(div) {
    div.classList.remove("peaked");
    // Only reveal a cell if it's not already revealed.
    if (div.classList.contains("unrevealed") && !div.classList.contains("flag")) {
        // If we hit a bomb, we exploded! 
        if (div.classList.contains("bomb")) {
            div.classList.add("boom");
            div.innerHTML = "💥";
            flagCell(div);
            setLivesLeft(livesleft - 1);
            if (livesleft < 1) {
                gameOver("Exploded!");
            }
        }
        else {
            // If we've revealed everything that isn't a bomb, Victory!
            revealsleft = revealsleft - 1;
            if (revealsleft === 0) {
                gameOver("Victory!");
            }
            else {
                div.classList.remove("unrevealed");
                // Count the statuses of the neighbors.
                let count = 0;
                let flags = 0;
                let unrevealedNeighbors = 0;
                for (let neighbor of getNeighbors(div)) {
                    if (neighbor.classList.contains("bomb")) {
                        count = count + 1;
                    }
                    if (neighbor.classList.contains("flag")) {
                        flags = flags + 1;
                    }
                    if (neighbor.classList.contains("unrevealed")) {
                        unrevealedNeighbors = unrevealedNeighbors + 1;
                    }
                }
                // Set the count, if 0 reveal all neighbors
                div.classList.add("_" + count);
                if (count === 0) {
                    revealAllCells(div);
                }
                else {
                    div.innerHTML = count;
                }
                // If deathflags, and we have the correct flag count... reveal all neighbors!
                if (deathflagsSetting.checked && flags === count) {
                    revealAllCells(div);
                }
                // If can't count mode, flag cells for the user
                if (cantcountSetting.checked) {
                    // If the clicked cell has a count matching its neighbors, flag them all
                    if (count === unrevealedNeighbors) {
                        for (let neighbor of getNeighbors(div)) {
                            if (neighbor.classList.contains("unrevealed") && !neighbor.classList.contains("flag")) {
                                flagCell(neighbor);
                            }
                        }
                    }
                    // After revealing this cell, if a neighbor now has a count matching its neighbors, flag them all
                    for (let neighbor of getNeighbors(div)) {
                        if (!neighbor.classList.contains("unrevealed")) {
                            let cantCount = 0;
                            for (let nextNeighbor of getNeighbors(neighbor)) {
                                if (nextNeighbor.classList.contains("bomb")) {
                                    cantCount = cantCount + 1;
                                }
                                if (nextNeighbor.classList.contains("unrevealed")) {
                                    cantCount = cantCount - 1;
                                }
                            }
                            if (cantCount === 0) {
                                for (let nextNeighbor of getNeighbors(neighbor)) {
                                    if (nextNeighbor.classList.contains("unrevealed") && !nextNeighbor.classList.contains("flag")) {
                                        flagCell(nextNeighbor);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

// Reveal all neighbors of a given cell
function revealAllCells(div) {
    // If the given cell is revealed, reveal it's nighbors
    if (!div.classList.contains("unrevealed")) {
        let count = 0;
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("bomb")) {
                count = count + 1;
            }
            if (neighbor.classList.contains("flag")) {
                count = count - 1;
            }
            if (neighbor.classList.contains("unrevealed") && neighbor.classList.contains("peaked")) {
                neighbor.classList.remove("peaked");
            }
        }
        // if our flags match our count, reveal the neighbors
        if (count === 0) {
            for (let neighbor of getNeighbors(div)) {
                revealCell(neighbor);
            }
        }
    }
    // If the given cell is unrevealed, stop peaking them
    else {
        if (div.classList.contains("unrevealed") && div.classList.contains("peaked")) {
            div.classList.remove("peaked");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed") && neighbor.classList.contains("peaked")) {
                neighbor.classList.remove("peaked");
            }
        }
    }
}

// Flag or unflag a given cell
function flagCell(div) {
    // A revealed cell can't be flagged
    if (div.classList.contains("unrevealed")) {
        // If already flagged, unflag it
        if (div.classList.contains("flag")) {
            // Unless it's exploded in which case no nothing.
            if (!div.classList.contains("boom")) {
                div.innerHTML = "";
                div.classList.remove("flag");
                setFlagsLeft(flagsleft + 1);
            }
        }
        // If it's not flagged, flag it
        else  {
            div.classList.add("flag");
            if (!div.classList.contains("boom")) {
                div.innerHTML = "🚩";
            }
            setFlagsLeft(flagsleft - 1);
            // If we have death flags, count judge if any neighbors can be revealed
            if (deathflagsSetting.checked) {
                for (let neighbor of getNeighbors(div)) {
                    if (!neighbor.classList.contains("unrevealed")) {
                        let count = 0;
                        for (let nextNeighbor of getNeighbors(neighbor)) {
                            if (nextNeighbor.classList.contains("bomb")) {
                                count = count + 1;
                            }
                            if (nextNeighbor.classList.contains("flag")) {
                                count = count - 1;
                            }
                        }
                        if (count === 0) {
                            revealAllCells(neighbor);
                        }
                    }
                }
            }
        }
    }
}

// On game completion, parameter is how the game was completed.
function gameOver(victory) {
    results.innerHTML = victory;
    // victories get hints!
    if (victory === "Victory!") {
        sendHint();
    }
    // Explosions send deathlinks
    else if (victory === "Exploded!") {
        sendDeathlink();
    }
    for (let div of document.getElementsByClassName("cell")) {
        // Remove all mouse events
        div.onmousedown = (e) => {};
        div.onmouseup = (e) => {};
        div.onmouseout = (e) => {};
        div.onmouseenter = (e) => {};
        // Alt-flag flagged cells that were flagged in error.
        if (div.classList.contains("flag") && !div.classList.contains("bomb")) {
            div.classList.add("misflagged");
            div.innerHTML = "🏴‍☠️";
        }
        // For all the bombs, flag them on victory and "bomb" them otherwise
        else if (div.classList.contains("bomb") && !div.classList.contains("boom")) {
            if (revealsleft === 0) {
                div.classList.add("flag");
                div.innerHTML = "🚩";
            }
            else if (!div.classList.contains("flag")) {
                div.classList.remove("unrevealed");
                div.innerHTML = "💣";
            }
        }
        // Reveal any unrevealed cell, showing their count
        else if (div.classList.contains("unrevealed") && !div.classList.contains("boom")) {
            let count = 0;
            for (let neighbor of getNeighbors(div)) {
                if (neighbor.classList.contains("bomb")) {
                    count = count + 1;
                }
            }
            div.classList.add("_" + count);
            div.classList.remove("unrevealed");
            if (count !== 0) {
                div.innerHTML = count;
            }
        }
    }
}

// on click method for "options" button. 
// shows/hides the options
function toggleOptions() {
    if (settings.style.display === "none") {
        settings.style.display = "block";
    }
    else {
        settings.style.display = "none";
    }
}

// Send an Archipelago hint
function sendHint() {
    // If the socket exists, and there is something to hint.
    if (!reconnect && socket && socket.readyState === WebSocket.OPEN) {
        if (potentialLocs && potentialLocs.length > 0) {
            // Random location, remove it from future hints
            const randomindex = Math.floor(Math.random() * potentialLocs.length);
            const randomLoc = potentialLocs[randomindex];
            potentialLocs.splice(randomindex, 1);
            socket.send(`[{ 
                "cmd": "LocationScouts", 
                "create_as_hint": 2, 
                "locations": [` + randomLoc + `]
            }]`);
        }
    }
    // No socket, try to connect
    else {
        connect(sendHint);
    }
}
// Send an archipelago deathlink
let lastDeath = -1;
function sendDeathlink() {
    if (deathlinkSetting.checked) {
        // If the socket exists
        if (!reconnect && socket && socket.readyState === WebSocket.OPEN) {
            lastDeath = Math.ceil(Date.now() / 1000);
            socket.send(`[{
                "cmd": "Bounce",
                "data": {
                    "time": ` + lastDeath + `, 
                    "cause": "` + nameSetting.value + ` exploded sweeping mines.", 
                    "source": "` + nameSetting.value + `"
                },
                "tags": ["DeathLink", "Hexsweeper"]
            }]`);
        }
        // No socket, try to connect
        else {
            connect(sendDeathlink);
        }
    }
}
// Connect to Archipelago
let socket;
let potentialLocs = false;
let reconnect = true;
function connect(callback) {
    // Only if we have a name and port
    if (nameSetting.value && portSetting.value && urlSetting.value) {
        socket = new WebSocket("wss://" + urlSetting.value + ":" + portSetting.value);

        socket.addEventListener('open', function (event) {
            socket.send(`[{
                "cmd" : "Connect",
                "password" : "` + passwordSetting.value + `",
                "game" : "",
                "name" : "` + nameSetting.value + `",
                "tags" : ["HintGame", "DeathLink", "Hexsweeper"],
                "version" : {
                    "major": 0,
                    "minor": 5,
                    "build": 1,
                    "class": "Version"
                },
                "items_handling" : 7,
                "uuid" : "a1c0aac5-01e5-4957-99fe-6ae9edeafa78"
            }]`);
        });

        socket.addEventListener('message', function (event) {
            const message = JSON.parse(event.data);
            console.log(message);
            for (let command of message) {
                // On `Connected`, load our locations and call the callback
                if (command.cmd === "Connected") {
                    potentialLocs = command.missing_locations;
                    reconnect = false;
                    callback();
                }
                // On `Bounced`, check if we should be Deathlinked`
                else if (command.cmd === "Bounced") {
                    // command.data.time !== lastDeath - feels like a bit of a hack, but allows 2 players on one slot to deathlink eachother.
                    if (GAMESTARTED && deathlinkSetting.checked && command.tags.includes("DeathLink") && (!command.tags.includes("Hexsweeper") || command.data.time !== lastDeath)) {
                        gameOver("DeathLinked!");
                    }
                }
            }
        });
    }
}
