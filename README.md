# RaceAnnouncer

RaceAnnouncer is a cross-platform desktop application for announcing race events. Built with Electron and Angular, RaceAnnouncer allows users to input a runner's bib number and display relevant information about the runner in real-time.

## Features

- Import runner data from CSV files with flexible column mapping
- Multiple view options
- Customize display settings, including font size, font color, number of display lines, and background color
- Display runner details including bib number, first name, last name, age, gender, town, state, and custom fields
- Delete incorrectly typed bib numbers from display
- Clock to show how much time has elapsed since set race start time
- Settings and imported runner data is persisted across sessions
- Bib scraping utility which parses a webpage to scrape runner data out of a table

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/elgill/Race-Announcer.git
cd Race-Announcer
npm install
```

## Usage

Start the application with:

```bash
npm start
```

Or to use Electron app:

```bash
npm run build
npm run electron
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
