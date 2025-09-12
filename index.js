/**
 * Creates a new Google Sheet (or finds an existing one) in a specified folder.
 * The filename will have the current year appended as a suffix.
 *
 * * To use this script:
 * 1. Go to script.google.com or open the Apps Script editor from Google Sheets, Docs, etc.
 * 2. Copy and paste this entire code into the editor, replacing any existing code.
 * 3. Replace 'Your Folder Name Here' with the exact name of your folder.
 * 4. Save the project and run the 'processEvents' function.
 * 5. You may be prompted to authorize the script to access your Google Drive and Calendar.
 */

// === MAIN FUNCTION (FOR YOUR USE CASE) ===
function processEvents() {
  // === CONFIGURATION ===
  const FOLDER_NAME = 'Your Folder Name Here';
  const SPREADSHEET_BASE_NAME = 'Calendar Events';

  try {
    // === REGEX TESTING SECTION ===
    // This section is for testing purposes. It runs the regex against sample data
    // and logs the results before processing your actual calendar events.
    Logger.log("--- Starting Regex Tests ---");
    testRegexParsing();
    Logger.log("--- Finished Regex Tests ---");
    return 0;
    // =============================
    
    // Call the function to get or create the spreadsheet for the current year.
    const currentYearSpreadsheet = createOrGetYearlySpreadsheet(FOLDER_NAME, SPREADSHEET_BASE_NAME);

    // Check if the spreadsheet was successfully retrieved or created.
    if (currentYearSpreadsheet) {
      Logger.log('Successfully retrieved or created spreadsheet: ' + currentYearSpreadsheet.getUrl());
      
      // Get events from the calendar for the last week.
      const events = getEventsLastWeek();
      
      // Write the events to a new sheet in the spreadsheet.
      if (events.length > 0) {
        writeEventsToSheet(currentYearSpreadsheet, events);
      } else {
        Logger.log("No events found in the last week. Nothing was written to the sheet.");
      }
    } else {
      Logger.log('Could not get or create the spreadsheet. Please check the folder name and permissions.');
    }
  } catch (e) {
    Logger.log('An error occurred in the main function: ' + e.message);
  }
}

// === CONCEPTUAL HELPER FUNCTIONS ===

/**
 * Creates or gets an existing spreadsheet for the current year.
 * This function is now a reusable utility that returns the spreadsheet object.
 * @param {string} folderName The name of the folder where the spreadsheet should be.
 * @param {string} spreadsheetBaseName The base name for the new spreadsheet.
 * @returns {SpreadsheetApp.Spreadsheet|null} The spreadsheet object if successful, otherwise null.
 */
function createOrGetYearlySpreadsheet(folderName, spreadsheetBaseName) {
  const currentYear = new Date().getFullYear();
  const spreadsheetName = `${spreadsheetBaseName} ${currentYear}`;
  
  try {
    const folder = findFolderByName(folderName);
    if (!folder) {
      Logger.log('Error: Folder "' + folderName + '" not found.');
      return null;
    }
    
    // Check for existing files.
    const existingFile = getFileIfExists(folder, spreadsheetName);
    if (existingFile) {
      Logger.log('Found existing file named "' + spreadsheetName + '". Returning it.');
      return SpreadsheetApp.openById(existingFile.getId());
    }

    // If the file does not exist, proceed with creation.
    return createAndMoveSpreadsheet(folder, spreadsheetName);

  } catch (e) {
    Logger.log('An error occurred in createOrGetYearlySpreadsheet: ' + e.message);
    return null;
  }
}

/**
 * Finds a folder in Google Drive by its name.
 * @param {string} folderName The name of the folder to find.
 * @returns {DriveApp.Folder|null} The folder object if found, otherwise null.
 */
function findFolderByName(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : null;
}

/**
 * Checks if a file with a given name exists within a specific folder and returns it.
 * @param {DriveApp.Folder} folder The folder to search in.
 * @param {string} fileName The name of the file to check for.
 * @returns {DriveApp.File|null} The file object if it exists, otherwise null.
 */
function getFileIfExists(folder, fileName) {
  const existingFiles = folder.getFilesByName(fileName);
  return existingFiles.hasNext() ? existingFiles.next() : null;
}

/**
 * Creates a new spreadsheet with the given name and moves it into the specified folder.
 * @param {DriveApp.Folder} folder The folder to move the spreadsheet into.
 * @param {string} spreadsheetName The name for the new spreadsheet.
 * @returns {SpreadsheetApp.Spreadsheet} The newly created spreadsheet object.
 */
function createAndMoveSpreadsheet(folder, spreadsheetName) {
  const newSpreadsheet = SpreadsheetApp.create(spreadsheetName);
  Logger.log('Created new spreadsheet: ' + newSpreadsheet.getName());

  const file = DriveApp.getFileById(newSpreadsheet.getId());
  const rootFolder = DriveApp.getRootFolder();
  
  folder.addFile(file);
  rootFolder.removeFile(file);
  
  Logger.log('Spreadsheet "' + spreadsheetName + '" moved to "' + folder.getName() + '" folder.');
  Logger.log('URL: ' + newSpreadsheet.getUrl());
  
  return newSpreadsheet;
}

/**
 * Retrieves events from the user's default calendar for the past week.
 * @returns {CalendarApp.CalendarEvent[]} An array of calendar events.
 */
function getEventsLastWeek() {
  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  Logger.log('Fetching events from ' + oneWeekAgo + ' to ' + today);
  const events = CalendarApp.getDefaultCalendar().getEvents(oneWeekAgo, today);
  
  Logger.log('Found ' + events.length + ' events.');
  return events;
}

/**
 * Writes a list of calendar events to a sheet within a spreadsheet.
 * The sheet is named after the month of the first event, and is created if it doesn't exist.
 * The event titles are parsed using a regex and the captured groups are written to columns.
 * @param {SpreadsheetApp.Spreadsheet} spreadsheet The spreadsheet to write to.
 * @param {CalendarApp.CalendarEvent[]} events An array of calendar events.
 */
function writeEventsToSheet(spreadsheet, events) {
  // Determine the sheet name based on the month of the first event.
  const firstEventDate = events[0].getStartTime();
  const monthName = Utilities.formatDate(firstEventDate, Session.getScriptTimeZone(), "MMMM");
  
  // Check if a sheet with this month's name already exists.
  let sheet = spreadsheet.getSheetByName(monthName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(monthName);
    Logger.log('Created a new sheet named: ' + monthName);
  } else {
    Logger.log('Using existing sheet named: ' + monthName);
  }

  // Set the headers in the first row.
  const headers = ["Start Time", "Description", "Type", "Price"];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
  
  // Regular expression to parse the event title.
  const regex = /(\w+(?:\s+(?!\b(?:pareja|55|75)\b)\w+){1,2})\s+((?:pareja\s+)?(?:55|75)?)\s*\$?\s*(\d+(?:[.,]\d+)?\/(?:\d+(?:[.,]\d+)?|pago)|pago)/;

  // Prepare the event data for writing by parsing the title with the regex.
  const eventData = events.map(event => {
    const title = event.getTitle();
    const match = title.match(regex);
    
    // If the regex matches, use the captured groups. Otherwise, use empty strings.
    const description = match ? match[1] : '';
    const type = match ? match[2] : '';
    const price = match ? match[3] : '';

    return [
      event.getStartTime(),
      description,
      type,
      price
    ];
  });

  // Append the data to the sheet, starting from the second row.
  if (eventData.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, eventData.length, headers.length).setValues(eventData);
    Logger.log(`Successfully wrote ${eventData.length} events to the sheet.`);
  }
}

/**
 * Tests the regular expression parsing with a set of predefined event titles.
 * The results are logged to the script editor's log.
 */
function testRegexParsing() {
  const regex = /(\w+(?:\s+(?!\b(?:pareja|55|75)\b)\w+){1,2})\s+((?:pareja\s+)?(?:55|75)?)\s*\$?\s*(\d+(?:[.,]\d+)?\/(?:\d+(?:[.,]\d+)?|pago)|pago)/;
  
  const testTitles = [
    "XXXX pareja $55/pago",
    "YYY YY Y 75 $75/pago",
    "ABCD pago",
    "XX YY XX pareja 55 $55/55",
    "ZZ SD SD 75 $75/pago",
    "HGJF JG $10/10", // This one should fail the regex to show the unmatched case.
    "MMMM" // Another case that should not match.
  ];

  testTitles.forEach(title => {
    const match = title.match(regex);
    if (match) {
      Logger.log(`Title: "${title}" | Match Found!`);
      Logger.log(`  Group 1 (Description): ${match[1]}`);
      Logger.log(`  Group 2 (Type): ${match[2]}`);
      Logger.log(`  Group 3 (Price): ${match[3]}`);
    } else {
      Logger.log(`Title: "${title}" | No Match Found.`);
    }
  });
}
