# IMPO SMP Website with GitHub Pages Support

This is the source code for the IMPO SMP Minecraft server website, including the store and admin panel.

## GitHub Pages Deployment Instructions

1. Fork this repository to your GitHub account
2. Go to your repository settings
3. Navigate to the "Pages" section
4. Under "Source", select "main" branch
5. Click Save

Your site will be published at `https://your-username.github.io/repository-name/`

## Admin Panel

The admin panel has been configured to work with GitHub Pages. It uses Firebase for:
- Authentication (admin login)
- Database (storing products, orders, etc.)

The admin panel works entirely client-side, making it compatible with GitHub Pages static hosting.

### Using the Admin Panel

1. Navigate to `/admin/login/index.html` from your GitHub Pages URL
2. Login with your Firebase admin credentials
3. Manage products, view orders, etc.

## Local Development

1. Clone the repository
2. Open `index.html` in your browser
3. For admin panel, navigate to `/admin/login/index.html`

## Firebase Configuration

This project uses Firebase for authentication and database functionality. The Firebase configuration is included in the code files. 

If you want to use your own Firebase project:
1. Create a new Firebase project at [firebase.google.com](https://firebase.google.com)
2. Update the `firebaseConfig` object in the JavaScript files
3. Set up Firebase Authentication with email/password sign-in
4. Set up Realtime Database with the same structure as the original project

## License

This project is available for educational purposes only. 