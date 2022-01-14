const canvas = document.getElementById("c");
const cw = canvas.width = window.innerWidth;
const ch = canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

/* --- INIT --- */
const gridDim = 46;
const scale = Math.max(0.42,cw/Math.max(cw, 1045));
const sw = 3 * scale, sh = 18 * scale;

let grid = createGrid(gridDim);

// Squares that spin on their own with no external factors
const noLocked = rint(1,4);
let lockedList = {};  // key: Row, col, val: rotationSpeed
for(let i = 0; i < noLocked; i++) 
    lockedList[[Math.round(rint(0,gridDim-1)), Math.round(rint(1,gridDim-1))]] = rint(6.67,7.22);
/*--------------*/    

function rint(min, max) { return Math.random() * (max - min) + min; }

function createGrid(gridDim) {
    let _grid = [];
    for(let row = 0; row < gridDim; row++) {
        _grid.push([]);
        for(let col = 0; col < gridDim; col++)
            _grid[row].push(0);
    }
    return _grid;
}

function getNeighbourIndexes(r, c, gridDim) {
    let pairs = []

    // The index offsets we must check
    let adjacencies = [ [-1, 1], [0, 1], [1, 1],
                        [-1, 0],/*Node*/ [1, 0],
                        [-1,-1], [0,-1], [1,-1]];

    for(let i = 0; i < adjacencies.length; i++) {
        const [roffset, coffset] = adjacencies[i];  // Destructure the pairs into these named variables for readability.
        
        if(r + roffset >= 0 && r + roffset < gridDim &&
           c + coffset >= 0 && c + coffset < gridDim)
            pairs.push([r + roffset, c + coffset]);
    }

    return pairs;
}

// Create a shallow copy of a 2d array
function copy2DArr(arr) {
    return arr.map((innerArr) => {
        return innerArr.slice();
    })
}

function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,cw,ch);

    let copy = copy2DArr(grid);  // So we dont modify the state of the grid while updating
    for(let row = 0; row < gridDim; row++) {
        for(let col = 0; col < gridDim; col++) {
            // Check dict if we're a 'locked' square (undefined if not)
            let locked = lockedList[[row,col]];

            // Do not apply external forces to a lockedList square!
            if(!locked) {
                let neighbours = getNeighbourIndexes(row, col, gridDim);  
                let avg = 0;
                for(let n = 0; n < neighbours.length; n++) {
                    const [nr, nc] = neighbours[n];
                    avg += grid[nr][nc];
                }
                avg /= neighbours.length
                copy[row][col] = avg;
            } else {
                copy[row][col] += locked;
            }

            ctx.save();
            // Translate origin to the center of the shape, then rotate and reset origin to rotate around shape's center.
            let offsetX = cw/2 - (sh*gridDim)/2 + sh/2.5, offsetY = ch/2-(sh*gridDim)/2;
            ctx.translate(offsetX + (col * sh + sw/2), offsetY + (row * sh + sh/2));
            const rad = copy[row][col]/180 * Math.PI;  // Deg -> rad formula
            ctx.rotate(rad);
            ctx.translate(-(offsetX + (col * sh + sw/2)), -(offsetY + (row * sh + sh/2)));

            ctx.fillStyle= "#1D1E18";
            ctx.fillRect(offsetX + (col * sh), offsetY+  (row * sh), sw, sh);
            
            ctx.restore();  // Restore our transform matrix back to the identity matrix
        }
    }

    grid = copy;
}

draw();