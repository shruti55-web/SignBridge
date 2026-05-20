document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await signUpUser(email, password);

  if (error) {
    document.getElementById("signupMessage").innerText = error.message;
    return;
  }

  alert("Signup successful!");
  window.location.href = "login.html";
});