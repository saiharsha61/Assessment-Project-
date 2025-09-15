
# College Resource Hub - React Frontend

This is the frontend for the **College Resource Hub** project, providing a modern, user-friendly interface for students and administrators to manage, share, and discover academic resources.

## Key Features & Functionality

- **Secure Authentication**: Role-based login for students and admins using JWT.
- **Resource Management**: Upload, download, and search for study notes, past papers, and guides.
- **Rating & Feedback**: Submit and view ratings and feedback for resources.
- **Smart Dashboard**: View top-rated, most-downloaded, and recommended resources.

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation
1. Navigate to the `frontend` directory:
	```bash
	cd frontend
	```
2. Install dependencies:
	```bash
	npm install
	```

### Running the App
Start the development server:
```bash
npm start
```
The app will run at [http://localhost:3000](http://localhost:3000).

### Build for Production
```bash
npm run build
```
The production build will be in the `build` folder.

## Project Structure

- `src/App.js` - Main app and navigation
- `src/components/` - All feature components (Login, Register, ResourceUpload, ResourceList, Feedback, Dashboard)

## API Integration

This frontend connects to the Flask backend at `http://localhost:5000`. Ensure the backend is running for full functionality.

## Customization

You can modify styles and components in the `src/components/` folder to match your institution's branding or requirements.

## License

This project is for educational purposes.
