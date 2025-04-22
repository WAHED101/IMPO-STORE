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
    console.log('Navigating to login page...');
    
    if (isGitHubPages()) {
        // GitHub Pages path
        const baseUrl = getGitHubPagesBaseUrl();
        const loginUrl = `${baseUrl}admin/login/index.html`;
        console.log(`GitHub Pages login URL: ${loginUrl}`);
        window.location.href = loginUrl;
    } else {
        // Local development - check if we're already in admin directory
        const isInAdmin = window.location.pathname.includes('/admin/');
        const isInLogin = window.location.pathname.includes('/login/');
        
        if (isInLogin) {
            // Already in login directory
            console.log('Already in login directory, redirecting to index.html');
            window.location.href = 'index.html';
        } else if (isInAdmin) {
            // In admin but not login
            console.log('In admin directory, redirecting to login/index.html');
            window.location.href = 'login/index.html';
        } else {
            // Not in admin at all
            console.log('Not in admin directory, redirecting to /admin/login/index.html');
            window.location.href = '/admin/login/index.html';
        }
    }
}

// Navigate to admin dashboard
function navigateToDashboard() {
    console.log('Navigating to admin dashboard...');
    
    if (isGitHubPages()) {
        // GitHub Pages path
        const baseUrl = getGitHubPagesBaseUrl();
        const dashboardUrl = `${baseUrl}admin/index.html`;
        console.log(`GitHub Pages dashboard URL: ${dashboardUrl}`);
        window.location.href = dashboardUrl;
    } else {
        // Local development - check current path
        const isInLogin = window.location.pathname.includes('/login/');
        
        if (isInLogin) {
            // If in login directory, go up one level
            console.log('In login directory, redirecting to ../index.html');
            window.location.href = '../index.html';
        } else {
            // Already in admin directory
            console.log('Already in admin directory, redirecting to index.html');
            window.location.href = 'index.html';
        }
    }
}

// Navigate to main site
function navigateToMainSite() {
    console.log('Navigating to main site...');
    
    if (isGitHubPages()) {
        const baseUrl = getGitHubPagesBaseUrl();
        console.log(`GitHub Pages main site URL: ${baseUrl}`);
        window.location.href = baseUrl;
    } else {
        console.log('Local development main site URL: /');
        window.location.href = '/';
    }
} 