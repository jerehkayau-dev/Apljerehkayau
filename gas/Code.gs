/**
 * Web App Silsilah Keluarga - Apps Script Backend
 * Terintegrasi dengan Google Sheets sebagai Database
 */

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Silsilah Keluarga - Database' )
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Mendapatkan referensi Tabel "Data Keluarga". 
 * Jika belum ada, otomatis buatkan beserta header, tebalkan font, dan bekukan baris pertama.
 */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "Data Keluarga";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = ["Nama Lengkap", "Pasangan", "Orang Tua", "Anak", "Tanggal Lahir", "Tanggal Meninggal", "Foto"];
    sheet.appendRow(headers);
    
    // Format Header (Tebal, latar biru, teks putih, dan freeze baris 1)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold")
               .setBackground("#0d6efd")
               .setFontColor("#ffffff")
               .setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

/**
 * Sanitasi nilai input guna mencegah celah keamanan Excel Formula/Formula Injection
 */
function sanitizeInput(val) {
  if (val === undefined || val === null) {
    return "";
  }
  var str = val.toString().trim();
  if (str.length > 0) {
    var firstChar = str.charAt(0);
    if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
      return "'" + str; // Tambah tanda petik satu di depan agar dianggap teks murni oleh Sheets
    }
  }
  return str;
}

/**
 * Mengambil semua data anggota keluarga dari Sheet terbaru
 */
function getData() {
  try {
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    var headers = data[0];
    var list = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var item = {};
      
      // Map data row ke key JSON frontend
      item.namaLengkap = row[0] ? row[0].toString() : "";
      item.pasangan = row[1] ? row[1].toString() : "";
      item.orangTua = row[2] ? row[2].toString() : "";
      item.anak = row[3] ? row[3].toString() : "";
      item.tanggalLahir = row[4] ? row[4].toString() : "";
      item.tanggalMeninggal = row[5] ? row[5].toString() : "";
      item.foto = row[6] ? row[6].toString() : "";
      
      list.push(item);
    }
    
    return list;
  } catch (err) {
    Logger.log("Error in getData: " + err.toString());
    throw new Error("Gagal memuat data dari Spreadsheet: " + err.toString());
  }
}

/**
 * Menyimpan data anggota keluarga (Insert atau Update)
 * Dilengkapi dengan LockService agar aman dari tabrakan data (Concurrency/Race Condition)
 */
function saveData(member, isUpdate, oldNamaLengkap) {
  // Aktifkan Lock pada tingkat naskah / program (Script Lock) dengan batas tenggat 10 detik
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) {
      throw new Error("Server sedang sibuk menangani request lain. Sila coba beberapa saat lagi.");
    }
    
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    
    // Lakukan sanitasi formula murni di backend
    var namaSanitasi = sanitizeInput(member.namaLengkap);
    var pasanganSanitasi = sanitizeInput(member.pasangan);
    var orangTuaSanitasi = sanitizeInput(member.orangTua);
    var anakSanitasi = sanitizeInput(member.anak);
    var tglLahirSanitasi = sanitizeInput(member.tanggalLahir);
    var tglWafatSanitasi = sanitizeInput(member.tanggalMeninggal);
    var fotoBase64 = member.foto || ""; // Foto disimpan dalam bentuk Base64
    
    var rowData = [
      namaSanitasi,
      pasanganSanitasi,
      orangTuaSanitasi,
      anakSanitasi,
      tglLahirSanitasi,
      tglWafatSanitasi,
      fotoBase64
    ];
    
    var foundIndex = -1;
    var searchName = isUpdate ? oldNamaLengkap : namaSanitasi;
    
    if (searchName) {
      searchName = searchName.toString().trim().toLowerCase();
      for (var i = 1; i < data.length; i++) {
        var currentSheetName = data[i][0] ? data[i][0].toString().trim().toLowerCase() : "";
        if (currentSheetName === searchName) {
          foundIndex = i + 1; // Konversi ke baris 1-indexed Google Sheets
          break;
        }
      }
    }
    
    if (foundIndex > -1) {
      // Perbarui baris yang sudah ada
      sheet.getRange(foundIndex, 1, 1, rowData.length).setValues([rowData]);
      
      // Sinkronisasi Integritas Referensial jika nama berubah
      var oldNameClean = oldNamaLengkap ? oldNamaLengkap.toString().trim() : "";
      var oldNameLower = oldNameClean.toLowerCase();
      var newNameClean = namaSanitasi.toString().trim();
      if (oldNameLower && newNameClean && oldNameLower !== newNameClean.toLowerCase()) {
        for (var i = 1; i < data.length; i++) {
          if (i + 1 === foundIndex) continue; // Jangan update baris data diri sendiri yang baru diubah
          
          var rPasangan = data[i][1] ? data[i][1].toString().trim() : "";
          var rOrangTua = data[i][2] ? data[i][2].toString().trim() : "";
          var rAnak = data[i][3] ? data[i][3].toString().trim() : "";
          
          var rowChanged = false;
          var updateRowData = [data[i][0], data[i][1], data[i][2], data[i][3], data[i][4], data[i][5], data[i][6]];
          
          if (rPasangan.toLowerCase() === oldNameLower) {
            updateRowData[1] = newNameClean;
            rowChanged = true;
          }
          if (rOrangTua.toLowerCase() === oldNameLower) {
            updateRowData[2] = newNameClean;
            rowChanged = true;
          }
          if (rAnak.toLowerCase() === oldNameLower) {
            updateRowData[3] = newNameClean;
            rowChanged = true;
          }
          
          if (rowChanged) {
            sheet.getRange(i + 1, 1, 1, updateRowData.length).setValues([updateRowData]);
          }
        }
      }
    } else {
      // Tambahkan baris baru di paling bawah
      sheet.appendRow(rowData);
    }
    
    // Auto resize
    sheet.autoResizeColumns(1, rowData.length);
    
    return { success: true, message: "Data keluarga berhasil disimpan!" };
  } catch (err) {
    Logger.log("Error in saveData: " + err.toString());
    throw new Error("Gagal menyimpan data keluarga: " + err.toString());
  } finally {
    lock.releaseLock(); // Selalu bebaskan kunci skrip
  }
}

/**
 * Menghapus data anggota keluarga berdasarkan Nama Lengkap yang unik
 */
function deleteData(namaLengkap) {
  var lock = LockService.getScriptLock();
  try {
    if (!lock.tryLock(10000)) {
      throw new Error("Server sibuk. Sila coba menghapus kembali.");
    }
    
    var sheet = getSheet();
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;
    var targetName = namaLengkap.toString().trim().toLowerCase();
    
    for (var i = 1; i < data.length; i++) {
      var currentSheetName = data[i][0] ? data[i][0].toString().trim().toLowerCase() : "";
      if (currentSheetName === targetName) {
        foundIndex = i + 1;
        break;
      }
    }
    
    if (foundIndex > -1) {
      sheet.deleteRow(foundIndex);
      
      // Sinkronisasi hapus referensi di baris lain agar tidak rusak (broken relation)
      var deletedNameLower = targetName;
      // Muat ulang data terbaru setelah baris dihapus
      var freshData = sheet.getDataRange().getValues();
      for (var i = 1; i < freshData.length; i++) {
        var rPasangan = freshData[i][1] ? freshData[i][1].toString().trim() : "";
        var rOrangTua = freshData[i][2] ? freshData[i][2].toString().trim() : "";
        var rAnak = freshData[i][3] ? freshData[i][3].toString().trim() : "";
        
        var rowChanged = false;
        var updateRowData = [freshData[i][0], freshData[i][1], freshData[i][2], freshData[i][3], freshData[i][4], freshData[i][5], freshData[i][6]];
        
        if (rPasangan.toLowerCase() === deletedNameLower) {
          updateRowData[1] = "";
          rowChanged = true;
        }
        if (rOrangTua.toLowerCase() === deletedNameLower) {
          updateRowData[2] = "";
          rowChanged = true;
        }
        if (rAnak.toLowerCase() === deletedNameLower) {
          updateRowData[3] = "";
          rowChanged = true;
        }
        
        if (rowChanged) {
          sheet.getRange(i + 1, 1, 1, updateRowData.length).setValues([updateRowData]);
        }
      }
      return { success: true, message: "Anggota keluarga berhasil dihapus!" };
    } else {
      throw new Error("Data anggota tidak ditemukan dalam database.");
    }
  } catch (err) {
    Logger.log("Error in deleteData: " + err.toString());
    throw new Error("Gagal menghapus data: " + err.toString());
  } finally {
    lock.releaseLock();
  }
}
