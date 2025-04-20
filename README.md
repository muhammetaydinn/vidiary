[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Vidiary - Video Diary App

## Overview

Vidiary is a React Native application that allows users to create video diaries by importing videos, cropping 5-second segments, and adding metadata such as name and description. The app prioritizes simplicity, efficiency, and scalability, adhering to modern React Native development practices.

## Features

- **Video Cropping:** Users can select a video from their device and crop a specific 5-second segment.
- **Metadata Input:** Users can add a name and description to their cropped videos.
- **Video List:** The main screen displays a list of previously cropped videos.
- **Video Details:** Users can view the selected video with its name and description.
- **Edit Video:** Users can edit the name and description of a cropped video.

## App APK, Photos, and Usage Video

[Vidiary app APK, photos, and usage video](https://drive.google.com/drive/folders/1FCQVjhiRz49Jvk6Hh2pEDOJ1fP_LrB8D?usp=sharing)

## How it Works

1.  **Select Video:** Choose a video from the device's library.
2.  **Crop Segment:** Use the scrubber to select a 5-second segment. FFmpeg processes the cropping in the background.
3.  **Add Metadata:** Provide a name and description for the video diary entry.
4.  **Save:** The cropped video and metadata are saved locally using Expo SQLite.
5.  **View & Edit:** Browse saved video entries, view details, or edit metadata.

## Technologies Used

- **Core Framework & Navigation:**
  - [Expo](https://expo.dev/): React Native framework.
  - [Expo Router](https://expo.github.io/router/): File-based routing.
  - [React Native Reanimated](https://docs.expo.dev/versions/latest/sdk/reanimated/): Animations.
- **UI & Styling:**
  - [NativeWind](https://www.nativewind.dev/): Tailwind CSS for React Native.
  - [Expo Vector Icons](https://docs.expo.dev/guides/icons/): Icon library.
- **State Management & Data Fetching:**
  - [Zustand](https://github.com/pmndrs/zustand): Simple state management.
  - [Tanstack Query](https://tanstack.com/query/latest): Managing async operations (like video processing).
- **Video Processing & Playback:**
  - [FFmpeg (via `ffmpeg-kit-react-native`)](https://github.com/arthenica/ffmpeg-kit): Video cropping and thumbnail generation.
  - [Expo Video](https://docs.expo.dev/versions/latest/sdk/video/): Video playback component.
  - [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/image-picker/): Selecting videos from the library.
- **Data Storage & Validation:**
  - [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/): Local database storage.
  - [Zod](https://zod.dev/): Schema validation for metadata form.

## Project Structure

The project follows a standard Expo project structure:

- `app/`: Contains all screens and navigation logic, powered by Expo Router. Includes modals for cropping/metadata and screens for viewing/editing videos.
- `assets/`: Static assets like fonts and images.
- `components/`: Reusable UI components (e.g., `VideoCard`, `VideoPlayer`, `MetadataForm`).
- `constants/`: Application constants (e.g., `Colors`).
- `hooks/`: Custom React hooks (e.g., `useColorScheme`).
- `scripts/`: Utility scripts (e.g., `reset-project.js`).
- `services/`: Core application logic, separated from UI.
  - `database.ts`: SQLite database interactions.
  - `videoProcessor.ts`: FFmpeg video cropping and thumbnail generation logic.
- `store/`: Global state management using Zustand (`videoStore.ts`).
- `types/`: TypeScript type definitions.

Key configuration files include `app.json`, `package.json`, `tailwind.config.js`, and `eas.json`.

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (if available) or visit [https://opensource.org/licenses/MIT](https://opensource.org/licenses/MIT).
