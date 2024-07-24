let USERNAME
let launch = document.querySelector('.launch')
let points = 1000
let game_id
checkLS()

document.getElementById('login').addEventListener('submit', function(event) {
    event.preventDefault()
    auth()
})


function checkLS() {
    let login = localStorage.getItem('username')
    if(login) {
        USERNAME = login
        launch.classList.add('disabled')
        updateUserBalance()
    }
}

document.querySelector('header .exit').addEventListener('click', exit)

function exit() {
    localStorage.removeItem('username')
    launch.classList.remove('disabled')
}

async function auth() {
    let login = document.getElementsByName("login")[0].value 

    let response = await sendRequest("user", "GET", {
        username: login
    })
    if (response.error) {
        //такой пользователь не найден
        let registration = await sendRequest("user", "POST", {
            username: login
    })
        if (registration.error) {
            alert(registration.message)
        } else {
        //пользователь успешно зарег
            USERNAME = login
            launch.classList.add('disabled')
            updateUserBalance()
            localStorage.setItem('username', USERNAME)
    }
    } else {
        //пользователь успешно зарег
        USERNAME = login
        launch.classList.add('disabled')
        updateUserBalance()
        localStorage.setItem('username', USERNAME)
    }
}

updateUserBalance()

async function updateUserBalance() {
    let response = await sendRequest("user", "GET", {
        username: USERNAME
    })
    if (response.error) {
        //произошла ошибка
        alert(response.message)
    } else {
        let userBalance = response.balance
        let span = document.querySelector("header span")
        span.innerHTML = `[${USERNAME}, кол-во баллов: ${userBalance}]`
    }
}

async function sendRequest(url, method, data) {
    url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`
    
    if(method == "POST") {
        let response = await fetch(url, {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    
        response = await response.json()
        return response
    } else if(method == "GET") {
        url = url+"?"+ new URLSearchParams(data)
        let response = await fetch(url, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        response = await response.json()
        return response
    }
}

//2 урок


// document.querySelectorAll('.point').forEach( (btn) => {
//     btn.addEventListener('click', setPoints)
// })

// function setPoints() {
//     let userBtn = event.target
//     points = +userBtn.innerHTML

//     let activeBtn = document.querySelector('.point.active')
//     activeBtn.classList.remove('active')

//     userBtn.classList.add('active')
// }

document.querySelectorAll('.point').forEach((btn) => {
    btn.addEventListener('click', setPoints)
})

function setPoints(event) {
    let userBtn = event.target
    points = +userBtn.innerHTML

    let activeBtn = document.querySelector('.point.active')
    if (activeBtn) {
        activeBtn.classList.remove('active')
    }

    userBtn.classList.add('active')
}

function activateArea() {
    let cells = document.querySelectorAll(".cell")
    cells.forEach((cell, i) => {
        setTimeout(() => {
            cell.classList.add('active')
            cell.addEventListener('contextmenu', (event) => {
                event.preventDefault()
                setFlag()
            })
        }, i * 15)
    })
}

function setFlag() {
    let cell = event.target
    cell.classList.toggle('flag')
}

function cleanArea() {
    let gameField = document.querySelector('.gameField') 
    gameField.innerHTML = "";

    for (let i = 0; i < 80; i++) {
        let cell = document.createElement('div')
        cell.classList.add('cell')
        gameField.appendChild(cell)
    }
} 

let gameBtn = document.getElementById('gameBtn')
gameBtn.addEventListener('click', startOrStop)

function startOrStop() {
    let btnText = gameBtn.innerHTML
    if(btnText == "ИГРАТЬ") {
        startGame()



        gameBtn.innerHTML = "ЗАКОНЧИТЬ ИГРУ"
    } else {
        stopGame()

        gameBtn.innerHTML = "ИГРАТЬ"
    }
}
async function startGame() {
    let response = await sendRequest('new_game', 'POST', {
        'username': USERNAME,
        points
    })
    if(response.error) {
        alert(response.message)
        gameBtn.innerHTML = "ИГРАТЬ"
    } else {
        updateUserBalance()
        game_id = response.game_id
        activateArea()

        console.log(game_id)
    }
}

async function stopGame() {
    let response = await sendRequest('stop_game', 'POST', {
        'username': USERNAME,
        game_id
    })
    if(response.error) {
        alert(response.message)
        gameBtn.innerHTML = "ЗАКОНЧИТЬ ИГРУ"
    } else {
        updateUserBalance()
        cleanArea()
    }
}