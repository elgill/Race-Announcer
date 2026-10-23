# RaceAnnouncer

RaceAnnouncer is a cross-platform desktop application for announcing race events. Built with Electron and Angular, RaceAnnouncer allows users to input a runner's bib number and display relevant information about the runner in real-time.

## Features

- Connection to timing system for automattic bib number entry
- Import runner data from CSV files with flexible column mapping
- Customizable display settings
- Display runner details including bib number, first name, last name, age, gender, town, state, and custom fields
- Delete incorrectly typed bib numbers from display
- Clock to show how much time has elapsed since set race start time
- Settings and imported runner data is persisted across sessions
- Bib scraping utility which parses bib lookup table directly into the program automattically
  
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

## Testing

```bash
npm test      # unit tests (headless Chrome)
npm run e2e   # builds, then drives the real Electron app end to end
```

The end-to-end test launches Electron with a throwaway profile, so your saved settings and runner data are not touched. It runs a fake Trident timing box on localhost to exercise chip reads.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
