// GitHub Pages Configuration for Admin Panel

// Detect if we're running on GitHub Pages
function isGitHubPages() {
    return window.location.hostname.includes('github.io');
}

// Get the base URL for GitHub Pages
function getGitHubPagesBaseUrl() {
    // Extract the repository name from the URL
    const pathSegments = window.location.pathname.split('/');
    // Remove empty segments and get the first segment (repo name)
    const repoName = pathSegments.filter(segment => segment).shift();
    
    return `/${repoName}/`;
}

// Adjust paths for GitHub Pages
function getAdjustedPath(path) {
    if (isGitHubPages()) {
        const baseUrl = getGitHubPagesBaseUrl();
        // If path already starts with /, remove it before adding the base URL
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        return `${baseUrl}${path}`;
    }
    return path;
}

// Get admin path
function getAdminPath() {
    if (isGitHubPages()) {
        const baseUrl = getGitHubPagesBaseUrl();
        return `${baseUrl}admin/`;
    }
    return '/admin/';
}

// Navigate to login page
function navigateToLogin() {
    // Check if we are already in the login directory
    const inLoginDir = window.location.pathname.includes('/login/');
    
    if (isGitHubPages()) {
        const baseUrl = getGitHubPagesBaseUrl();
        window.location.href = `${baseUrl}admin/login/index.html`;
    } else {
        // For local development
        if (inLoginDir) {
            window.location.href = 'index.html';
        } else {
            window.location.href = 'login/index.html';
        }
    }
}

// Navigate to admin dashboard
function navigateToDashboard() {
    // Check if we are in the login directory
    const inLoginDir = window.location.pathname.includes('/login/');
    
    if (isGitHubPages()) {
        const baseUrl = getGitHubPagesBaseUrl();
        window.location.href = `${baseUrl}admin/index.html`;
    } else {
        // For local development
        if (inLoginDir) {
            window.location.href = '../index.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Navigate to main site
function navigateToMainSite() {
    if (isGitHubPages()) {
        const baseUrl = getGitHubPagesBaseUrl();
        window.location.href = baseUrl;
    } else {
        window.location.href = '/';
    }
} 