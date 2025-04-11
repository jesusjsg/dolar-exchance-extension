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
    dolarInput.addEventListener('input', handleUSDInputFormatting)
})

// Helper functions -> move to util file

function formatBolivares(number) {
    if (isNaN(number)) {
        return ''
    }
    
    return number.toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function cleanUSDString(formattedString) {
    let cleaned = formattedString.replace(/[^0-9.]/g, '')
    const firstDotIndex = cleaned.indexOf('.')
    
    if (firstDotIndex !== -1) {
        cleaned = cleaned.substring(0, firstDotIndex + 1) + cleaned.substring(firstDotIndex + 1).replace(/\./g, '')
    }
    return cleaned 
}

function updateVesOutput() {
    const numericString = cleanUSDString(dolarInput.value)
    const usdValue = parseFloat(numericString || '0')

    if (!isNaN(usdValue) && currentRate > 0) {
        const vesValue = usdValue * currentRate
        bolivarInput.value = formatBolivares(vesValue)
    } else {
        bolivarInput.value = formatBolivares(0)
    }
}

function handleUSDInputFormatting() {
    const input = dolarInput
    let value = input.value
    const originalCursorPos = input.selectionStart
    const originalLength = value.length

    let numericString = cleanUSDString(value)

    if (numericString === '.') {
        numericString = '0.'
    }
    
    if (numericString === '') {
        input.value = ''
        updateVesOutput()
        return
    }

    const parts = numericString.split('.');
    let integerPart = parts[0]
    let decimalPart = parts[1]

    if (integerPart.length > 1 && integerPart.startsWith('0')) {
        integerPart = integerPart.replace(/^0+/, '')
    }
     if (integerPart === '') {
         integerPart = '0'
     }

    let formattedInteger

    try {
        formattedInteger = BigInt(integerPart).toLocaleString('en-US')
    } catch (e) {
        formattedInteger = Number(integerPart).toLocaleString('en-US')
    }

    if (decimalPart !== undefined) {
        decimalPart = decimalPart.substring(0, 2)
    }

    let formattedValue = formattedInteger;
    if (decimalPart !== undefined) {
        formattedValue += '.' + (decimalPart || '')
    }

    input.value = formattedValue

    const newLength = formattedValue.length
    let newCursorPos = originalCursorPos + (newLength - originalLength)

    const justTypedDot = value[originalCursorPos - 1] === '.' && !value.substring(0, originalCursorPos - 1).includes('.')
    if (justTypedDot && formattedValue.includes('.')) {
        newCursorPos = formattedValue.indexOf('.') + 1
    }

    newCursorPos = Math.max(0, Math.min(newCursorPos, newLength))

     requestAnimationFrame(() => {
        input.setSelectionRange(newCursorPos, newCursorPos)
     });

    updateVesOutput()
}

// Theme functions

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
    chrome.storage.local.set({ theme: theme}, () => {})
}

// Menu functions

function toggleMenu() {
    tasasMenu.classList.toggle('active')
}

function selectOption(option) {
    const optionValue = option.querySelector('.option-text').getAttribute('data-tasa')
    btnText.innerText = option.querySelector('.option-text').innerText
    tasasMenu.classList.remove('active')
    fetchDollarData(optionValue)
}

function fetchDollarData(rateKey) {
    chrome.runtime.sendMessage({ action: 'fetchDollarData' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError.message)
            return;
        }

        if (response && response.success && response.data?.monitors?.[rateKey]) {
            const rateData = response.data.monitors[rateKey]
            currentRate = parseFloat(rateData.price) || 0
            dateInput.textContent = rateData.last_update || 'Fecha no disponible'
            updateVesOutput() // Recalculate with the new rate and existing USD input
        } else {
            console.error('Error fetching data or rate key not found:', rateKey, response)
            currentRate = 0
            dateInput.textContent = 'Tasa no encontrada'
            updateVesOutput()
        }
    })

}

function calculateBolivares() {
    const dolarValue = parseFloat(dolarInput.value.replace(/[^0-9.]/g, '')) || 0
    const bolivarValue = dolarValue * currentRate
    bolivarInput.value = bolivarValue.toFixed(2)
}
