/**
 * ====================================================
 * PWA Module - Health Tracker
 * ====================================================
 * Progressive Web App - Service Worker Registration
 */

// ====================================================
// SERVICE WORKER REGISTRATION
// ====================================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('ServiceWorker registered:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                console.log('ServiceWorker update found');

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content is available
                        console.log('New content available, please refresh');
                    }
                });
            });
        } catch (error) {
            console.error('ServiceWorker registration failed:', error);
        }
    });
}

// ====================================================
// INSTALL PROMPT
// ====================================================

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67+ from automatically showing the prompt
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show install button if exists
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.classList.remove('d-none');

        installBtn.addEventListener('click', async () => {
            // Show the prompt
            deferredPrompt.prompt();

            // Wait for the user's response
            const { outcome } = await deferredPrompt.userChoice;
            console.log('User response:', outcome);

            // Clear the prompt
            deferredPrompt = null;
            installBtn.classList.add('d-none');
        });
    }
});

// ====================================================
// ONLINE/OFFLINE STATUS
// ====================================================

function updateOnlineStatus() {
    const statusIndicator = document.getElementById('onlineStatus');
    if (statusIndicator) {
        if (navigator.onLine) {
            statusIndicator.classList.remove('offline');
            statusIndicator.classList.add('online');
            statusIndicator.title = 'ออนไลน์';
        } else {
            statusIndicator.classList.remove('online');
            statusIndicator.classList.add('offline');
            statusIndicator.title = 'ออฟไลน์';
        }
    }
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initial check
document.addEventListener('DOMContentLoaded', updateOnlineStatus);
