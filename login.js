const PASSWORD_DEFAULT = "a";
const SESSION_TIME = 30 * 60 * 1000;

document.addEventListener("DOMContentLoaded", autoLogin);

function autoLogin() {
  
  try {
    
    const session = JSON.parse(localStorage.getItem("sessionLogin"));
    
    if (session && Date.now() < session.expired) {
      window.location.replace("index.html");
    }
    
  } catch (e) {
    localStorage.removeItem("sessionLogin");
  }
  
}

function login() {
  
  const pass = document.getElementById("password").value.trim();
  const info = document.getElementById("infoLogin");
  
  if (!pass) {
    info.innerText = "Password wajib diisi";
    return;
  }
  
  let biodata = JSON.parse(localStorage.getItem("biodataGuru")) || {};
  let password = biodata.password || PASSWORD_DEFAULT;
  
  if (pass === password) {
    
    const session = {
      username: "ADMIN GURU",
      loginTime: Date.now(),
      expired: Date.now() + SESSION_TIME
    };
    
    localStorage.setItem("sessionLogin", JSON.stringify(session));
    
    window.location.replace("index.html");
    
  } else {
    info.innerText = "Password salah!";
  }
  
}