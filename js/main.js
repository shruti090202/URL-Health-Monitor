document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const checkButton = document.getElementById('checkButton');
    const clearButton = document.getElementById('clearButton');
    const resultsBody = document.getElementById('resultsBody');
    const historyBody = document.getElementById('historyBody');
    const statsBody = document.getElementById('statsBody');
    const noResults = document.getElementById('no-results');
    const noHistory = document.getElementById('no-history');
    const noStats = document.getElementById('no-stats');
    const loadingResults = document.getElementById('loading-results');
    const lastCheckedTime = document.getElementById('lastCheckedTime');
    const statsToggle = document.getElementById('statsToggle');
    const historyToggle = document.getElementById('historyToggle');
    const statsCardBody = document.getElementById('statsCardBody');
    const historyCardBody = document.getElementById('historyCardBody');
    
    // API endpoint
    const API_URL = '/api/check-urls';
    
    // Load history from localStorage and update UI
    loadHistory();
    displayUrlStats();
    updateToggleStates();
    
    // Check button click event
    checkButton.addEventListener('click', async function() {
        const urls = urlInput.value.trim().split('\n').filter(url => url.trim() !== '');
        
        if (urls.length === 0) {
            showNotification('Please enter at least one URL', 'warning');
            return;
        }
        
        // Update UI to show loading state
        checkButton.disabled = true;
        checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
        noResults.classList.add('hidden');
        loadingResults.classList.remove('hidden');
        
        try {
            // Send URLs to backend for checking
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ urls: urls }),
            });
            
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            const results = await response.json();
            
            // Update timestamp
            const now = new Date();
            lastCheckedTime.textContent = `Last checked: ${now.toLocaleTimeString()}`;
            
            // Display results
            displayResults(results);
            
            // Save results to history
            saveToHistory(results);
            
            // Update history display and stats
            loadHistory();
            displayUrlStats();
            
            showNotification(`Successfully checked ${urls.length} URL${urls.length > 1 ? 's' : ''}`, 'success');
        } catch (error) {
            console.error('Error checking URLs:', error);
            showNotification(`Error checking URLs: ${error.message}`, 'error');
            loadingResults.classList.add('hidden');
            noResults.classList.remove('hidden');
            noResults.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error checking URLs: ${error.message}</p>
            `;
        } finally {
            // Reset button state
            checkButton.disabled = false;
            checkButton.innerHTML = '<i class="fas fa-check-circle"></i> Check Status';
            loadingResults.classList.add('hidden');
        }
    });
    
    // Clear button click event
    clearButton.addEventListener('click', function() {
        urlInput.value = '';
        urlInput.focus();
    });
    
    // Toggle event listeners
    statsToggle.addEventListener('change', function() {
        statsCardBody.style.display = this.checked ? 'block' : 'none';
        localStorage.setItem('statsToggleState', this.checked);
    });
    
    historyToggle.addEventListener('change', function() {
        historyCardBody.style.display = this.checked ? 'block' : 'none';
        localStorage.setItem('historyToggleState', this.checked);
    });
    
    // Function to update toggle states from localStorage
    function updateToggleStates() {
        const statsState = localStorage.getItem('statsToggleState');
        const historyState = localStorage.getItem('historyToggleState');
        
        if (statsState !== null) {
            statsToggle.checked = statsState === 'true';
            statsCardBody.style.display = statsToggle.checked ? 'block' : 'none';
        }
        
        if (historyState !== null) {
            historyToggle.checked = historyState === 'true';
            historyCardBody.style.display = historyToggle.checked ? 'block' : 'none';
        }
    }
    
    // Function to display results in the table
    function displayResults(results) {
        if (results.length === 0) {
            resultsBody.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }
        
        resultsBody.innerHTML = '';
        noResults.classList.add('hidden');
        
        results.forEach(result => {
            const row = document.createElement('tr');
            
            const urlCell = document.createElement('td');
            urlCell.textContent = result.url;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = result.status;
            statusCell.className = result.status === 'UP' ? 'status-up' : 'status-down';
            
            const responseTimeCell = document.createElement('td');
            responseTimeCell.textContent = `${result.responseTime} ms`;
            
            const timestampCell = document.createElement('td');
            timestampCell.textContent = new Date(result.timestamp).toLocaleString();
            
            row.appendChild(urlCell);
            row.appendChild(statusCell);
            row.appendChild(responseTimeCell);
            row.appendChild(timestampCell);
            
            resultsBody.appendChild(row);
        });
    }
    
    // Function to save results to history in localStorage
    function saveToHistory(results) {
        // Get existing history or initialize empty array
        let history = JSON.parse(localStorage.getItem('urlHealthHistory') || '[]');
        
        // Add new results to history
        history = [...results, ...history];
        
        // Keep only last 50 entries
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        // Save back to localStorage
        localStorage.setItem('urlHealthHistory', JSON.stringify(history));
    }
    
    // Function to load and display history
    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('urlHealthHistory') || '[]');
        
        if (history.length === 0) {
            historyBody.innerHTML = '';
            noHistory.classList.remove('hidden');
            return;
        }
        
        historyBody.innerHTML = '';
        noHistory.classList.add('hidden');
        
        // Show only the last 20 history entries in the UI
        const recentHistory = history.slice(0, 20);
        
        recentHistory.forEach(item => {
            const row = document.createElement('tr');
            
            const urlCell = document.createElement('td');
            urlCell.textContent = item.url;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = item.status;
            statusCell.className = item.status === 'UP' ? 'status-up' : 'status-down';
            
            const responseTimeCell = document.createElement('td');
            responseTimeCell.textContent = `${item.responseTime} ms`;
            
            const timestampCell = document.createElement('td');
            timestampCell.textContent = new Date(item.timestamp).toLocaleString();
            
            row.appendChild(urlCell);
            row.appendChild(statusCell);
            row.appendChild(responseTimeCell);
            row.appendChild(timestampCell);
            
            historyBody.appendChild(row);
        });
    }
    
    // Calculate statistics for a specific URL
    function calculateUrlStats(url) {
        const history = JSON.parse(localStorage.getItem('urlHealthHistory') || '[]');
        const urlHistory = history.filter(item => item.url === url);
        
        if (urlHistory.length === 0) {
            return null;
        }
        
        // Calculate uptime percentage
        const upChecks = urlHistory.filter(item => item.status === 'UP').length;
        const uptimePercentage = (upChecks / urlHistory.length) * 100;
        
        // Calculate average response time
        const totalResponseTime = urlHistory.reduce((sum, item) => sum + item.responseTime, 0);
        const avgResponseTime = Math.round(totalResponseTime / urlHistory.length);
        
        // Get first and last check times
        const timestamps = urlHistory.map(item => item.timestamp);
        const firstCheck = new Date(Math.min(...timestamps));
        const lastCheck = new Date(Math.max(...timestamps));
        
        return {
            url: url,
            checksCount: urlHistory.length,
            uptimePercentage: uptimePercentage.toFixed(1),
            avgResponseTime: avgResponseTime,
            firstChecked: firstCheck.toLocaleString(),
            lastChecked: lastCheck.toLocaleString()
        };
    }
    
    // Display stats in the UI
    function displayUrlStats() {
        // Get all unique URLs from history
        const history = JSON.parse(localStorage.getItem('urlHealthHistory') || '[]');
        const uniqueUrls = [...new Set(history.map(item => item.url))];
        
        if (uniqueUrls.length === 0) {
            statsBody.innerHTML = '';
            noStats.classList.remove('hidden');
            return;
        }
        
        statsBody.innerHTML = '';
        noStats.classList.add('hidden');
        
        // Add stats for each URL
        uniqueUrls.forEach(url => {
            const stats = calculateUrlStats(url);
            if (stats) {
                const row = document.createElement('tr');
                
                const urlCell = document.createElement('td');
                urlCell.textContent = stats.url;
                
                const uptimeCell = document.createElement('td');
                const uptimeValue = parseFloat(stats.uptimePercentage);
                uptimeCell.textContent = `${stats.uptimePercentage}%`;
                uptimeCell.style.fontWeight = 'bold';
                
                // Color the uptime cell based on value
                if (uptimeValue >= 95) {
                    uptimeCell.style.color = 'var(--success-color)';
                } else if (uptimeValue >= 80) {
                    uptimeCell.style.color = 'var(--warning-color)';
                } else {
                    uptimeCell.style.color = 'var(--danger-color)';
                }
                
                const responseTimeCell = document.createElement('td');
                responseTimeCell.textContent = `${stats.avgResponseTime} ms`;
                
                const checksCell = document.createElement('td');
                checksCell.textContent = stats.checksCount;
                
                const sinceCell = document.createElement('td');
                sinceCell.textContent = stats.firstChecked;
                
                row.appendChild(urlCell);
                row.appendChild(uptimeCell);
                row.appendChild(responseTimeCell);
                row.appendChild(checksCell);
                row.appendChild(sinceCell);
                
                statsBody.appendChild(row);
            }
        });
    }
    
    // Function to show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Add icon based on type
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';
        
        notification.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Add example URLs to help users
    if (!localStorage.getItem('urlHealthHistory')) {
        urlInput.value = "google.com\ngithub.com\nexample.org";
    }
});

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: white;
        color: var(--text-color);
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
        max-width: 400px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification i {
        margin-right: 10px;
        font-size: 1.2rem;
    }
    
    .notification-success {
        border-left: 4px solid var(--success-color);
    }
    
    .notification-success i {
        color: var(--success-color);
    }
    
    .notification-error {
        border-left: 4px solid var(--danger-color);
    }
    
    .notification-error i {
        color: var(--danger-color);
    }
    
    .notification-warning {
        border-left: 4px solid var(--warning-color);
    }
    
    .notification-warning i {
        color: var(--warning-color);
    }
    
    .notification-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .notification-info i {
        color: var(--primary-color);
    }
`;

document.head.appendChild(notificationStyles);
