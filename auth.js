// =====================================
// SMARTTEACHER AUTH MODULE - FINAL
// =====================================

const SESSION_TIME = 30 * 60 * 1000; // 30 menit

// ================= HASH SHA-256 =================
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ================= AMBIL DATA =================
function getAuthData() {
    try {
        return JSON.parse(localStorage.getItem("biodataGuru"));
    } catch (e) {
        localStorage.removeItem("biodataGuru");
        return null;
    }
}

// ================= INSTALL PERTAMA =================
async function createDefaultAuth() {
    const defaultPassHash = await hashPassword("a");
    const defaultRecoveryHash = await hashPassword("admin123");
    
    const defaultData = {
        guru: { nama: "Admin" },
        password: defaultPassHash,
        recoveryCode: defaultRecoveryHash
    };
    
    localStorage.setItem("biodataGuru", JSON.stringify(defaultData));
    return defaultData;
}

// ================= LOGIN =================
async function login() {
    
    const pass = document.getElementById("password").value.trim();
    const info = document.getElementById("infoLogin");
    
    if (!pass) {
        info.innerText = "Password wajib diisi";
        info.style.color = "red";
        return;
    }
    
    let biodata = getAuthData();
    if (!biodata) biodata = await createDefaultAuth();
    
    const inputHash = await hashPassword(pass);
    
    if (inputHash === biodata.password) {
        
        const session = {
            username: biodata.guru.nama,
            uid: "guru-1",
            loginTime: Date.now(),
            expired: Date.now() + SESSION_TIME
        };
        
        localStorage.setItem("sessionLogin", JSON.stringify(session));
        window.location.replace("index.html");
        
    } else {
        info.innerText = "Password salah!";
        info.style.color = "red";
    }
}

// ================= CEK SESSION =================
function cekSession() {
    
    let session;
    
    try {
        session = JSON.parse(localStorage.getItem("sessionLogin"));
    } catch (e) {
        localStorage.removeItem("sessionLogin");
        session = null;
    }
    
    if (!session || Date.now() > session.expired) {
        localStorage.removeItem("sessionLogin");
        window.location.href = "login.html";
        return;
    }
    
    session.expired = Date.now() + SESSION_TIME;
    localStorage.setItem("sessionLogin", JSON.stringify(session));
    
    const el = document.getElementById("namaUser");
    if (el) el.textContent = session.username;
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("sessionLogin");
    window.location.href = "login.html";
}

// ================= GANTI PASSWORD =================
async function changePassword(oldPass, newPass) {
    
    if (!oldPass || !newPass)
        return "Lengkapi password lama & baru";
    
    let biodata = getAuthData();
    if (!biodata) return "Data tidak ditemukan";
    
    const oldHash = await hashPassword(oldPass);
    
    if (oldHash !== biodata.password)
        return "Password lama salah";
    
    biodata.password = await hashPassword(newPass);
    localStorage.setItem("biodataGuru", JSON.stringify(biodata));
    
    return "Password berhasil diganti";
}

// ================= GANTI RECOVERY =================
async function changeRecovery(oldRecovery, newRecovery) {
    
    if (!oldRecovery || !newRecovery)
        return "Lengkapi recovery lama & baru";
    
    let biodata = getAuthData();
    if (!biodata) return "Data tidak ditemukan";
    
    const oldHash = await hashPassword(oldRecovery);
    
    if (oldHash !== biodata.recoveryCode)
        return "Recovery lama salah";
    
    biodata.recoveryCode = await hashPassword(newRecovery);
    localStorage.setItem("biodataGuru", JSON.stringify(biodata));
    
    return "Recovery berhasil diganti";
}

// ================= RESET PASSWORD =================
async function resetPassword(recoveryInput) {
    
    if (!recoveryInput)
        return "Masukkan recovery code";
    
    let biodata = getAuthData();
    if (!biodata) return "Data tidak ditemukan";
    
    const inputHash = await hashPassword(recoveryInput);
    
    if (inputHash !== biodata.recoveryCode)
        return "Recovery code salah";
    
    biodata.password = await hashPassword("a");
    localStorage.setItem("biodataGuru", JSON.stringify(biodata));
    
    return "Password direset ke default (a)";
}

// ================= INIT =================
function initAuth() {
    const page = window.location.pathname.split("/").pop().toLowerCase();
    if (page !== "login.html") cekSession();
}

document.addEventListener("DOMContentLoaded", initAuth);