# PHP Package Downloader

A Node.js online application to download PHP Composer packages and provide them as a ZIP file. This tool allows users to input `composer.json` content and easily retrieve the required packages.

## Features

- Download PHP Composer packages online.
- Provides packages as a ZIP file.
- Real-time logging of the download process using Socket.io.
- Automatic cleanup of temporary files after download.
- Expiration for download links.

## Installation

To set up the project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jobians/php-package-downloader.git
   cd php-package-downloader
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

   For development, you can use:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Enter the content of your `composer.json` in the provided text area.
3. Click the "Download Packages" button to start the download process.
4. View logs for progress and download link status.

## API Endpoints

- **POST /download**: Accepts `composer.json` content and triggers the download process.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss improvements.


## License

This project is licensed under the MIT License.
