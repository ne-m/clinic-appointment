// Function to show loading screen
function showLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

// Function to hide loading screen and show content
function hideLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Function to show error in loading area
function showLoadingError(message) {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        loadingScreen.innerHTML = `
            <div class="loading-error">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-info)" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p class="loading-text" style="color: var(--text-info);">${message}</p>
                <button onclick="fetchData()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

export { showLoading, hideLoading, showLoadingError}