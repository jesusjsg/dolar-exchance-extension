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
        input.value = '';
        updateVesOutput(); // Update VES output (will show 0,00)
        return;
    }

    // 2. Split into integer and decimal parts
    const parts = numericString.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1];

    // 3. Format integer part (remove leading zeros, add commas using en-US)
    if (integerPart.length > 1 && integerPart.startsWith('0')) {
        integerPart = integerPart.replace(/^0+/, ''); // Remove leading zeros (e.g., "007" -> "7")
    }
     if (integerPart === '') {
         integerPart = '0'; // If input was "0.", integer part is "0"
     }

    // Use BigInt for safety with very large numbers, fallback to Number if needed.
    // Note: BigInt doesn't support decimals, so we only use it for the integer part.
    let formattedInteger;
    try {
        formattedInteger = BigInt(integerPart).toLocaleString('en-US');
    } catch (e) {
        // Fallback for potentially non-integer strings if BigInt fails (shouldn't happen with cleaning)
        formattedInteger = Number(integerPart).toLocaleString('en-US');
    }


    // 4. Limit decimal part to 2 digits
    if (decimalPart !== undefined) {
        decimalPart = decimalPart.substring(0, 2);
    }

    // 5. Reconstruct the formatted value
    let formattedValue = formattedInteger;
    if (decimalPart !== undefined) { // Check if there *was* a decimal part
        formattedValue += '.' + (decimalPart || ''); // Append dot and decimals (or empty string if just '.')
    }

    // 6. Update the input field's value
    input.value = formattedValue;

    // 7. Adjust cursor position (Heuristic)
    const newLength = formattedValue.length;
    let newCursorPos = originalCursorPos + (newLength - originalLength);

    // Special adjustment: If user just typed a period, move cursor after it.
    const justTypedDot = value[originalCursorPos - 1] === '.' && !value.substring(0, originalCursorPos - 1).includes('.');
    if (justTypedDot && formattedValue.includes('.')) {
        newCursorPos = formattedValue.indexOf('.') + 1;
    }

    // Ensure cursor is within bounds
    newCursorPos = Math.max(0, Math.min(newCursorPos, newLength));

    // Use requestAnimationFrame to potentially avoid race conditions with value setting
     requestAnimationFrame(() => {
        input.setSelectionRange(newCursorPos, newCursorPos);
     });


    // 8. Trigger the update of the Bolivares field
    updateVesOutput();
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
            console.error('Runtime error:', chrome.runtime.lastError.message);
            return;
        }

        if (response && response.success && response.data?.monitors?.[rateKey]) {
            const rateData = response.data.monitors[rateKey];
            currentRate = parseFloat(rateData.price) || 0; // Ensure rate is a number
            dateInput.textContent = rateData.last_update || 'Fecha no disponible';
            updateVesOutput(); // Recalculate with the new rate and existing USD input
        } else {
            console.error('Error fetching data or rate key not found:', rateKey, response);
            currentRate = 0; // Reset rate
            dateInput.textContent = 'Tasa no encontrada';
            updateVesOutput(); // Update VES output (will show 0,00)
        }
    })

}

function calculateBolivares() {
    const dolarValue = parseFloat(dolarInput.value.replace(/[^0-9.]/g, '')) || 0
    const bolivarValue = dolarValue * currentRate
    bolivarInput.value = bolivarValue.toFixed(2)
}
