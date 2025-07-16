# JUnit XML to HTML Reporter

This project is a simple command-line tool to convert JUnit XML test reports into a clean and readable HTML format. It provides a summary of test results, a list of all tests, and highlights failed and slow tests.

## Features

- **JUnit XML Parsing**: Reads standard JUnit XML files.
- **HTML Report Generation**: Creates a standalone HTML report.
- **Test Summary**: Displays total tests, passes, failures, errors, skipped tests, and total duration.
- **Detailed Test List**: Shows all tests with their status, class name, and execution time.
- **Failure Highlighting**: A dedicated section for failed and errored tests for quick debugging.
- **Slowest Tests**: Lists the top 5 slowest tests to help identify performance bottlenecks.
- **Timestamped Reports**: Automatically saves reports in a `reports` directory with a timestamp in the filename.

## Prerequisites

- [Bun](https://bun.sh/) installed on your system.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/junit-reporter.git
   cd junit-reporter
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

## Usage

To generate a report, run the script with the path to your JUnit XML file:

```bash
bun run generate-report.ts <path-to-your-xml-file.xml>
```

For example:

```bash
bun run generate-report.ts TEST-com.example.TestSuite.xml
```

The script will create a new HTML file in the `reports` directory, named with a timestamp (e.g., `reports/report-2025-07-17T12-00-00-000Z.html`).

## Building from Source

You can also compile the script into a standalone executable.

```bash
bun run build
```

This will create a binary named `junit-reporter` in the `dist` directory. You can then run it directly:

```bash
./dist/junit-reporter <path-to-your-xml-file.xml>
```

## Project Structure

- `generate-report.ts`: The main script that parses the XML and generates the HTML report.
- `template.ejs`: The EJS template used to render the HTML report.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `reports/`: The directory where generated reports are stored.

## License

MIT License.