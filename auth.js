// auth.js

// 🔹 SIGN UP
async function signUpUser(email, password) {
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  return { data, error };
}


// 🔹 LOGIN
async function loginUser(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  return { data, error };
}


// 🔹 LOGOUT
async function logoutUser() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}


// 🔹 CHECK USER (Protect Pages Like Dashboard)
async function checkUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  console.log("User logged in:", user.email);
}


// 🔹 Automatically check user when page loads
// document.addEventListener("DOMContentLoaded", () => {
  //checkUser();
//});