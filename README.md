# PeerToPeer

PeerToPeer is a responsive study board built for students who want one place to organize learning resources, study sessions, diagrams, and discussions. The project focuses on creating a clean and interactive experience with customizable themes, persistent settings, and a modern UI that works smoothly across devices.

## Features

* Interactive single-page layout for posts, videos, discussions, study sessions, and resources
* Responsive sidebar with collapsible sections and quick navigation
* Multiple theme options including light, dark, and auto mode
* Custom accent color selection with saved preferences
* Local storage support for themes, sidebar state, cart items, and study materials
* Settings modal with personalized UI controls
* Search bar and category navigation for easier browsing
* Lightweight frontend built with HTML, CSS, and JavaScript
* Optional FastAPI backend for AI assistant functionality

## Running the Project

### Open directly in the browser

1. Open `index.html`
2. Explore the navigation, themes, categories, and settings
3. Test interactions like sidebar toggling and saved preferences

## Optional AI Backend

The project also includes a FastAPI backend in `main.py` that can be used for AI-powered assistant features.

Install dependencies:

```bash
pip install fastapi uvicorn python-dotenv google-genai
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8001
```

The backend uses environment variables stored in a `.env` file for Google Gemini API credentials.

## Project Structure

* `index.html` — main frontend page
* `tailor.css` — primary styling and themes
* `script.js` — frontend interactions and local storage logic
* `posts.html`, `videos.html`, `profile.html` — additional pages
* `main.py` — optional FastAPI backend
* `post_images/` — post and UI image assets
* `TODO.md` — planned improvements and notes
* `Advanced/`, `App/`, `Apps/`, `main/` — supporting project directories

## Goal

The goal of PeerToPeer is to create a modern student workspace that feels simple, customizable, and useful for everyday studying, collaboration, and organization.
