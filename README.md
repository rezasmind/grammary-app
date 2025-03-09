# Grammary

Grammary is a desktop application designed to assist Persian speakers with grammar correction, writing error fixes, tone adjustment, and translation between Persian and other languages.

## Features

- **System-wide Text Selection**: Detect text selections in any application and provide helpful options.
- **Grammar Correction**: Fix grammar errors in non-Persian text.
- **Translation**: Translate text between Persian and multiple languages.
- **Summarization**: Create concise summaries of selected text.
- **Tone Adjustment**: Adjust the tone of non-Persian text.
- **User Authentication**: Secure user accounts with Supabase authentication.
- **Subscription Tiers**:
  - **Free Tier**: Users provide their own API keys for language services.
  - **Paid Tier**: 49T per month for unlimited usage with API access provided.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/grammary-app.git
   cd grammary-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Supabase:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Update the Supabase URL and anon key in `app/renderer/supabase.js`

4. Start the application:
   ```
   npm start
   ```

## Development

To run the application in development mode:

```
npm run dev
```

This will start the application with hot reloading enabled.

## Building for Production

To build the application for production:

```
npm run build
```

This will create distributable packages for your platform in the `dist` directory.

## Usage

1. **System-wide Text Selection**:
   - Select text in any application
   - Press `Ctrl+Shift+G` (or `Command+Shift+G` on macOS)
   - A popup will appear with relevant options based on the selected text

2. **Main Application**:
   - Use the main application window for more advanced features
   - Enter text manually for processing
   - Manage your account and subscription

## Technologies Used

- **Electron**: Cross-platform desktop application framework
- **React**: UI library
- **Supabase**: Authentication and database management
- **TailwindCSS**: Styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Contact

For any questions or suggestions, please open an issue on GitHub. 