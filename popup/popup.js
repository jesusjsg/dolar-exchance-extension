const tasasMenu = document.querySelector(".select-menu")
const selectBtn = document.querySelector(".select-btn")
const options = document.querySelectorAll(".options .option")
const btnText = document.querySelector(".btn-text")
const toggleButton = document.getElementById("toggle-color-mode")
const bolivarInput = document.getElementById("bolivares")
const dolarInput = document.getElementById("dolares")
const dateInput = document.getElementById("currentDate")
const body = document.body

let currentRate = 0

document.addEventListener('DOMContentLoaded', () => {
    loadTheme()
    fetchDollarData('bcv')    
    
    selectBtn.addEventListener('click', toggleMenu)
    options.forEach(
        option => option.addEventListener('click', () => selectOption(option))
    )
    toggleButton.addEventListener('click', toggleTheme)
    dolarInput.addEventListener('input', calculateBolivares)
})

function toggleMenu() {
    tasasMenu.classList.toggle('active')
}

function selectOption(option) {
    const optionValue = option.querySelector('.option-text').getAttribute('data-tasa')
    btnText.innerText = option.querySelector('.option-text').innerText
    tasasMenu.classList.remove('active')
    fetchDollarData(optionValue)
}

function toggleTheme() {
    body.classList.toggle('dark-mode')
    saveTheme(body.classList.contains('dark-mode') ? 'dark-mode' : '')
}

function loadTheme() {
    chrome.storage.local.get(['theme'], (result) => {
        if (result.theme === 'dark-mode') {
            body.classList.add('dark-mode')
        }
    })
}

function saveTheme(theme) {
    chrome.storage.local.set({ theme: theme}, () => {
        console.log('Theme saved: ', theme)
    })
}

function fetchDollarData(rate) {
    chrome.runtime.sendMessage({ action: 'fetchDollarData' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error: ', chrome.runtime.lastError.message)
            return
        }
        
        if (response && response.success) {
            currentRate = response.data.monitors[rate].price
            const currentDate = response.data.monitors[rate].last_update
            dateInput.textContent = currentDate
            calculateBolivares() 
        } else {
            console.error('Error fetching the data: ', response ? response.error : 'Unknown error')
        } 
    })
}

function calculateBolivares() {
    const dolarValue = parseFloat(dolarInput.value) || 0
    const bolivarValue = dolarValue * currentRate
    bolivarInput.value = bolivarValue.toFixed(2)
}
