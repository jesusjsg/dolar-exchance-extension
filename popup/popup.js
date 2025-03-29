const tasasMenu = document.querySelector(".select-menu")
const selectBtn = document.querySelector(".select-btn")
const options = document.querySelectorAll(".options .option")
const btnText = document.querySelector(".btn-text")
const currentValue = document.querySelector("#current-dolar")

document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({ action: 'fetchDollarData'}, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error: ', chrome.runtime.lastError.message)
            console.error('Error while connecting to the background')
            return
        }

        if (response && response.success) {
            console.log(`The response is: ${response.data.monitors.bcv.price}`)
        } else {
            console.error('Error fetching data: ', response ? response.error : 'Unknown error')
        }
    })

    selectBtn.addEventListener('click', () => {
        tasasMenu.classList.toggle('active')
    })

    options.forEach((option) => {
        option.addEventListener('click', () => {
            let optionValue = option.querySelector('.option-text').innerText
            btnText.innerText = optionValue
            tasasMenu.classList.remove('active')
        })
    })
})