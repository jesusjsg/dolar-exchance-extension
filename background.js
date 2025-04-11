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
        chrome.storage.local.get(['dollarData', 'lastFetchTime'], async (result) => {
            const currentTime = Date.now()
            const fifteenMinutes = 15 * 60 * 1000

            if (result.dollarData && result.lastFetchTime && (currentTime - result.lastFetchTime < fifteenMinutes)) {
                sendResponse({ success: true, data: result.dollarData })
            } else {
                const fetchResult = await request()
                if (fetchResult.success) {
                    chrome.storage.local.set({
                        dollarData: fetchResult.data,
                        lastFetchTime: currentTime
                    })
                }
                sendResponse(fetchResult)
            }
        })
        return true
    }
})
