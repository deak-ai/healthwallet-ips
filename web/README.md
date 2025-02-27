# Health Agent Web Interface

A web-based AI agent powered by Elevenlabs Conversation AI that serves as a voice interface for interacting with patient health records. Built with Astro and React.

## Overview

This application provides a conversational interface where users can talk to an AI healthcare assistant named "Dr. Laura" to get information about their health records. It's designed to be integrated with the HealthWallet IPS mobile application but can also run as a standalone web application.

## Features

- **Voice-Based Interaction**: Allows users to speak directly to the AI agent using their device's microphone
- **Elevenlabs Conversation AI**: Utilizes Elevenlabs' conversational agent technology for natural interactions
- **Health Data Integration**: Can process and respond to questions about a patient's health records, including:
  - Allergies and intolerances
  - Medications
  - Medical problems
- **Mobile & Web Compatible**: Works both when embedded in the React Native WebView and as a standalone web application
- **Responsive Design**: Adapts to various screen sizes with a clean, modern UI

## Technology Stack

- **Framework**: [Astro](https://astro.build/) for static site generation
- **Frontend Library**: React for interactive components
- **Animation**: Framer Motion for smooth UI animations
- **AI Integration**: Elevenlabs Conversation API
- **Deployment**: Static site that can be hosted on any web server

## Prerequisites

- Node.js (LTS version recommended)
- Yarn package manager
- Elevenlabs API key

## Setup and Installation

1. Clone the repository
   ```
   git clone https://github.com/deak-ai/healthwallet-ips.git
   cd healthwallet-ips/web
   ```

2. Install dependencies
   ```
   yarn install
   ```

3. Configure environment variables
   - Copy `.env.example` to `.env`
   - Add your Elevenlabs API key to the `.env` file:
     ```
     ELEVENLABS_API_KEY=your_api_key_here
     ```

4. Start the development server
   ```
   yarn dev
   ```

5. Build for production
   ```
   yarn build
   ```

## Usage

### Standalone Mode

When accessed directly in a web browser, the application will:
1. Request microphone permission
2. Provide a button to start the conversation
3. Allow voice-based interaction with the AI assistant

### Embedded Mode

When embedded in the HealthWallet IPS mobile application:
1. The application receives health data via the `window.healthAgentData` object
2. It adapts its UI and behavior for the mobile WebView environment
3. It communicates with the parent application when necessary

## API Integration

The application uses Elevenlabs Conversation AI with:
- Agent ID: X8gItKgZWiF9FZh5CGax
- Custom prompt that contextualizes the conversation with the patient's health data
- API endpoint for obtaining signed WebSocket URLs

## Development Notes

- The server runs on port 7107 by default (configurable in astro.config.mjs)
- Supports hot module reloading during development
- Additional debugging tools like Sentry and SpotlightJS are configured but commented out by default
