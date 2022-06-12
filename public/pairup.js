var loginForm = document.querySelector(".loginForm");
var getStartedBtn = document.querySelector(".btn-getStarted");
var getStartedPage = document.querySelector(".Page-getStarted");
var createAcct = document.querySelector(".login-aTag");
var registerForm = document.querySelector(".registerForm");
var Form = document.querySelector(".Form");
getStartedBtn.addEventListener("click", function () {
  loginForm.classList.remove("hideElement");
  getStartedPage.classList.add("blur");
});

// createAcct.addEventListener("click", function () {
//   registerForm.classList.remove("hideElement");
//   loginForm.classList.add("rotateNegative");
//   registerForm.classList.remove("rotatePositive");
//   registerForm.classList.add("rotateNeutral");
// });
