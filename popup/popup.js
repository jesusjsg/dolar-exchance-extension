const tasasMenu = document.querySelector(".select-menu")
const selectBtn = document.querySelector(".select-btn")
const options = document.querySelectorAll(".options .option")
const btnText = document.querySelector(".btn-text")
const currentValue = document.querySelector("#current-dolar")
const toggleColorMode = document.querySelector('.theme-switch input[type="checkbox"]')

document.addEventListener('DOMContentLoaded', () => {
    fetchDollarData('bcv')    

    selectBtn.addEventListener('click', () => {
        tasasMenu.classList.toggle('active')
    })

    options.forEach((option) => {
        option.addEventListener('click', () => {
            let optionValue = option.querySelector('.option-text').getAttribute('data-tasa') 
            btnText.innerText = option.querySelector('.option-text').innerText
            tasasMenu.classList.remove('active')
            fetchDollarData(optionValue)
        })
    })
    toggleColorMode.addEventListener('change', toggleMode, false)
})

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

function toggleMode(event) {
    if (event.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark')
    } else {
        document.documentElement.setAttribute('data-theme', 'light')
    }
}
