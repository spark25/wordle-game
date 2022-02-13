const tileDisplay = document.querySelector('.tile-container')
const keyboard = document.querySelector('.key-container')
const messageDisplay = document.querySelector('.message-container')


let currentRow = 0
let currentCol = 0

let wordle = ''

const getWordle = () => {
    fetch('http://localhost:5000/word')
        .then((res) => res.json())
        .then(data => {
            wordle = data.toUpperCase()
        }).catch(err => {
            console.log(err);
        })
}

const checkIsValidWord = async (word) => {
    const res = await fetch('http://localhost:5000/check?word=' + word);
    const isValid = await res.json();
    return isValid
}

getWordle()

let isgameOver = false

const keys = [
    ["Q",
        "W",
        "E",
        "R",
        "T",
        "Y",
        "U",
        "I",
        "O",
        "P",],
    ["A",
        "S",
        "D",
        "F",
        "G",
        "H",
        "J",
        "K",
        "L",
    ],
    ["Z",
        "X",
        "C",
        "V",
        "B",
        "N",
        "M"],

    ["ENTER", "BACK"]
]

const guessRows = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""]
]


guessRows.forEach((guessRow, guessRowIdx) => {
    const rowElement = document.createElement('div');
    rowElement.setAttribute('id', `guess-row-${guessRowIdx}`)
    rowElement.classList.add('tile-row')
    guessRow.forEach((guess, guessIdx) => {
        const tileElement = document.createElement('div')
        tileElement.setAttribute('id', `guess-row-${guessRowIdx}-tile-${guessIdx}`)
        tileElement.classList.add('tile')
        rowElement.append(tileElement)
    })
    tileDisplay.append(rowElement)
})

const handleClick = (letter) => {
    if (isgameOver) return
    if (letter === 'ENTER') {
        checkWord()
        return
    }
    if (letter === 'BACK') {
        deleteLetter()
        return
    }

    addLetter(letter)
}

const addLetter = (letter) => {
    if (currentCol >= 5 || currentRow >= 6) return
    const cell = document.getElementById(`guess-row-${currentRow}-tile-${currentCol}`)
    cell.textContent = letter;
    cell.setAttribute('data', letter)
    guessRows[currentRow][currentCol] = letter
    currentCol++
}


const deleteLetter = () => {
    if (currentCol <= 0) return
    currentCol--
    const cell = document.getElementById(`guess-row-${currentRow}-tile-${currentCol}`)
    cell.textContent = '';
    guessRows[currentRow][currentCol] = ''
    cell.setAttribute('data', '')
}

const checkWord = async () => {
    const guessedWord = guessRows[currentRow].join('')

    if (currentCol > 4) {
        const isValid = await checkIsValidWord(guessedWord)
        if (!isValid) {
            showMessage('Word not in list!')
            return;
        }
        flipTile()
        if (wordle == guessedWord) {
            showMessage('Magnificent!')
            isgameOver = true
            return
        } else {
            if (currentRow >= 5) {
                isgameOver = true
                showMessage('Game Over!')
                return
            }

            if (currentRow < 5) {
                currentRow++
                currentCol = 0
            }
        }
    }
}


const showMessage = (message) => {
    const msg = document.createElement('p')
    msg.textContent = message
    messageDisplay.append(msg)
    setTimeout(() => {
        messageDisplay.removeChild(msg)
    }, 2500)
}

const addColorTokey = (keyLetter, color) => {
    const key = document.getElementById(keyLetter)
    key.classList.add(color)
}

const flipTile = () => {
    const rowTiles = document.getElementById(`guess-row-${currentRow}`).childNodes
    let checkWordle = wordle
    const guess = []

    rowTiles.forEach(tile => {
        guess.push({ letter: tile.getAttribute('data'), color: 'grey-overlay' })
    })

    guess.forEach((guess, idx) => {
        if (guess.letter == wordle[idx]) {
            guess.color = 'green-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    guess.forEach(guess => {
        if (checkWordle.includes(guess.letter)) {
            guess.color = 'yellow-overlay'
            checkWordle = checkWordle.replace(guess.letter, '')
        }
    })

    rowTiles.forEach((tile, idx) => {
        setTimeout(() => {
            tile.classList.add('flip')
            tile.classList.add(guess[idx].color)
            addColorTokey(guess[idx].letter, guess[idx].color)
        }, 500 * idx)


    })
}

keys.forEach((key) => {

    const keyRow = document.createElement('div')
    keyRow.setAttribute('class', 'key-row')

    key.forEach(k => {
        const btnElement = document.createElement('button')
        btnElement.textContent = k
        btnElement.setAttribute('id', k)
        btnElement.addEventListener('click', () => handleClick(k))
        keyRow.append(btnElement)
    })

    keyboard.append(keyRow)

})