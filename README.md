# Vidiary - Video Diary App

## Overview

Vidiary is a React Native application that allows users to create video diaries by importing videos, cropping 5-second segments, and adding metadata such as name and description. The app prioritizes simplicity, efficiency, and scalability, adhering to modern React Native development practices.

## Features

- **Video Cropping:** Users can select a video from their device and crop a specific 5-second segment.
- **Metadata Input:** Users can add a name and description to their cropped videos.
- **Video List:** The main screen displays a list of previously cropped videos.
- **Video Details:** Users can view the selected video with its name and description.
- **Edit Video:** Users can edit the name and description of a cropped video.

## Technologies Used

- **Core Technologies:**
  - [Expo](https://expo.dev/): Base framework for React Native development.
  - [Expo Router](https://expo.github.io/router/): For implementing app navigation.
  - [Zustand](https://github.com/pmndrs/zustand): State management solution.
  - [Tanstack Query](https://tanstack.com/query/latest): To manage async logic and the FFMPEG cropping process.
  - [FFMPEG](https://ffmpeg.org/): Core library for video processing.
  - [NativeWind](https://www.nativewind.dev/): Styling solution.
  - [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/): Video rendering and playback.
  - [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/): For structured, persistent storage.
  - [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/): For animations.
  - [Zod](https://zod.dev/): Validation schemas for form handling.

## Project Structure

```bash
vidiary/
├── .gitignore
├── app.json
├── app.txt
├── babel.config.js
├── eas.json
├── global.css
├── metro.config.js
├── nativewind-env.d.ts
├── package-lock.json
├── package.json
├── README.md
├── tailwind.config.js
├── tsconfig.json
├── app/
│   ├── _layout.tsx
│   ├── +not-found.tsx
│   ├── index.tsx
│   ├── modal/
│   │   └── crop/
│   │       ├── crop.tsx
│   │       ├── index.tsx
│   │       └── metadata.tsx
│   └── video/
│       ├── [id].tsx
│       └── edit/
│           └── [id].tsx
├── assets/
│   ├── fonts/
│   │   └── SpaceMono-Regular.ttf
│   └── images/
│       ├── adaptive-icon.png
│       ├── colored-icon.png
│       ├── dark-icon.png
│       ├── icon-big-play.png
│       ├── icon.png
│       └── splash-icon.png
├── components/
│   ├── MetadataForm.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   ├── VideoCard.tsx
│   ├── VideoPlayer.tsx
│   ├── VideoScrubber.tsx
│   └── ui/
│       ├── IconSymbol.ios.tsx
│       └── IconSymbol.tsx
├── constants/
│   └── Colors.ts
├── hooks/
│   ├── useColorScheme.ts
│   └── useThemeColor.ts
├── scripts/
│   └── reset-project.js
├── services/
│   ├── database.ts
│   └── videoProcessor.ts
└── store/
    └── videoStore.ts
```

### Key Files and Directories

- `app.json`: Contains the app configuration, including name, version, and plugins.
- `app.txt`: Describes the app's objective, features, and required technologies.
- `babel.config.js`: Configures Babel, a JavaScript compiler.
- `eas.json`: Configuration file for Expo Application Services (EAS).
- `global.css`: Global CSS file for styling.
- `metro.config.js`: Configuration file for Metro, the JavaScript bundler.
- `package.json`: Contains project dependencies and scripts.
- `tailwind.config.js`: Configuration file for Tailwind CSS.
- `tsconfig.json`: Configuration file for TypeScript.
- `app/`: Contains the app's screens and navigation logic.
  - `_layout.tsx`: Defines the root layout of the app.
  - `index.tsx`: The main screen of the app, displaying the list of videos.
  - `modal/crop/`: Contains the video cropping modal screens.
    - `crop.tsx`: Implements the video cropping functionality.
    - `index.tsx`: Allows users to select a video from their device.
    - `metadata.tsx`: Allows users to add metadata to the cropped video.
  - `video/`: Contains the video details and edit screens.
    - `[id].tsx`: Displays the details of a selected video.
    - `edit/[id].tsx`: Allows users to edit the metadata of a video.
- `assets/`: Contains fonts and images used in the app.
- `components/`: Contains reusable UI components.
  - `MetadataForm.tsx`: Implements the form for adding metadata to videos.
  - `ThemedText.tsx`: A component for themed text.
  - `ThemedView.tsx`: A component for themed views.
  - `VideoCard.tsx`: Displays a video card in the list of videos.
  - `VideoPlayer.tsx`: Implements the video player.
  - `VideoScrubber.tsx`: Implements the video scrubber for selecting the crop segment.
  - `ui/`: Contains UI components.
    - `IconSymbol.ios.tsx`: Implements the IconSymbol component for iOS.
    - `IconSymbol.tsx`: Implements the IconSymbol component for Android and web.
- `constants/`: Contains constant values used in the app.
  - `Colors.ts`: Defines the colors used in the app.
- `hooks/`: Contains custom React hooks.
  - `useColorScheme.ts`: A hook for accessing the color scheme.
  - `useThemeColor.ts`: A hook for accessing themed colors.
- `scripts/`: Contains utility scripts.
  - `reset-project.js`: A script to reset the project to a blank state.
- `services/`: Contains services for data access and video processing.
  - `database.ts`: Implements the database logic using Expo SQLite.
  - `videoProcessor.ts`: Implements the video processing logic using FFMPEG.
- `store/`: Contains the Zustand store for managing the app's state.
  - `videoStore.ts`: Defines the video store.
- `types/`: Contains TypeScript type definitions.
  - `ffmpeg-kit-react-native.d.ts`: Type definitions for the ffmpeg-kit-react-native library.

## Dependencies

The project uses a variety of dependencies, including:

- `@craftzdog/react-native-buffer`: "^6.0.5"
- `@expo/vector-icons`: "^14.0.2"
- `@react-native-async-storage/async-storage`: "1.23.1"
- `@react-navigation/bottom-tabs`: "^7.2.0"
- `@react-navigation/native`: "^7.0.14"
- `@tanstack/react-query`: "^5.74.3"
- `expo`: "~52.0.46"
- `expo-av`: "^15.0.2"
- `expo-blur`: "~14.0.3"
- `expo-build-properties`: "^0.13.2"
- `expo-constants`: "~17.0.8"
- `expo-dev-client`: "~5.0.20"
- `expo-font`: "~13.0.4"
- `expo-haptics`: "~14.0.1"
- `expo-image-picker`: "^16.0.6"
- `expo-linking`: "~7.0.5"
- `expo-router`: "~4.0.20"
- `expo-splash-screen`: "~0.29.24"
- `expo-sqlite`: "~15.1.4"
- `expo-status-bar`: "~2.0.1"
- `expo-symbols`: "~0.2.2"
- `expo-system-ui`: "~4.0.9"
- `expo-video`: "^2.0.6"
- `expo-web-browser`: "~14.0.2"
- `ffmpeg-kit-react-native`: "^6.0.2"
- `nanoid`: "^5.1.5"
- `nativewind`: "^4.1.23"
- `react`: "18.3.1"
- `react-dom`: "18.3.1"
- `react-native`: "0.76.9"
- `react-native-crypto`: "^2.2.0"
- `react-native-gesture-handler`: "~2.20.2"
- `react-native-reanimated`: "3.16.2"
- `react-native-safe-area-context`: "4.12.0"
- `react-native-screens`: "~4.4.0"
- `react-native-web`: "~0.19.13"
- `react-native-webview`: "13.12.5"
- `stream-browserify`: "^3.0.0"
- `tailwindcss`: "^3.4.17"
- `yup`: "^1.6.1"
- `zod`: "^3.24.2"
- `zustand`: "^5.0.3"

## Getting Started

1. Install dependencies:

    ```bash
    npm install
    ```

2. Start the app:

    ```bash
    npx expo start
    ```

## Running the Project

To run the project, use the following command:

```bash
npm start
```

This will start the Expo development server and allow you to run the app on a simulator or physical device.

## Resetting the Project

To reset the project to a blank state, use the following command:

```bash
npm run reset-project
```

This command will move the starter code to the `app-example` directory and create a blank `app` directory where you can start developing.

## Learn More

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
