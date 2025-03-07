const WIDTH = 30;
const HEIGHT = 16;
let GAMESTARTED = false;
let livestotal = 3;
let livesleft = 3;
let flagsleft = 99;
let revealsleft = WIDTH * HEIGHT - flagsleft;

function loadDivs() {
    GAMESTARTED = false;
    grid.innerHTML = "";
    lifes.innerHTML = "💖💖💖";
    flags.innerHTML = "🚩 99";
    results.innerHTML = "";
    for (let i = 0; i < HEIGHT; i++) {
        for (let j = 0; j < WIDTH; j++) {
            const div = document.createElement("div");
            div.classList.add("cell", "unrevealed");
            div.id = `cell-${j}-${i}`;
            div.onmousedown = (e) => {mouseDown(div, e);}
            div.onmouseup = (e) => {mouseUp(div, e);}
            div.onmouseout = (e) => {mouseOut(div, e);}
            div.onmouseenter = (e) => {mouseEnter(div, e);}
            div.oncontextmenu = (e) => {
                e.preventDefault();
                return false;
            };
            grid.appendChild(div);
        }
    }
}

function mouseDown(div, e) {
    if (e.button === 0 && div.classList.contains("unrevealed")) {
         div.classList.add("_0");
    }
    else if (e.button == 1) {
        if (div.classList.contains("unrevealed")) {
            div.classList.add("_0");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed")) {
                neighbor.classList.add("_0");
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
    if (div.classList.contains("unrevealed") && div.classList.contains("_0")) {
        div.classList.remove("_0");
    }
    if (e.buttons & 4) {
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed") && neighbor.classList.contains("_0")) {
                neighbor.classList.remove("_0");
            }
        }
    }
    e.preventDefault();
    return false;
}
function mouseEnter(div, e) {
    if (e.buttons & 1 && div.classList.contains("unrevealed")) {
        div.classList.add("_0");
    }
    else if (e.buttons & 4) {
        if (div.classList.contains("unrevealed")) {
            div.classList.add("_0");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed")) {
                neighbor.classList.add("_0");
            }
        }
    }
    e.preventDefault();
    return false;
}

function startGame(div) {
    setFlagsLeft(99);
    setLivesLeft(3);
    revealsleft = WIDTH * HEIGHT - flagsleft;

    const x = div.id.split("-")[1];
    const y = div.id.split("-")[2];
    GAMESTARTED = true;
    let bombs = flagsleft;
    while (bombs > 0) {
        const randomX = Math.floor(Math.random() * WIDTH);
        const randomY = Math.floor(Math.random() * HEIGHT);
        if (Math.abs(randomX - x) < 2 && Math.abs(randomY - y) < 2) {
            continue;
        }
        const div = document.getElementById(`cell-${randomX}-${randomY}`);
        if (!div.classList.contains("bomb")) {
            div.classList.add("bomb");
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
            else {
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
    for (let i = x-1; i <= x+1; i++) {
        for (let j = y-1; j <= y+1; j++) {
            if ((i != x || j != y) && 
                i >= 0 && i < WIDTH && 
                j >= 0 && j < HEIGHT) {
                divs.push(document.getElementById(`cell-${i}-${j}`));
            }
        }
    }
    return divs;
}

function revealCell(div) {
    if (div.classList.contains("unrevealed") && !div.classList.contains("flag")) {
        if (div.classList.contains("bomb")) {
            div.classList.add("boom");
            flagCell(div);
            setLivesLeft(livesleft - 1);
            if (livesleft < 1) {
                results.innerHTML = "Exploded!";
                revealAll();
            }
        }
        else {
            revealsleft = revealsleft - 1;
            if (revealsleft === 0) {
                results.innerHTML = "Victory!";
                revealAll();
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
                // Death Flags
                if (flags === count) {
                    revealAllCells(div);
                }
                // Can't Count
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
            if (neighbor.classList.contains("unrevealed") && neighbor.classList.contains("_0")) {
                neighbor.classList.remove("_0");
            }
        }
        if (count === 0) {
            for (let neighbor of getNeighbors(div)) {
                revealCell(neighbor);
            }
        }
    }
    else {
        if (div.classList.contains("unrevealed") && div.classList.contains("_0")) {
            div.classList.remove("_0");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed") && neighbor.classList.contains("_0")) {
                neighbor.classList.remove("_0");
            }
        }
    }
}

function flagCell(div) {
    if (div.classList.contains("unrevealed")) {
        if (div.classList.contains("flag")) {
            div.classList.remove("flag");
            setFlagsLeft(flagsleft + 1);
        }
        else {
            div.classList.add("flag");
            setFlagsLeft(flagsleft - 1);
            // Death Flags
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

function revealAll() {
    for (let div of document.getElementsByClassName("cell")) {
        if (div.classList.contains("flag") && !div.classList.contains("bomb")) {
            div.classList.add("misflagged");
        }
        else if (div.classList.contains("bomb") && !div.classList.contains("boom")) {
            if (revealsleft === 0) {
                div.classList.add("flag");
            }
            else {
                div.classList.remove("unrevealed");
            }
        }
        else if (div.classList.contains("unrevealed")) {
            let count = 0;
            for (let neighbor of getNeighbors(div)) {
                if (neighbor.classList.contains("bomb")) {
                    count = count + 1;
                }
            }
            div.classList.add("_" + count);
            div.classList.remove("unrevealed");
        }
    }
}