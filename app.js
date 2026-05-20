async function checkUser() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  const currentPage = window.location.pathname.split("/").pop();
  const publicPages = ["login.html", "signup.html", "index.html"];

  if (!user && !publicPages.includes(currentPage)) {
    window.location.href = "login.html";
    return;
  }

  if (user) {
    const userName = document.getElementById("userName");
    const userEmail = document.getElementById("userEmail");

    if (userName) userName.innerText = user.email.split("@")[0];
    if (userEmail) userEmail.innerText = user.email;
  }
}

checkUser();

async function logout() {
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}