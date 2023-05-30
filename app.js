const gameBoard = document.getElementById("gameboard")

// Display whose turn it is
const playerDisplay = document.getElementById("player")

// Display extra info if needed
const infoDisplay = document.getElementById("info-display")

const width = 8 // 8 by 8 grid

// Whose turn it is
let playerGo = 'black'
playerDisplay.textContent = 'black'

// Let's define what kind of state we want to have at the beginning of the game

// This array will symbolize what all the squares (64) will look like
// All these elements are defined in pieces.js
const startPieces = [
	rook, knight, bishop, queen, king, bishop, knight, rook,
	pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
	'', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '',
	'', '', '', '', '', '', '', '',
	pawn, pawn, pawn, pawn, pawn, pawn, pawn, pawn,
	rook, knight, bishop, queen, king, bishop, knight, rook 
]


function createBoard() {
	startPieces.forEach((startPiece, i) => {
		const square = document.createElement('div')

		square.classList.add('square')
		square.innerHTML = startPiece // Adds the piece images where it's applicable
		square.firstChild?.setAttribute('draggable', true) // If the square has a firstChild ( a piece), make the piece draggable
		square.setAttribute('square-id', i)

		// TO CREATE THE CHECKERED PATTERN
		const row = Math.floor((63 - i) / 8) + 1 // This defines what row the square belongs to. The top 8 squares are row 8, the 8 beneath are row 7, etc.

		if ( row % 2 === 0) { // If the square is in an even numbered row...
			square.classList.add(i % 2 === 0 ? "beige" : "brown") // If the individual square is even, make it beige, otherwise make it brown
		} else {
			square.classList.add(i % 2 === 0 ? "brown" : "beige") // In an odd numbered row, if the square is even, make it brown, otherwise make it beige
		}


		// TO CHANGE PIECE COLOURS
		if (i <= 15) { // For the first 16 squares...
			square.firstChild.firstChild.classList.add('black') // div (square) > div (piece) > svg
		}

		if (i >= 48) { // For the last 16 squares
			square.firstChild.firstChild.classList.add('white')
		}

		gameBoard.append(square)
	})
}

createBoard()



const allSquares = document.querySelectorAll(".square") // Grab every element within the gameboard with a class of square

allSquares.forEach(square => {
	square.addEventListener('dragstart', dragStart)
	square.addEventListener('dragover', dragOver)
	square.addEventListener('drop', dragDrop)
})


let startPositionId
let draggedElement

function dragStart(e) {
	startPositionId = e.target.parentNode.getAttribute('square-id') // The id of the square being moved
	draggedElement = e.target
}

function dragOver(e) {
	e.preventDefault() // The default behaviour is to return the square being dragged over endlessly, this could cause some odd behaviour, so it's best to just prevent it.
}

function dragDrop(e) {
	e.stopPropagation() // To avoid funky behaviour, like dropping into 2 pieces and calling the function twice
	const correctGo = draggedElement.firstChild.classList.contains(playerGo) // The draggedElement must have a class that matches the player whose turn it is
	const taken = e.target.classList.contains('piece')
	const valid = checkIfValid(e.target)
	const opponentGo = playerGo === 'white' ? 'black' : 'white'
	const takenByOpponent = e.target.firstChild?.classList.contains(opponentGo)



	if (correctGo) {
		// Must check this first
		if (takenByOpponent && valid) {
			// If there's already an opponent piece in the square you're moving to
			e.target.parentNode.append(draggedElement)
			e.target.remove() // Capture their piece
			checkForWin()
			changePlayer()
			return
		}

		// Then check this
		if (taken && !takenByOpponent) { 
			infoDisplay.textContent = "You cannot go here!" // Trying to move to a square that's already occupied by one of your pieces
			setTimeout(() => infoDisplay.textContent = "", 2000)
			return
		}

		if (valid) {
			e.target.append(draggedElement)
			checkForWin()
			changePlayer()
			return
		}
	}
}




function checkIfValid(target) {
	// We need these ids to be numbers because we're going to have to do some adding/subtracting in order to determine the validity of moves
	const targetId = Number(target.getAttribute('square-id')) || Number(target.parentNode.getAttribute('square-id')) // Get the id of an empty square || occupied square
	const startId = Number(startPositionId)
	const piece = draggedElement.id
	console.log('startId', startId)
	console.log('targetId', targetId)
	console.log('piece', piece)


	switch(piece) {

	case 'pawn' : 
		const starterRow = [8,9,10,11,12,13,14,15]

		if (
			starterRow.includes(startId) && startId + (width * 2) === targetId ||
			startId + width === targetId  ||
			startId + width - 1 === targetId && document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild ||
			startId + width + 1 === targetId && document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild
			) {
			return true
		}

		break;

	case 'knight' : 
		if (
			// Forward
			startId + (width * 2) - 1 === targetId ||
			startId + (width * 2) + 1 === targetId ||
			startId + width - 2 === targetId ||
			startId + width + 2 === targetId ||

			// Backwards
			startId - (width * 2) - 1 === targetId ||
			startId - (width * 2) + 1 === targetId ||
			startId - width - 2 === targetId ||
			startId - width + 2 === targetId 
		) {
			return true
		}

		break;

	case 'bishop' :
		if (
			// Forward
			// ++
			startId + width + 1 === targetId ||
			startId + (width * 2) + 2 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild ||
			startId + (width * 3) + 3 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild ||
			startId + (width * 4) + 4 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild ||
			startId + (width * 5) + 5 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) + 4}"]`).firstChild ||
			startId + (width * 6) + 6 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) + 5}"]`).firstChild ||
			startId + (width * 7) + 7 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 6) + 6}"]`).firstChild ||

			// --
			startId - width - 1 === targetId ||
			startId - (width * 2) - 2 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild ||
			startId - (width * 3) - 3 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild ||
			startId - (width * 4) - 4 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild ||
			startId - (width * 5) - 5 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) - 4}"]`).firstChild ||
			startId - (width * 6) - 6 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) - 5}"]`).firstChild ||
			startId - (width * 7) - 7 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 6) - 6}"]`).firstChild ||

			// Backwards
			// -+
			startId - width + 1 === targetId ||
			startId - (width * 2) + 2 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild ||
			startId - (width * 3) + 3 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild ||
			startId - (width * 4) + 4 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild ||
			startId - (width * 5) + 5 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) + 4}"]`).firstChild ||
			startId - (width * 6) + 6 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) + 5}"]`).firstChild ||
			startId - (width * 7) + 7 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 6) + 6}"]`).firstChild ||


			// +-
			startId + width - 1 === targetId ||
			startId + (width * 2) - 2 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild ||
			startId + (width * 3) - 3 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild ||
			startId + (width * 4) - 4 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild ||
			startId + (width * 5) - 5 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) - 4}"]`).firstChild ||
			startId + (width * 6) - 6 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) - 5}"]`).firstChild ||
			startId + (width * 7) - 7 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 6) - 6}"]`).firstChild

		) {
			return true
		}

		break;

	case 'rook' : 
		if (
			// Forward
			startId + width === targetId ||
			startId + (width * 2) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild ||
			startId + (width * 3) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild ||
			startId + (width * 4) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild ||
			startId + (width * 5) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4)}"]`).firstChild ||
			startId + (width * 6) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5)}"]`).firstChild ||
			startId + (width * 7) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 6)}"]`).firstChild ||

			// Backwards
			startId - width === targetId ||
			startId - (width * 2) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild ||
			startId - (width * 3) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild ||
			startId - (width * 4) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild ||
			startId - (width * 5) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4)}"]`).firstChild ||
			startId - (width * 6) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5)}"]`).firstChild ||
			startId - (width * 7) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 6)}"]`).firstChild ||
 

 			// Left and Right
 			startId + 1 === targetId ||
			startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild ||
			startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild ||
			startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild ||
			startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild ||
			startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild ||
			startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + 6}"]`).firstChild ||

			
 			startId - 1 === targetId ||
			startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild ||
			startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild ||
			startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild ||
			startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild ||
			startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild ||
			startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - 6}"]`).firstChild
		) {
			return true
		}
	
	case 'queen' :
		if (
			// Forward
			// ++
			startId + width + 1 === targetId ||
			startId + (width * 2) + 2 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild ||
			startId + (width * 3) + 3 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild ||
			startId + (width * 4) + 4 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild ||
			startId + (width * 5) + 5 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) + 4}"]`).firstChild ||
			startId + (width * 6) + 6 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) + 5}"]`).firstChild ||
			startId + (width * 7) + 7 === targetId && !document.querySelector(`[square-id="${startId + width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 6) + 6}"]`).firstChild ||

			// --
			startId - width - 1 === targetId ||
			startId - (width * 2) - 2 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild ||
			startId - (width * 3) - 3 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild ||
			startId - (width * 4) - 4 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild ||
			startId - (width * 5) - 5 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) - 4}"]`).firstChild ||
			startId - (width * 6) - 6 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) - 5}"]`).firstChild ||
			startId - (width * 7) - 7 === targetId && !document.querySelector(`[square-id="${startId - width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 6) - 6}"]`).firstChild ||

			// Backwards
			// -+
			startId - width + 1 === targetId ||
			startId - (width * 2) + 2 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild ||
			startId - (width * 3) + 3 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild ||
			startId - (width * 4) + 4 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild ||
			startId - (width * 5) + 5 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) + 4}"]`).firstChild ||
			startId - (width * 6) + 6 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) + 5}"]`).firstChild ||
			startId - (width * 7) + 7 === targetId && !document.querySelector(`[square-id="${startId - width + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2) + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3) + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4) + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5) + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 6) + 6}"]`).firstChild ||


			// +-
			startId + width - 1 === targetId ||
			startId + (width * 2) - 2 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild ||
			startId + (width * 3) - 3 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild ||
			startId + (width * 4) - 4 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild ||
			startId + (width * 5) - 5 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) - 4}"]`).firstChild ||
			startId + (width * 6) - 6 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) - 5}"]`).firstChild ||
			startId + (width * 7) - 7 === targetId && !document.querySelector(`[square-id="${startId + width - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2) - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3) - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4) - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5) - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 6) - 6}"]`).firstChild ||
		
			// Forward
			startId + width === targetId ||
			startId + (width * 2) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild ||
			startId + (width * 3) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild ||
			startId + (width * 4) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild ||
			startId + (width * 5) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4)}"]`).firstChild ||
			startId + (width * 6) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5)}"]`).firstChild ||
			startId + (width * 7) === targetId && !document.querySelector(`[square-id="${startId + width}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 5)}"]`).firstChild && !document.querySelector(`[square-id="${startId + (width * 6)}"]`).firstChild ||

			// Backwards
			startId - width === targetId ||
			startId - (width * 2) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild ||
			startId - (width * 3) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild ||
			startId - (width * 4) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild ||
			startId - (width * 5) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4)}"]`).firstChild ||
			startId - (width * 6) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5)}"]`).firstChild ||
			startId - (width * 7) === targetId && !document.querySelector(`[square-id="${startId - width}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 2)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 3)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 4)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 5)}"]`).firstChild && !document.querySelector(`[square-id="${startId - (width * 6)}"]`).firstChild ||
 

 			// Left and Right
 			startId + 1 === targetId ||
			startId + 2 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild ||
			startId + 3 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild ||
			startId + 4 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild ||
			startId + 5 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild ||
			startId + 6 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild ||
			startId + 7 === targetId && !document.querySelector(`[square-id="${startId + 1}"]`).firstChild && !document.querySelector(`[square-id="${startId + 2}"]`).firstChild && !document.querySelector(`[square-id="${startId + 3}"]`).firstChild && !document.querySelector(`[square-id="${startId + 4}"]`).firstChild && !document.querySelector(`[square-id="${startId + 5}"]`).firstChild && !document.querySelector(`[square-id="${startId + 6}"]`).firstChild ||

			
 			startId - 1 === targetId ||
			startId - 2 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild ||
			startId - 3 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild ||
			startId - 4 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild ||
			startId - 5 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild ||
			startId - 6 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild ||
			startId - 7 === targetId && !document.querySelector(`[square-id="${startId - 1}"]`).firstChild && !document.querySelector(`[square-id="${startId - 2}"]`).firstChild && !document.querySelector(`[square-id="${startId - 3}"]`).firstChild && !document.querySelector(`[square-id="${startId - 4}"]`).firstChild && !document.querySelector(`[square-id="${startId - 5}"]`).firstChild && !document.querySelector(`[square-id="${startId - 6}"]`).firstChild
		) {
			return true
		}

		break;

	case 'king' :
		if (
			startId +  1 === targetId ||
			startId -  1 === targetId ||
			startId + width === targetId ||
			startId - width === targetId ||
			startId + width - 1 === targetId ||
			startId + width + 1 === targetId ||
			startId - width - 1 === targetId ||
			startId - width + 1 === targetId
		) {
			return true
		}

	}
	
}




function changePlayer() {
	if (playerGo === "black") {
		reverseIds()
		playerGo = "white"
		playerDisplay.textContent = 'white'
	} else {
		revertIds()
		playerGo = "black"
		playerDisplay.textContent = 'black'
	}
}

// After black's turn
function reverseIds() {
	const allSquares = document.querySelectorAll(".square")
	allSquares.forEach((square, i) => 
		square.setAttribute('square-id',(width * width - 1) - i)) // Ids now going from 63 - 0
}

// After white's turn
function revertIds() {
	const allSquares = document.querySelectorAll(".square")
	allSquares.forEach((square, i) => square.setAttribute('square-id', i))	// Ids now going from 0 - 63
} 



function checkForWin() {
	const kings = Array.from(document.querySelectorAll('#king'))
	// The .some method checks if at least one element in an array passes a test
	if (!kings.some(king => king.firstChild.classList.contains('white'))) { // If there is no longer a white king
		infoDisplay.innerHTML = "Black wins!"
		document.getElementById('player-turn').style.visibility = "hidden"
		const allSquares = document.querySelectorAll('.square')
		allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
	}

	if (!kings.some(king => king.firstChild.classList.contains('black'))) { // If there is no longer a black king
		infoDisplay.innerHTML = "White wins!"
		document.getElementById('player-turn').style.visibility = "hidden"
		const allSquares = document.querySelectorAll('.square')
		allSquares.forEach(square => square.firstChild?.setAttribute('draggable', false))
	}
}