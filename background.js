async function request() {
    try {
        const response = await fetch('https://pydolarve.org/api/v1/dollar')
        
        if (!response.ok) {
            const errorMessage = `Error: ${response.status} - ${response.statusText}`
            throw new Error(errorMessage) 
        }
    
        const data = await response.json()
        return { success: true, data}
        
    } catch (error) {
        console.error('Fetch error: ', error)
        return { success: false, error: error.message}
    }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchDollarData") {
        request().then((result) => {
            sendResponse(result)
        })
        return true
    }
})
