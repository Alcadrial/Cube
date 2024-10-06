
var sides = ["left", "right", "top", "bottom", "back", "front"];
var pieces = [];
var masks = [];

for (var i = 0; i < 26; i++) {
    var piece = document.createElement("div");
    piece.setAttribute("class", "piece visible");
    piece.setAttribute("k", i);
    piece.index = i;
    piece.rotation = newQuaternion(1, 0, 0, 0);
    piece.perm = [0, 1, 2, 3, 4, 5];
    pieces[i] = piece;

    var mask = document.createElement("div");
    mask.setAttribute("class", "piece mask");
    mask.index = i;
    masks[i] = mask;

    for (var j = 0; j < 6; j++) {
        var side = document.createElement("div");
        side.setAttribute("class", "element " + sides[j]);
        side.setAttribute("disabled", null);
        var sideMask = document.createElement("div");
        sideMask.setAttribute("class", "target element " + sides[j]);
        sideMask.index = j;

        piece.appendChild(side);
        mask.appendChild(sideMask);
    }
    cube.appendChild(piece);
    cube.appendChild(mask);
}

var colors = ['blue', 'green', 'white', 'yellow', 'orange', 'red'];
var xPerm = [0, 1, 4, 5, 3, 2];
var yPerm = [5, 4, 2, 3, 0, 1];
var zPerm = [2, 3, 1, 0, 4, 5];
var qIndex = [];
var faceBlocks = [
    [18, 12, 20, 16, 0, 11, 22, 6, 24], 
    [23, 7, 25, 17, 1, 10, 19, 13, 21], 
    [23, 14, 18, 7, 2, 12, 25, 8, 20], 
    [22, 9, 19, 6, 3, 13, 24, 15, 21], 
    [25, 8, 18, 10, 4, 16, 21, 15, 22], 
    [20, 14, 23, 11, 5, 17, 24, 9, 19],
]

// Returns j-th adjacent face of i-th face
function mx(i, j) {
	return ([2, 4, 3, 5][j % 4 | 0] + i % 2 * ((j | 0) % 4 * 2 + 3) + 2 * (i / 2 | 0)) % 6;
}

function getAxis(face) {
	return String.fromCharCode('X'.charCodeAt(0) + face / 2); // X, Y or Z
}

function setAttributeTo(e, face, sticker) {
    e.children[face].appendChild(document.createElement('div')).setAttribute('class', 'sticker ' + colors[face] + ' ' + sticker);
    e.rotate = true;
}

function applyTransformation(e) {
    e.style.transform = e.rotation.toCSSTransform() + ' ' + e.translation;
}

function assembleCube() {
	function moveto(face) {
		id = id + (1 << face);
		sid++;
        var e = pieces[i];
		switch (sid) {
			case 3:
				setAttributeTo(e, face, "c1");
				break;
            case 20:
			case 48:
				setAttributeTo(e, face, "c2");
				break;
            case 10:
            case 37:
                setAttributeTo(e, face, "c3");
                break;
            case 11:
			case 23:
				setAttributeTo(e, face, "c4");
				break;
            case 32:
                setAttributeTo(e, face, "c5");
                break;
			case 53:
				setAttributeTo(e, face, "c6");
				break;
			default:
                e.rotate = false;
				e.children[face].appendChild(document.createElement('div')).setAttribute('class', 'sticker ' + colors[face]);
		}

		return 'translate' + getAxis(face) + '(' + (face % 2 * 4 - 2) + 'em)';
	}
	function movetoBasic(face) {
        masks[i].children[face].appendChild(document.createElement('div'));
        return 'translate' + getAxis(face) + '(' + (face % 2 * 4 - 2) + 'em)';
    }
	for (var id, x, i = 0, sid = 0; id = 0, i < 26; i++) {
		x = mx(i, i % 18);

        masks[i].style.transform = movetoBasic(i % 6) + (i > 5 ? movetoBasic(x) + (i > 17 ? movetoBasic(mx(x, x + 2)) : '') : '');
        pieces[i].translation = moveto(i % 6) + (i > 5 ? moveto(x) + (i > 17 ? moveto(mx(x, x + 2)) : '') : '');
		pieces[i].setAttribute('id', 'piece' + id);
        qIndex[id] = i;
        applyTransformation(pieces[i]);
	}
	for (var i = 0; i < 6; i++) {
		animateRotation(Math.random() * 6 |0, 1, 0);
	}
}

function getPieceId(face, index, corner) {
    return (1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner;
}

function getPieceIndex(face, index, corner) {
    return qIndex[(1 << face) + (1 << mx(face, index)) + (1 << mx(face, index + 1)) * corner];
}

function swapPieces(face, times) {
    
    var perm = [];

    switch (face) {
        case 0:
        case 1:
            perm = xPerm;
            break;
        case 2:
        case 3:
            perm = yPerm;
            break;
        case 4:
        case 5:
            perm = zPerm;
            break;
    }

    var piece = pieces[face];
    for (var k = 0; k < 6; k++) {
        piece.perm[k] = perm[piece.perm[k]];
    }
    for (var j = 0; j < 9; j++) {
        piece = pieces[getPieceIndex(face, j / 2, j % 2)];
        for (var k = 0; k < 6; k++) {
            piece.perm[k] = perm[piece.perm[k]];
        }
    }
    
    for (var i = 0; i < times; i++) {
        for (var j = 1; j < 7; j++) {
            var piece0 = pieces[getPieceIndex(face, j / 2, j % 2)];
            var piece1 = pieces[getPieceIndex(face, j / 2 + 1, j % 2)];

            var t = pieces[piece0.index];
            pieces[piece0.index] = pieces[piece1.index];
            pieces[piece1.index] = t;
            
            t = piece0.index;
            piece0.index = piece1.index;
            piece1.index = t;
        }
    }
}

var partialRotations = [
    Quaternion.fromEuler(0, Math.PI / 2 / 360, 0),
    Quaternion.fromEuler(0, 0, Math.PI / 2 / 360),
    Quaternion.fromEuler(Math.PI / 2 / 360, 0, 0)
];
var rotations = [
    Quaternion.fromEuler(0, Math.PI / 2, 0),
    Quaternion.fromEuler(0, 0, Math.PI / 2),
    Quaternion.fromEuler(Math.PI / 2, 0, 0)
];
var animating = false;
function animateRotation(face, cw, currentTime) {
    var k = (cw ? 1 : -1) * (face % 2 ? 1 : -1);
	var qubes = Array(9).fill(0).map(function (_, index) {
        return pieces[getPieceIndex(face, index / 2, index % 2)];
	});
    qubes[0] = pieces[face];
    qubes.forEach(function (piece) {
        piece.lastRotation = piece.rotation;
    });
    var rotation;
    function update(piece) {
        piece.rotation = rotation.mul(piece.lastRotation);
        applyTransformation(piece);
    }
    var s = 0;
	(function rotatePieces() {
		var passed = s += Date.now() - currentTime;
		if (passed >= 300) {
            rotation = rotations[face / 2 |0].pow(k);
            qubes.forEach(update);
            animating = false;
            return swapPieces(face, 3 - 2 * cw);
        }
        rotation = partialRotations[face / 2 |0].pow(k * passed * (passed < 300) * 1.2);
		qubes.forEach(update);
		requestAnimationFrame(rotatePieces);
	})();
}

// Events
function handleStart(startEvent) {
    startEvent.preventDefault();
    if (startEvent.touches) startEvent = startEvent.touches[0];
	var startXY = pivot.style.transform.match(/-?\d+\.?\d*/g).map(Number);
    var sideMask = startEvent.target.closest('.target');
	var face = sideMask ? sideMask.index : 0;
	function handleMove(e) {
        e.preventDefault();
        if (e.touches) e = e.touches[0];
		if (sideMask) {
			var gid = /\d/.exec(document.elementFromPoint(e.pageX || e.clientX, e.pageY || e.clientY).id);
			if (gid && gid.input.includes('anchor') && !animating) {
                animating = true;
				handleEnd();
                
				var e = sideMask.parentNode.children[mx(face, Number(gid) + 3)].hasChildNodes();
                var f0 = mx(face, Number(gid) + 1 + 2 * e);
				animateRotation(f0, e, Date.now());
			}
		}
        else {
            pivot.style.transform =
                'rotateX(' + (startXY[0] - (e.pageY - startEvent.pageY) / 2) + 'deg)' +
                'rotateY(' + (startXY[1] + (e.pageX - startEvent.pageX) / 2) + 'deg)';
        }
	}
	function handleEnd() {
        document.body.appendChild(controller);
        scene.removeEventListener('mousemove', handleMove);
        scene.removeEventListener('touchmove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchend', handleEnd);
        scene.addEventListener('mousedown', handleStart);
        scene.addEventListener('touchstart', handleStart);
	}
    (sideMask || document.body).appendChild(controller);
    scene.addEventListener('mousemove', handleMove);
    scene.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    scene.removeEventListener('mousedown', handleStart);
    scene.removeEventListener('touchstart', handleStart);
}

document.ondragstart = function() { return false; }
window.addEventListener('load', assembleCube);
scene.addEventListener('mousedown', handleStart);
scene.addEventListener('touchstart', handleStart);