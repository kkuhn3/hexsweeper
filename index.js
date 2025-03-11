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

function loadDivs() {
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

    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            const div = document.createElement("div");
            div.classList.add("cell", "unrevealed");
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

function mouseDown(div, e) {
    if (e.button === 0 && div.classList.contains("unrevealed")  && !div.classList.contains("flag")) {
         div.classList.add("peaked");
    }
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
function mouseUp(div, e) {
    if (e.button === 0) {
        if (!GAMESTARTED) {
            startGame(div);
        }
        revealCell(div);
    }
    else if (e.button == 1) {
        revealAllCells(div);
    }
    else {
        flagCell(div);
    }
    e.preventDefault();
    return false;
}
function mouseOut(div, e) {
    if (div.classList.contains("unrevealed") && div.classList.contains("peaked")) {
        div.classList.remove("peaked");
    }
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
function mouseEnter(div, e) {
    if (e.buttons & 1 && div.classList.contains("unrevealed")  && !div.classList.contains("flag")) {
        div.classList.add("peaked");
    }
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

function startGame(div) {
    GAMESTARTED = true;
    let bombs = flagsleft;
    const neighbors = getNeighbors(div);
    while (bombs > 0) {
        const randomX = Math.floor(Math.random() * WIDTH);
        const randomY = Math.floor(Math.random() * HEIGHT);
        const randomDiv = document.getElementById(`cell-${randomX}-${randomY}`);
        if (div != randomDiv && !neighbors.includes(randomDiv) && !randomDiv.classList.contains("bomb")) {
            randomDiv.classList.add("bomb");
            bombs--;
        }
    }
}
function setLivesLeft(num) {
    livesleft = num;
    lifes.innerHTML = "";
    if (livesleft > 3) {
        lifes.innerHTML += "" + livesleft + "x💖";
    }
    else {
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
function setFlagsLeft(num) {
    flagsleft = num;
    flags.innerHTML = "🚩 " + flagsleft;
}

function getNeighbors(div) {
    const x = parseInt(div.id.split("-")[1]);
    const y = parseInt(div.id.split("-")[2]);
    let divs = []
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

function revealCell(div) {
    div.classList.remove("peaked");
    if (div.classList.contains("unrevealed") && !div.classList.contains("flag")) {
        if (div.classList.contains("bomb")) {
            div.classList.add("boom");
            div.innerHTML = "💥";
            flagCell(div);
            setLivesLeft(livesleft - 1);
            if (livesleft < 1) {
                gameOver(false);
            }
        }
        else {
            revealsleft = revealsleft - 1;
            if (revealsleft === 0) {
                gameOver(true);
            }
            else {
                div.classList.remove("unrevealed");
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
                div.classList.add("_" + count);
                if (count === 0) {
                    revealAllCells(div);
                }
                else {
                    div.innerHTML = count;
                }
                // Death Flags
                if (deathflagsSetting.checked && flags === count) {
                    revealAllCells(div);
                }
                // Can't Count
                if (cantcountSetting.checked) {
                    if (count === unrevealedNeighbors) {
                        for (let neighbor of getNeighbors(div)) {
                            if (neighbor.classList.contains("unrevealed") && !neighbor.classList.contains("flag")) {
                                flagCell(neighbor);
                            }
                        }
                    }
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

function revealAllCells(div) {
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
        if (count === 0) {
            for (let neighbor of getNeighbors(div)) {
                revealCell(neighbor);
            }
        }
    }
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

function flagCell(div) {
    if (div.classList.contains("unrevealed")) {
        if (div.classList.contains("flag")) {
            if (!div.classList.contains("boom")) {
                div.innerHTML = "";
                div.classList.remove("flag");
                setFlagsLeft(flagsleft + 1);
            }
        }
        else  {
            div.classList.add("flag");
            if (!div.classList.contains("boom")) {
                div.innerHTML = "🚩";
            }
            setFlagsLeft(flagsleft - 1);
            // Death Flags
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

function gameOver(victory) {
    if (victory) {
        results.innerHTML = "Victory!";
        sendHint();
    }
    else {
        results.innerHTML = "Exploded!";
        sendDeathlink();
    }
    for (let div of document.getElementsByClassName("cell")) {
        div.onmousedown = (e) => {};
        div.onmouseup = (e) => {};
        div.onmouseout = (e) => {};
        div.onmouseenter = (e) => {};
        if (div.classList.contains("flag") && !div.classList.contains("bomb")) {
            div.classList.add("misflagged");
            div.innerHTML = "🏴‍☠️";
        }
        else if (div.classList.contains("bomb") && !div.classList.contains("boom")) {
            if (revealsleft === 0) {
                div.classList.add("flag");
            }
            else if (!div.classList.contains("flag")) {
                div.classList.remove("unrevealed");
                div.innerHTML = "💣";
            }
        }
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

function toggleOptions() {
    if (settings.style.display === "none") {
        settings.style.display = "block";
    }
    else {
        settings.style.display = "none";
    }
}

function sendHint() {
    if (socket && socket.readyState === WebSocket.OPEN && potentialLocs && potentialLocs.length > 0) {
        const randomindex = Math.floor(Math.random() * potentialLocs.length);
        const randomLoc = potentialLocs[randomindex];
        potentialLocs.splice(randomindex, 1);
        socket.send(`[{ 
            "cmd": "LocationScouts", 
            "create_as_hint": 2, 
            "locations": [` + randomLoc + `]
        }]`);
    }
    else {
        connect(sendHint);
    }
}
function sendDeathlink() {
    if (deathlinkSetting.checked) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(`[{
                "cmd": "Bounce",
                "data": {
                    "time": ` + Math.ceil(Date.now() / 1000) + `, 
                    "cause": "` + nameSetting.value + ` exploded sweeping mines.", 
                    "source": "` + nameSetting.value + `"
                },
                "tags": ["DeathLink"]
            }]`);
        }
        else {
            connect(sendDeathlink);
        }
    }
}
let socket;
let potentialLocs = false;
function connect(callback) {
    if (nameSetting.value && portSetting.value) {
        socket = new WebSocket("wss://archipelago.gg:" + portSetting.value);

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
                if (command.cmd === "Connected") {
                    potentialLocs = command.missing_locations;
                    callback();
                }
            }
        });
    }
}