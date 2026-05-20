document.querySelector(".auth-form").addEventListener("submit", async (e) => {
  e.preventDefault();


  if (error) {
    alert(error.message);
    return;
  }

  window.location.href = "dashboard.html";
});