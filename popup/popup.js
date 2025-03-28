const tasasMenu = document.querySelector(".select-menu")
const selectBtn = document.querySelector(".select-btn")
const options = document.querySelectorAll(".options .option")
const btnText = document.querySelector(".btn-text")
const currentValue = document.querySelector("#current-dolar")
const url = "https://pydolarve.org/api/v1/dollar"


selectBtn.addEventListener("click", () => {
    tasasMenu.classList.toggle("active")
})

options.forEach((option) => {
    option.addEventListener("click", () => {
        let selectedOption = option.querySelector(".option-text").innerText
        btnText.innerText = selectedOption
        tasasMenu.classList.remove("active")
    })
})

function main() {
    console.log(url)
    try {
        const tasas = request(url)
        
        tasas
        .then((data) => {
            currentValue.innerHTML = data.monitors.bcv.price.toFixed(2)
        })

    } catch (error) {
        console.error(`Error fetching dollar price: ${error}`)
    }
}

async function request(api) {
    console.log(api)
    try {
        const response = await fetch(api)

        if (response.ok) {
            const data = await response.json()
            return data
        } else {
            throw new Error('Network response was not ok.')
        }

    } catch (error) {
        throw new Error(`Failed to read the API: ${error}`);
    }
}

document.addEventListener('DOMContentLoaded', main)