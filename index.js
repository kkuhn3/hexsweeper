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
         div.classList.add("peaked");
    }
    else if (e.button == 1) {
        if (div.classList.contains("unrevealed")) {
            div.classList.add("peaked");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed")) {
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
    if (e.buttons & 1 && div.classList.contains("unrevealed")) {
        div.classList.add("peaked");
    }
    else if (e.buttons & 4) {
        if (div.classList.contains("unrevealed")) {
            div.classList.add("peaked");
        }
        for (let neighbor of getNeighbors(div)) {
            if (neighbor.classList.contains("unrevealed")) {
                neighbor.classList.add("peaked");
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
    div.classList.remove("peaked");
    if (div.classList.contains("unrevealed") && !div.classList.contains("flag")) {
        if (div.classList.contains("bomb")) {
            div.classList.add("boom");
            div.innerHTML = "💥";
            flagCell(div);
            setLivesLeft(livesleft - 1);
            if (livesleft < 1) {
                results.innerHTML = "Exploded!";
                revealAll();
            }
        }
        else {
            div.classList.remove("unrevealed");
            revealsleft = revealsleft - 1;
            if (revealsleft === 0) {
                results.innerHTML = "Victory!";
                revealAll();
            }
            else {
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
            div.classList.remove("flag");
            if (!div.classList.contains("boom")) {
                div.innerHTML = "";
            }
            setFlagsLeft(flagsleft + 1);
        }
        else  {
            div.classList.add("flag");
            if (!div.classList.contains("boom")) {
                div.innerHTML = "🚩";
            }
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
        else if (div.classList.contains("unrevealed")) {
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