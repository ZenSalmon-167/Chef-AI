
/**
 * ระบบ Backend สำหรับ Chef Gemini AI
 * โครงสร้าง 8 คอลัมน์ตามที่อาจารย์กำหนด
 */

const SHEET_NAME = 'ชีต1';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = ['วัน/เวลา', 'ชื่อ', 'ระดับชั้น', 'แผนก', 'ชื่ออาหาร', 'วัตถุดิบ', 'วิธีการ', 'STYLE'];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#ff9800").setFontColor("white");
    }

    const p = e.parameter;
    const newRow = [
      new Date(),           // 0: วัน/เวลา
      p.submitter || "-",    // 1: ชื่อ
      p.year || "-",         // 2: ระดับชั้น
      p.department || "-",   // 3: แผนก
      p.title || "-",        // 4: ชื่ออาหาร
      p.ingredients || "-",  // 5: วัตถุดิบ
      p.instructions || "-", // 6: วิธีการ (ผลลัพธ์จาก AI)
      p.style || "-"         // 7: STYLE
    ];
    
    sheet.appendRow(newRow);
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (error) {
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return returnJSON([]);

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return returnJSON([]);

    const rows = data.slice(1);
    
    // ดึง 8 ฟิลด์ตามลำดับ
    const result = rows.map(row => ({
      timestamp: row[0] instanceof Date ? Utilities.formatDate(row[0], "GMT+7", "dd/MM/yyyy HH:mm") : row[0].toString(),
      submitter: row[1],
      year: row[2],
      department: row[3],
      title: row[4],
      ingredients: row[5],
      instructions: row[6],
      style: row[7]
    })).reverse();
    
    return returnJSON(result);
  } catch (error) {
    return returnJSON({error: error.toString()});
  }
}

function returnJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
