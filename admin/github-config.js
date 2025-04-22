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
    window.location.href = getAdjustedPath('admin/login/index.html');
}

// Navigate to admin dashboard
function navigateToDashboard() {
    window.location.href = getAdjustedPath('admin/index.html');
}

// Navigate to main site
function navigateToMainSite() {
    window.location.href = isGitHubPages() ? getGitHubPagesBaseUrl() : '/';
} 