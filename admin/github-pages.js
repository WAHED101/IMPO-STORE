// GitHub Pages Helper Script
console.log('GitHub Pages Helper Script loaded');

// This script is a debug/helper tool for GitHub Pages deployment

// Display path information in the console
function logPathInfo() {
    console.log('Current Location Information:');
    console.log('- Protocol:', window.location.protocol);
    console.log('- Hostname:', window.location.hostname);
    console.log('- Pathname:', window.location.pathname);
    console.log('- Search:', window.location.search);
    console.log('- Hash:', window.location.hash);
    
    // Check if we're on GitHub Pages
    const isGHP = window.location.hostname.includes('github.io');
    console.log('Is GitHub Pages:', isGHP);
    
    // Get repository name for GitHub Pages
    if (isGHP) {
        const pathSegments = window.location.pathname.split('/');
        const repoName = pathSegments.filter(segment => segment).shift();
        console.log('Repository Name:', repoName);
        console.log('Base URL:', '/' + repoName + '/');
    }
    
    // Check if we're in admin section
    const isAdmin = window.location.pathname.includes('/admin/');
    console.log('Is Admin Section:', isAdmin);
    
    // Check if we're in login section
    const isLogin = window.location.pathname.includes('/login/');
    console.log('Is Login Section:', isLogin);
}

// Fix any absolute paths in the DOM
function fixAbsolutePaths() {
    // Don't do anything if not on GitHub Pages
    if (!window.location.hostname.includes('github.io')) return;
    
    // Get repository name
    const pathSegments = window.location.pathname.split('/');
    const repoName = pathSegments.filter(segment => segment).shift();
    const baseUrl = '/' + repoName + '/';
    
    // Fix image sources
    document.querySelectorAll('img[src^="/"]').forEach(img => {
        const newSrc = baseUrl + img.getAttribute('src').substring(1);
        console.log('Fixed image path:', img.getAttribute('src'), '->', newSrc);
        img.src = newSrc;
    });
    
    // Fix links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
        if (!link.getAttribute('href').startsWith(baseUrl)) {
            const newHref = baseUrl + link.getAttribute('href').substring(1);
            console.log('Fixed link path:', link.getAttribute('href'), '->', newHref);
            link.href = newHref;
        }
    });
    
    // Fix form actions
    document.querySelectorAll('form[action^="/"]').forEach(form => {
        const newAction = baseUrl + form.getAttribute('action').substring(1);
        console.log('Fixed form action:', form.getAttribute('action'), '->', newAction);
        form.action = newAction;
    });
}

// Add direct navigation buttons for debugging
function addDebugPanel() {
    // Don't add in production
    if (!window.location.hostname.includes('localhost') && 
        !window.location.hostname.includes('127.0.0.1') && 
        !window.location.search.includes('debug=true')) {
        return;
    }
    
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '5px';
    debugPanel.style.zIndex = '9999';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.color = 'white';
    
    debugPanel.innerHTML = `
        <h4 style="margin-top: 0; color: #ff55ff;">GitHub Pages Debug</h4>
        <p>Current Path: ${window.location.pathname}</p>
        <button id="ghp-home">Go to Home</button>
        <button id="ghp-admin">Go to Admin</button>
        <button id="ghp-login">Go to Login</button>
        <button id="ghp-fixpaths">Fix Paths</button>
        <button id="ghp-close">Close</button>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Add event listeners
    document.getElementById('ghp-home').addEventListener('click', () => {
        const isGHP = window.location.hostname.includes('github.io');
        if (isGHP) {
            const pathSegments = window.location.pathname.split('/');
            const repoName = pathSegments.filter(segment => segment).shift();
            window.location.href = '/' + repoName + '/';
        } else {
            window.location.href = '/';
        }
    });
    
    document.getElementById('ghp-admin').addEventListener('click', () => {
        const isGHP = window.location.hostname.includes('github.io');
        if (isGHP) {
            const pathSegments = window.location.pathname.split('/');
            const repoName = pathSegments.filter(segment => segment).shift();
            window.location.href = '/' + repoName + '/admin/index.html';
        } else {
            window.location.href = '/admin/index.html';
        }
    });
    
    document.getElementById('ghp-login').addEventListener('click', () => {
        const isGHP = window.location.hostname.includes('github.io');
        if (isGHP) {
            const pathSegments = window.location.pathname.split('/');
            const repoName = pathSegments.filter(segment => segment).shift();
            window.location.href = '/' + repoName + '/admin/login/index.html';
        } else {
            window.location.href = '/admin/login/index.html';
        }
    });
    
    document.getElementById('ghp-fixpaths').addEventListener('click', () => {
        fixAbsolutePaths();
        alert('Absolute paths fixed!');
    });
    
    document.getElementById('ghp-close').addEventListener('click', () => {
        debugPanel.remove();
    });
}

// Run when the page loads
document.addEventListener('DOMContentLoaded', function() {
    logPathInfo();
    fixAbsolutePaths();
    
    // Add debug panel with delay to ensure page is fully loaded
    setTimeout(addDebugPanel, 1000);
}); 