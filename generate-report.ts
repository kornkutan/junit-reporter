import { XMLParser } from "fast-xml-parser";
import ejs from "ejs";
import path from "path";
import fs from "fs";

// --- Type Definitions for our data structure ---
interface TestCase {
  name: string;
  classname: string;
  time: number;
  status: 'Passed' | 'Failed' | 'Error' | 'Skipped';
  failure?: {
    message: string;
    type: string;
  };
}

interface ReportData {
  summary: {
    total: number;
    passed: number;
    failures: number;
    errors: number;
    skipped: number;
    duration: number;
  };
  failures: TestCase[];
  allTests: TestCase[];
  slowestTests: TestCase[];
  reportDate: string;
}

// --- Main Function ---
async function generateReport(xmlPath: string) {
  console.log(`[1/4] Reading JUnit XML from: ${xmlPath}`);

  // Read the XML file
  const xmlFile = Bun.file(xmlPath);
  if (!(await xmlFile.exists())) {
    console.error(`Error: Input file not found at ${xmlPath}`);
    process.exit(1);
  }
  const xmlContent = await xmlFile.text();

  console.log('[2/4] Parsing XML data...');

  // Parse the XML to a JavaScript object
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsedXml = parser.parse(xmlContent);

  // --- Process the parsed data ---
  const allTests: TestCase[] = [];
  const summary = {
    total: 0,
    passed: 0,
    failures: 0,
    errors: 0,
    skipped: 0,
    duration: 0,
  };

  // JUnit XML can have a single <testsuite> or a <testsuites> wrapper
  const testSuites = parsedXml.testsuites ? parsedXml.testsuites.testsuite : [parsedXml.testsuite];

  for (const suite of testSuites) {
    summary.duration += parseFloat(suite['@_time'] || 0);

    // Ensure testcase is always an array
    const testCases = Array.isArray(suite.testcase) ? suite.testcase : [suite.testcase];

    for (const tc of testCases) {
      if (!tc) continue; // Skip if a testcase is empty

      const test: TestCase = {
        name: tc['@_name'],
        classname: tc['@_classname'],
        time: parseFloat(tc['@_time'] || 0),
        status: 'Passed', // Default status
      };

      if (tc.failure) {
        test.status = 'Failed';
        test.failure = {
          message: tc.failure['#text'] || tc.failure,
          type: tc.failure['@_type'] || 'AssertionFailed',
        };
        summary.failures++;
      } else if (tc.error) {
        test.status = 'Error';
        test.failure = {
          message: tc.error['#text'] || tc.error,
          type: tc.error['@_type'] || 'RuntimeException',
        };
        summary.errors++;
      } else if (tc.skipped !== undefined) {
        test.status = 'Skipped';
        summary.skipped++;
      } else {
        summary.passed++;
      }
      allTests.push(test);
    }
  }
  summary.total = allTests.length;

  console.log('[3/4] Aggregating data for the report...');

  // Prepare data for the EJS template
  const reportData: ReportData = {
    summary,
    allTests: allTests.sort((a,b) => a.name.localeCompare(b.name)),
    failures: allTests.filter(t => t.status === 'Failed' || t.status === 'Error'),
    slowestTests: [...allTests].sort((a, b) => b.time - a.time).slice(0, 5),
    reportDate: new Date().toUTCString(),
  };

  console.log('[4/4] Rendering HTML report...');

  // Render the EJS template
  const templatePath = path.join(import.meta.dir, 'template.ejs');
  const template = await Bun.file(templatePath).text();
  const html = ejs.render(template, reportData);

  // --- Create reports directory and write file ---
  const outputDir = 'reports';
  if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = path.join(outputDir, `report-${timestamp}.html`);


  // Write the final HTML file
  await Bun.write(outputPath, html);
  console.log(`✨ Report successfully generated at: ${outputPath}`);
}

// --- Script Execution ---
const args = Bun.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: bun run generate-report.ts <path-to-xml>");
  process.exit(1);
}

const [xmlPath] = args;
generateReport(xmlPath);