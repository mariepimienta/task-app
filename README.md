# Task Management App

A cross-platform task management app for iPhone and desktop with weekly schedule view, recurring tasks, and Google Calendar integration.

## Features (V1)

- ✅ Weekly schedule view with Monday-Sunday layout
- ✅ Tasks organized by day and time (AM/PM)
- ✅ Recurring tasks support
- ✅ Nested/subtasks
- ✅ Show/hide tasks and calendar events
- ✅ Cross-platform: React Native (iOS) and React Web
- 🚧 Google Calendar integration (API structure ready, OAuth setup needed)

## Project Structure

```
task-app/
├── packages/
│   ├── shared/              # Shared business logic (TypeScript)
│   │   ├── src/
│   │   │   ├── types/       # TypeScript types
│   │   │   ├── utils/       # Date helpers, task logic
│   │   │   ├── storage/     # Storage interface
│   │   │   └── api/         # Google Calendar API
│   ├── mobile/              # React Native app (Expo)
│   └── web/                 # React web app (Vite)
└── package.json             # Root workspace
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- For iOS development: Xcode and iOS Simulator
- For Android development (optional): Android Studio

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

This will install dependencies for all packages in the monorepo.

### Running the Apps

#### Web App

To run the web app in development mode:

```bash
npm run web
```

The app will open at http://localhost:5173

#### Mobile App (iOS/Android)

To run the mobile app:

```bash
npm run mobile
```

This will start the Expo development server. You can then:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your phone

## Usage

### Adding Tasks

1. Click the "+ Add Task (Monday AM)" button to add a sample task
2. Tasks are automatically saved to local storage
3. Click on task checkboxes to toggle completion

### Show/Hide Tasks and Calendar Events

Use the toggle buttons in the header to show or hide:
- Tasks
- Calendar events (once Google Calendar is connected)

### Current Week View

The header displays the current week range (e.g., "Jan 12th - Jan 18th").

## Google Calendar Integration (To Be Implemented)

### Setup Instructions

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - For web: `http://localhost:5173/oauth/callback`
   - For mobile: Custom scheme like `taskapp://oauth/callback`
6. Copy Client ID and Client Secret
7. Add them to your app settings (implementation needed)

The API structure is ready in `packages/shared/src/api/googleCalendar.ts`.

## Data Storage

### Current (V1)

- **Mobile**: AsyncStorage (React Native)
- **Web**: localStorage (browser)
- Data is stored locally on each device

### Future (V2)

The data model is designed to easily support cloud sync:
- Add a backend API (Firebase, Supabase, or custom)
- Swap the storage adapter
- Data will sync across all devices

## Development

### Technology Stack

- **Shared**: TypeScript, date-fns
- **Mobile**: React Native, Expo
- **Web**: React, Vite, TypeScript
- **State Management**: React hooks (Context + useState)

### Adding New Features

1. Add shared types to `packages/shared/src/types/`
2. Add shared logic to `packages/shared/src/utils/`
3. Implement platform-specific UI in `packages/mobile/` and `packages/web/`

## Troubleshooting

### Mobile app not starting

- Make sure Expo CLI is installed: `npm install -g expo-cli`
- Clear Expo cache: `expo start -c`

### Web app not loading shared package

- Reinstall dependencies: `npm install`
- Check that TypeScript is compiling: `npm run shared`

### Tasks not persisting

- Check browser console / mobile logs for storage errors
- Clear storage and reload: localStorage.clear() (web) or clear app data (mobile)

## Future Enhancements

- [ ] Complete Google Calendar OAuth flow
- [ ] Cloud sync backend
- [ ] Drag-and-drop task reordering
- [ ] Task editing UI
- [ ] More recurrence patterns (daily, monthly, custom)
- [ ] Task categories and tags
- [ ] Search and filters
- [ ] Dark mode
- [ ] Notifications/reminders
- [ ] Multiple calendar service support (Apple Calendar, Outlook)

## License

MIT
