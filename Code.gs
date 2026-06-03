const SHEET_ID = "1Tft9Vbqre6mkodPSbOzuTQKX-s83pL0r7FGKbjZeJ8Y";
const USER_SHEET = "Users";
const SELECTION_SHEET = "Selections";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const action = data.action;

    if (action === "register") return register(data);
    if (action === "login") return login(data);
    if (action === "saveSelections") return saveSelections(data);
    if (action === "getMySelections") return getMySelections(data);
    if (action === "getAllSelections") return getAllSelections(data);

    return json({ success: false, message: "未知的操作。" });
  } catch (err) {
    return json({ success: false, message: err.message });
  }
}

function doGet() {
  return json({ success: true, message: "Course Record API is running." });
}

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function setupSheets() {
  const users = getSheet(USER_SHEET);
  if (users.getLastRow() === 0) {
    users.appendRow(["username", "passwordHash", "role", "createdAt"]);
  }

  const selections = getSheet(SELECTION_SHEET);
  if (selections.getLastRow() === 0) {
    selections.appendRow(["username", "dept", "courseName", "credit", "status", "updatedAt"]);
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function hashPassword(password) {
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password));
  return raw.map(b => {
    const v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join("");
}

function getRows(sheet) {
  if (sheet.getLastRow() === 0) return [];
  return sheet.getDataRange().getValues();
}

function register(data) {
  setupSheets();
  const username = String(data.username || "").trim();
  const password = String(data.password || "").trim();

  if (!username || !password) return json({ success: false, message: "請輸入帳號與密碼。" });
  if (password.length < 4) return json({ success: false, message: "密碼至少需要 4 個字元。" });

  const users = getSheet(USER_SHEET);
  const rows = getRows(users);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === username) {
      return json({ success: false, message: "這個帳號已經被註冊。" });
    }
  }

  users.appendRow([username, hashPassword(password), "user", new Date()]);
  return json({ success: true, message: "註冊成功，請登入。" });
}

function login(data) {
  setupSheets();
  const username = String(data.username || "").trim();
  const password = String(data.password || "").trim();
  const passwordHash = hashPassword(password);

  const users = getSheet(USER_SHEET);
  const rows = getRows(users);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === username && String(rows[i][1]) === passwordHash) {
      return json({ success: true, message: "登入成功。", role: String(rows[i][2] || "user") });
    }
  }

  return json({ success: false, message: "帳號或密碼錯誤。" });
}

function saveSelections(data) {
  setupSheets();
  const username = String(data.username || "").trim();
  const selections = Array.isArray(data.selections) ? data.selections : [];
  if (!username) return json({ success: false, message: "缺少帳號。" });

  const sheet = getSheet(SELECTION_SHEET);
  const rows = getRows(sheet);

  for (let i = rows.length - 1; i >= 1; i--) {
    if (String(rows[i][0]) === username) {
      sheet.deleteRow(i + 1);
    }
  }

  selections.forEach(item => {
    sheet.appendRow([
      username,
      item.dept || "",
      item.courseName || "",
      Number(item.credit || 0),
      item.status || "",
      new Date()
    ]);
  });

  return json({ success: true, message: "選課紀錄已儲存。" });
}

function getMySelections(data) {
  setupSheets();
  const username = String(data.username || "").trim();
  const sheet = getSheet(SELECTION_SHEET);
  const rows = getRows(sheet);
  const result = [];

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === username) {
      result.push(rowToSelection(rows[i]));
    }
  }

  return json({ success: true, data: result });
}

function getAllSelections(data) {
  setupSheets();
  const username = String(data.username || "").trim();

  if (!isAdmin(username)) {
    return json({ success: false, message: "權限不足，只有最高管理員可以查看所有紀錄。" });
  }

  const sheet = getSheet(SELECTION_SHEET);
  const rows = getRows(sheet);
  const result = [];

  for (let i = 1; i < rows.length; i++) {
    result.push(rowToSelection(rows[i]));
  }

  return json({ success: true, data: result });
}

function isAdmin(username) {
  const users = getSheet(USER_SHEET);
  const rows = getRows(users);

  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === username && String(rows[i][2]) === "admin") {
      return true;
    }
  }
  return false;
}

function rowToSelection(row) {
  return {
    username: String(row[0] || ""),
    dept: String(row[1] || ""),
    courseName: String(row[2] || ""),
    credit: Number(row[3] || 0),
    status: String(row[4] || ""),
    updatedAt: row[5] ? Utilities.formatDate(new Date(row[5]), Session.getScriptTimeZone(), "yyyy/MM/dd HH:mm:ss") : ""
  };
}
