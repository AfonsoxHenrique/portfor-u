# Portfor-U

Portfor-U is a mobile application developed using React Native, Expo, JavaScript, and Firebase. The application helps users manage professional profile information and resumes.

## Technologies Used

- React Native
- Expo and Expo Router
- JavaScript
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Visual Studio Code
- Git and GitHub

## Getting Started

### Prerequisites

Before running the project, install:

- Node.js
- Git
- Visual Studio Code
- Expo Go on a compatible mobile device, or Android Studio for an Android emulator

### Installation

1. Clone or download the project repository.
2. Open the project folder in Visual Studio Code.
3. Open the terminal in the project directory.
4. Install the dependencies:

   ```bash
   npm install
   ```

5. Configure Firebase as described below.
6. Start the development server:

   ```bash
   npx expo start
   ```

Follow the instructions in the terminal to open the application on a device or emulator.

## Firebase Setup

The application uses Firebase for authentication, database storage, and uploaded files.

### Firebase Authentication

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project or select an existing one.
3. Open Authentication and enable the sign-in methods required by the application (Email verification).
4. Configure the Firebase initialization file in the `firebase` folder.

### Cloud Firestore

Create a Firestore database and configure appropriate security rules.

The resume functionality uses the following structure:

```text
users/
  {userUid}/
    resumes/
      {resumeDocumentId}
    settings/
      resume
```

Resume documents store information such as the filename, file size, content type, Storage path, download URL, and upload timestamp. Resume settings include the title, target role, and industry.

### Firebase Storage

Enable Firebase Storage and configure appropriate security rules.

Resume files are stored using the following path pattern:

```text
users/{userUid}/resumes/{timestamp}_{fileName}
```

The current resume screen supports PDF and DOCX uploads up to 10 MB.

## Current Resume Features

The resume screen includes:

- Real-time loading of resume records from Firestore.
- Uploading PDF and DOCX files to Firebase Storage.
- Saving resume metadata in Firestore.
- Opening uploaded resumes.
- Saving resume title, target role, and industry settings.
- Deleting resume files from Storage and their corresponding Firestore documents.
- Displaying an empty state when no resumes are available.

## Project Structure

```text
project-root/
app/                 Application screens and routes
components/          Reusable UI components
firebase/            Firebase configuration
theme/               Colours, spacing, and styling
package.json         Project dependencies
README.md            Project documentation
```

Refer to the repository for the complete and current project structure.

## Long-Term Maintenance and Data Backup

The project is intended to remain accessible for future maintenance. The source code and Firebase backend must be treated separately.

Keeping the source code in GitHub does not preserve Firebase user accounts, Firestore records, or uploaded Storage files.

To ensure the project can be restored in the future:

1. Keep the source code and dependency lockfile in the repository.
2. Document the Firebase project configuration, enabled services, authentication methods, and database structure.
3. Back up any Firestore records that need to be retained.
4. Back up Firebase Storage files separately.
5. Preserve Firestore and Storage security rules and any required indexes.
6. Address Firebase Authentication user exports separately if existing accounts must be retained.
7. Test the application with a newly configured Firebase project before the original backend is discontinued.

If the original Firebase project becomes unavailable, create a new project, enable the required services, configure the app with the new Firebase settings, restore any available backups, and test the application.

Without backups, the source code may still be available, but the original database records, user accounts, and uploaded files cannot be recovered automatically.

## Troubleshooting

- **Authentication errors:** Check that Firebase Authentication is enabled and the correct sign-in method is configured.
- **Firestore permission errors:** Check the security rules and confirm that the user is signed in.
- **Resume files cannot be opened:** Verify that the Storage object exists and that its path and access permissions are correct.
- **Resume files remain after deleting records:** Firestore and Firebase Storage are separate services. Both the document and the associated file must be deleted.
- **Expo cannot start:** Check Node.js, project dependencies, and the Expo development server.

## Official Documentation

- [Expo Documentation](https://docs.expo.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Export and Import](https://firebase.google.com/docs/firestore/manage-data/export-import)
- [Firebase Console](https://console.firebase.google.com/)

---
