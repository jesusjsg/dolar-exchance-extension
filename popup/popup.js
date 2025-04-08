const tasasMenu = document.querySelector(".select-menu")
const selectBtn = document.querySelector(".select-btn")
const options = document.querySelectorAll(".options .option")
const btnText = document.querySelector(".btn-text")
const currentValue = document.querySelector("#current-dolar")
const toggleButton = document.getElementById("toggle-color-mode")
const body = document.body

document.addEventListener('DOMContentLoaded', () => {
    loadTheme()
    fetchDollarData('bcv')    
    
    selectBtn.addEventListener('click', toggleMenu)
    options.forEach(
        option => option.addEventListener('click', () => selectOption(option))
    )
    toggleButton.addEventListener('click', toggleTheme)
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
            const price = response.data.monitors[rate].price
            currentValue.textContent = `La tasa ${rate} tiene un valor de ${price}`
        } else {
            console.error('Error fetching the data: ', response ? response.error : 'Unknown error')
        } 
    })
}
