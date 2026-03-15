/**
 * SalesCRM - Google Apps Script Backend
 *
 * This script serves as the API backend for the SalesCRM application.
 * It reads/writes data to Google Sheets and integrates with Gmail and Google Calendar.
 *
 * SETUP:
 * 1. Create a Google Sheet with tabs: Leads, Tasks, Meetings, Email_Log
 * 2. Copy this code into Apps Script (Extensions > Apps Script)
 * 3. Set the SPREADSHEET_ID below
 * 4. Deploy as Web App (Execute as: Me, Access: Anyone)
 */

// ==================== CONFIGURATION ====================
var SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // Replace with your Google Sheet ID
var CALENDAR_ID = "primary"; // Use primary calendar

// ==================== SHEET HEADERS ====================
var LEADS_HEADERS = [
  "id", "company", "contact_name", "email", "linkedin_url", "phone",
  "source", "owner", "stage", "notes", "deal_value", "created_date"
];

var TASKS_HEADERS = [
  "id", "lead_id", "task_title", "due_date", "assigned_user", "status", "created_date"
];

var MEETINGS_HEADERS = [
  "id", "lead_id", "title", "date", "time", "duration", "attendees",
  "meet_link", "notes", "created_date"
];

var EMAIL_LOG_HEADERS = [
  "id", "lead_id", "to", "subject", "body", "sent_date", "sent_by"
];

// ==================== WEB APP ENTRY POINTS ====================

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var result;

    switch (action) {
      case "getLeads":
        result = getLeads();
        break;
      case "getLead":
        result = getLead(payload.id);
        break;
      case "createLead":
        result = createLead(payload.lead);
        break;
      case "updateLead":
        result = updateLead(payload.id, payload.updates);
        break;
      case "updateLeadStage":
        result = updateLeadStage(payload.id, payload.stage);
        break;
      case "getTasks":
        result = getTasks(payload.lead_id);
        break;
      case "createTask":
        result = createTask(payload.task);
        break;
      case "updateTask":
        result = updateTask(payload.id, payload.updates);
        break;
      case "getMeetings":
        result = getMeetings(payload.lead_id);
        break;
      case "scheduleMeeting":
        result = scheduleMeeting(payload.meeting);
        break;
      case "sendEmail":
        result = sendEmailAction(payload.email);
        break;
      case "getEmails":
        result = getEmails(payload.lead_id);
        break;
      case "getDashboardStats":
        result = getDashboardStats();
        break;
      default:
        return jsonResponse({ error: "Unknown action: " + action });
    }

    return jsonResponse({ data: result });
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doGet(e) {
  return jsonResponse({ status: "SalesCRM API is running" });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== HELPER FUNCTIONS ====================

function getSheet(name) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return ss.getSheetByName(name);
}

function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

function sheetToObjects(sheet, headers) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return []; // Only headers or empty

  var objects = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Convert dates to ISO strings
      if (val instanceof Date) {
        val = val.toISOString().split("T")[0];
      }
      obj[headers[j]] = val;
    }
    objects.push(obj);
  }
  return objects;
}

function findRowById(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return i + 1; // 1-indexed row number
    }
  }
  return -1;
}

// ==================== LEADS ====================

function getLeads() {
  var sheet = getSheet("Leads");
  return sheetToObjects(sheet, LEADS_HEADERS);
}

function getLead(id) {
  var leads = getLeads();
  for (var i = 0; i < leads.length; i++) {
    if (leads[i].id === id) return leads[i];
  }
  throw new Error("Lead not found: " + id);
}

function createLead(lead) {
  var sheet = getSheet("Leads");
  var id = generateId();
  var now = new Date().toISOString().split("T")[0];

  var row = [
    id,
    lead.company || "",
    lead.contact_name || "",
    lead.email || "",
    lead.linkedin_url || "",
    lead.phone || "",
    lead.source || "",
    lead.owner || "",
    lead.stage || "New Lead",
    lead.notes || "",
    lead.deal_value || 0,
    now
  ];

  sheet.appendRow(row);

  var result = {};
  for (var i = 0; i < LEADS_HEADERS.length; i++) {
    result[LEADS_HEADERS[i]] = row[i];
  }
  return result;
}

function updateLead(id, updates) {
  var sheet = getSheet("Leads");
  var rowNum = findRowById(sheet, id);
  if (rowNum === -1) throw new Error("Lead not found: " + id);

  var row = sheet.getRange(rowNum, 1, 1, LEADS_HEADERS.length).getValues()[0];

  for (var key in updates) {
    var colIndex = LEADS_HEADERS.indexOf(key);
    if (colIndex !== -1 && key !== "id") {
      row[colIndex] = updates[key];
    }
  }

  sheet.getRange(rowNum, 1, 1, LEADS_HEADERS.length).setValues([row]);
  return getLead(id);
}

function updateLeadStage(id, stage) {
  return updateLead(id, { stage: stage });
}

// ==================== TASKS ====================

function getTasks(leadId) {
  var sheet = getSheet("Tasks");
  var all = sheetToObjects(sheet, TASKS_HEADERS);
  if (leadId) {
    return all.filter(function(t) { return t.lead_id === leadId; });
  }
  return all;
}

function createTask(task) {
  var sheet = getSheet("Tasks");
  var id = generateId();
  var now = new Date().toISOString().split("T")[0];

  var row = [
    id,
    task.lead_id || "",
    task.task_title || "",
    task.due_date || "",
    task.assigned_user || "",
    task.status || "Pending",
    now
  ];

  sheet.appendRow(row);

  var result = {};
  for (var i = 0; i < TASKS_HEADERS.length; i++) {
    result[TASKS_HEADERS[i]] = row[i];
  }
  return result;
}

function updateTask(id, updates) {
  var sheet = getSheet("Tasks");
  var rowNum = findRowById(sheet, id);
  if (rowNum === -1) throw new Error("Task not found: " + id);

  var row = sheet.getRange(rowNum, 1, 1, TASKS_HEADERS.length).getValues()[0];

  for (var key in updates) {
    var colIndex = TASKS_HEADERS.indexOf(key);
    if (colIndex !== -1 && key !== "id") {
      row[colIndex] = updates[key];
    }
  }

  sheet.getRange(rowNum, 1, 1, TASKS_HEADERS.length).setValues([row]);

  var result = {};
  for (var i = 0; i < TASKS_HEADERS.length; i++) {
    result[TASKS_HEADERS[i]] = row[i];
  }
  return result;
}

// ==================== MEETINGS ====================

function getMeetings(leadId) {
  var sheet = getSheet("Meetings");
  var all = sheetToObjects(sheet, MEETINGS_HEADERS);
  if (leadId) {
    return all.filter(function(m) { return m.lead_id === leadId; });
  }
  return all;
}

function scheduleMeeting(meeting) {
  var sheet = getSheet("Meetings");
  var id = generateId();
  var now = new Date().toISOString().split("T")[0];

  // Create Google Calendar event
  var meetLink = "";
  try {
    var startDateTime = new Date(meeting.date + "T" + meeting.time + ":00");
    var endDateTime = new Date(startDateTime.getTime() + (meeting.duration || 30) * 60000);

    var event = CalendarApp.getCalendarById(CALENDAR_ID).createEvent(
      meeting.title,
      startDateTime,
      endDateTime,
      {
        description: meeting.notes || "",
        guests: meeting.attendees || "",
        sendInvites: true
      }
    );

    // Try to add Google Meet conferencing
    try {
      event.setConferenceData(
        ConferenceDataService.newConferenceDataBuilder(
          ConferenceDataService.ConferenceSolutionType.HANGOUTS_MEET
        ).build()
      );
      // Refresh to get the meet link
      var calEvent = CalendarApp.getCalendarById(CALENDAR_ID).getEventById(event.getId());
      if (calEvent) {
        var hangoutLink = calEvent.getHangoutLink && calEvent.getHangoutLink();
        if (hangoutLink) meetLink = hangoutLink;
      }
    } catch (confErr) {
      // Conference data may not be available, continue without meet link
      Logger.log("Could not add Meet link: " + confErr.message);
    }
  } catch (calErr) {
    Logger.log("Calendar error: " + calErr.message);
  }

  var row = [
    id,
    meeting.lead_id || "",
    meeting.title || "",
    meeting.date || "",
    meeting.time || "",
    meeting.duration || 30,
    meeting.attendees || "",
    meetLink,
    meeting.notes || "",
    now
  ];

  sheet.appendRow(row);

  var result = {};
  for (var i = 0; i < MEETINGS_HEADERS.length; i++) {
    result[MEETINGS_HEADERS[i]] = row[i];
  }
  return result;
}

// ==================== EMAILS ====================

function getEmails(leadId) {
  var sheet = getSheet("Email_Log");
  var all = sheetToObjects(sheet, EMAIL_LOG_HEADERS);
  if (leadId) {
    return all.filter(function(e) { return e.lead_id === leadId; });
  }
  return all;
}

function sendEmailAction(email) {
  var sheet = getSheet("Email_Log");
  var id = generateId();
  var now = new Date().toISOString().split("T")[0];

  // Send email via Gmail
  try {
    GmailApp.sendEmail(
      email.to,
      email.subject,
      email.body,
      { name: email.sent_by || "SalesCRM" }
    );
  } catch (mailErr) {
    throw new Error("Failed to send email: " + mailErr.message);
  }

  var row = [
    id,
    email.lead_id || "",
    email.to || "",
    email.subject || "",
    email.body || "",
    now,
    email.sent_by || ""
  ];

  sheet.appendRow(row);

  var result = {};
  for (var i = 0; i < EMAIL_LOG_HEADERS.length; i++) {
    result[EMAIL_LOG_HEADERS[i]] = row[i];
  }
  return result;
}

// ==================== DASHBOARD ====================

function getDashboardStats() {
  var leads = getLeads();
  var meetings = getMeetings();

  var totalLeads = leads.length;
  var dealsWon = 0;
  var dealsLost = 0;
  var pipelineValue = 0;
  var leadsByStage = {
    "New Lead": 0,
    "Discovery": 0,
    "Demo": 0,
    "Proposal": 0,
    "Negotiation": 0,
    "Closed Won": 0,
    "Closed Lost": 0
  };

  for (var i = 0; i < leads.length; i++) {
    var lead = leads[i];
    var stage = lead.stage;

    if (leadsByStage.hasOwnProperty(stage)) {
      leadsByStage[stage]++;
    }

    if (stage === "Closed Won") {
      dealsWon++;
      pipelineValue += Number(lead.deal_value) || 0;
    } else if (stage === "Closed Lost") {
      dealsLost++;
    } else {
      pipelineValue += Number(lead.deal_value) || 0;
    }
  }

  return {
    totalLeads: totalLeads,
    dealsWon: dealsWon,
    dealsLost: dealsLost,
    meetingsScheduled: meetings.length,
    pipelineValue: pipelineValue,
    leadsByStage: leadsByStage
  };
}

// ==================== SETUP ====================

/**
 * Run this function ONCE to create the sheet headers.
 * Go to Apps Script editor > Run > setupSheets
 */
function setupSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  var sheetsConfig = [
    { name: "Leads", headers: LEADS_HEADERS },
    { name: "Tasks", headers: TASKS_HEADERS },
    { name: "Meetings", headers: MEETINGS_HEADERS },
    { name: "Email_Log", headers: EMAIL_LOG_HEADERS }
  ];

  for (var i = 0; i < sheetsConfig.length; i++) {
    var config = sheetsConfig[i];
    var sheet = ss.getSheetByName(config.name);

    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }

    // Set headers in row 1
    sheet.getRange(1, 1, 1, config.headers.length).setValues([config.headers]);
    sheet.getRange(1, 1, 1, config.headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  Logger.log("Sheets setup complete!");
}

// ==================== DAILY TASK REMINDERS ====================

/**
 * Set up a daily trigger for this function.
 * Go to Apps Script > Triggers > Add trigger > sendTaskReminders > Time-driven > Day timer
 */
function sendTaskReminders() {
  var tasks = getTasks();
  var today = new Date().toISOString().split("T")[0];

  for (var i = 0; i < tasks.length; i++) {
    var task = tasks[i];
    if (task.due_date === today && task.status !== "Done") {
      // Find the lead to get context
      var leadInfo = "";
      try {
        var lead = getLead(task.lead_id);
        leadInfo = " (Lead: " + lead.company + ")";
      } catch (e) {
        // Lead not found, skip context
      }

      // Send reminder to the assigned user
      // NOTE: In production, map assigned_user to their email addresses
      Logger.log(
        "REMINDER: Task '" + task.task_title + "' is due today. " +
        "Assigned to: " + task.assigned_user + leadInfo
      );

      // Uncomment and configure actual email sending:
      // var userEmail = getUserEmail(task.assigned_user);
      // if (userEmail) {
      //   GmailApp.sendEmail(
      //     userEmail,
      //     "Task Due Today: " + task.task_title,
      //     "Your task '" + task.task_title + "' is due today." + leadInfo +
      //     "\n\nPlease update the status in SalesCRM.",
      //     { name: "SalesCRM Reminders" }
      //   );
      // }
    }
  }
}
