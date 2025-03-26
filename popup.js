const tasasMenu = document.querySelector(".select-menu")
const selectBtn = document.querySelector(".select-btn")
const options = document.querySelectorAll(".options .option")
const btnText = document.querySelector(".btn-text")

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
