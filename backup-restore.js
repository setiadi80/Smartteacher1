// ===== backup-restore.js (STABLE 3 LAYER FINAL) =====

// ================= TOAST =================
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.position = "fixed";
    t.style.bottom = "80px";
    t.style.left = "50%";
    t.style.transform = "translateX(-50%)";
    t.style.background = "black";
    t.style.color = "gold";
    t.style.padding = "10px 20px";
    t.style.borderRadius = "10px";
    t.style.zIndex = "999";
    t.style.fontSize = "0.85em";
    t.style.display = "none";
    document.body.appendChild(t);
  }
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(() => t.style.display = "none", 2000);
}


// ================= INDEXED DB =================
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("SmartTeacherDB", 1);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("dataStore")) {
        db.createObjectStore("dataStore");
      }
    };

    request.onsuccess = e => resolve(e.target.result);
    request.onerror = e => reject(e.target.error);
  });
}

async function saveToIndexedDB(key, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("dataStore", "readwrite");
    tx.objectStore("dataStore").put(data, key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = e => reject(e.target.error);
  });
}

async function getFromIndexedDB(key) {
  const db = await openDB();
  return new Promise(resolve => {
    const tx = db.transaction("dataStore", "readonly");
    const req = tx.objectStore("dataStore").get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}


// ================= SYNC 3 LAYER =================
async function syncStorage(key, data, withDownload = false) {

  if (!key || typeof key !== "string") {
    throw new Error("Key tidak valid");
  }

  // 1️⃣ LocalStorage
  localStorage.setItem(key, JSON.stringify(data));

  // 2️⃣ IndexedDB
  await saveToIndexedDB(key, data);

  // 3️⃣ Manual Download (jika diminta)
  if (withDownload) {

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const now = new Date();
    const tanggal =
      String(now.getDate()).padStart(2, "0") +
      String(now.getMonth() + 1).padStart(2, "0") +
      now.getFullYear();

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${key}-${tanggal}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }
}


// ================= BACKUP =================
async function backupData(key, data) {
  try {
    await syncStorage(key, data, true);
    showToast("Backup sukses (Local + IndexedDB + File)");
  } catch (err) {
    console.error("BACKUP ERROR:", err);
    showToast("Backup gagal: " + err.message);
  }
}


// ================= RESTORE =================
function restoreData(key, callback) {

  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.addEventListener("change", async function (e) {

    const file = e.target.files[0];
    if (!file) {
      showToast("File tidak dipilih");
      return;
    }

    const reader = new FileReader();

    reader.onload = async function (event) {

      try {
        const data = JSON.parse(event.target.result);

        await syncStorage(key, data, false);

        showToast("Restore berhasil");

        if (typeof callback === "function") {
          callback();
        }

      } catch (err) {
        console.error(err);
        showToast("File JSON tidak valid");
      }

    };

    reader.readAsText(file);
  });

  input.click();
}


// ================= LOAD STORAGE =================
async function loadStorage(key) {

  const local = localStorage.getItem(key);
  if (local) {
    return JSON.parse(local);
  }

  const idb = await getFromIndexedDB(key);
  return idb;
}


// ================= UI GENERATOR =================
function createBackupRestoreUI(key, dataRef, callback) {

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.gap = "6px";
  container.style.marginTop = "8px";

  const btnBackup = document.createElement("button");
  btnBackup.innerText = "Backup";
  btnBackup.style.flex = "1";
  btnBackup.onclick = () => backupData(key, dataRef);

  const btnRestore = document.createElement("button");
  btnRestore.innerText = "Restore";
  btnRestore.style.flex = "1";
  btnRestore.onclick = () => restoreData(key, callback);

  container.appendChild(btnBackup);
  container.appendChild(btnRestore);

  return container;
}
function triggerRestore() {
  restoreData('biodataGuru', async function() {
    const data = await loadStorage('biodataGuru');
    if (data) {
      biodata = data;
      sessionStorage.setItem("biodataGuru", JSON.stringify(biodata));
      loadData();
      showToast("Data berhasil dimuat");
    }
  });
}

// ================= GLOBAL EXPORT =================
window.backupData = backupData;
window.restoreData = restoreData;
window.loadStorage = loadStorage;
window.createBackupRestoreUI = createBackupRestoreUI;