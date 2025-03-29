async function request() {
    try {
        const response = await fetch('https://pydolarve.org/api/v1/dollar')

        if (!response.ok) {
            const errorMessage = `Error: ${response.status} - ${response.statusText}`
            throw new Error(errorMessage) 
        }
    
        const data = await response.json()
        chrome.runtime.sendMessage({success: true, data})
        
    } catch (error) {
        console.error('Fetch error: ', error)
        chrome.runtime.sendMessage({ success: false, data})
    }
}
