/**
 * Google Apps Script 코드 예시 (Code.gs)
 * 
 * 구글 스프레드시트 -> [확장 프로그램] -> [Apps Script] 에 아래 코드를 붙여넣고
 * [배포] -> [새 배포] -> 유형: 웹 앱 (Web App)
 * - 다음 사용자 권한으로 실행: 나 (Me)
 * - 액세스 권한이 있는 사용자: 모든 사용자 (Anyone)
 * 로 배포한 후 생성된 URL을 .env.local 의 GOOGLE_SHEET_API_URL 에 넣어주세요.
 */

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  
  if (rows.length <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var headers = rows[0];
  var records = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    records.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: true, data: records }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var postData = JSON.parse(e.postData.contents);
  var action = postData.action;
  
  // 첫 번째 행 헤더 초기화 검사
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "id", "category", "date", "author", "createdAt",
      "time", "title", "memo",
      "aircraftNumber", "flightDuration", "purposeAndRoute",
      "partOrItem", "details", "status"
    ]);
  }
  
  if (action === "create") {
    var data = postData.data;
    sheet.appendRow([
      data.id || Utilities.getUuid(),
      data.category || "",
      data.date || "",
      data.author || "",
      data.createdAt || new Date().toISOString(),
      data.time || "",
      data.title || "",
      data.memo || "",
      data.aircraftNumber || "",
      data.flightDuration || "",
      data.purposeAndRoute || "",
      data.partOrItem || "",
      data.details || "",
      data.status || ""
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "delete") {
    var targetId = postData.id;
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == targetId) {
        sheet.deleteRow(i + 1);
        return ContentService.createTextOutput(JSON.stringify({ success: true, id: targetId }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Not found" }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Unknown action" }))
    .setMimeType(ContentService.MimeType.JSON);
}
