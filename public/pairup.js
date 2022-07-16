var loginForm = document.querySelector(".loginForm");
var getStartedBtn = document.querySelector(".btn-getStarted");
var getStartedPage = document.querySelector(".Page-getStarted");
var createAcct = document.querySelector(".login-aTag");
var registerForm = document.querySelector(".registerForm");
var Form = document.querySelector(".Form");
if (getStartedBtn) {
  getStartedBtn.addEventListener("click", function () {
    loginForm.classList.remove("hideElement");
    getStartedPage.classList.add("blur");
  });
}
var TestCases = document.querySelector(".TestCases");
var AddTestcase = document.querySelector(".btn-AddTestcase");
var IOcontainer = document.querySelector(".IO-container");
AddTestcase.addEventListener("click", function () {
  TestCases.classList.add("hideElement");
  IOcontainer.classList.remove("hideElement");
});

// var btnChat = document.querySelector(".btn-chat");
// var mediaList = document.querySelector(".media-list");
// br = document.createElement("span");
// br.innerHTML = "<br/>";
// document.body.appendChild(br);
// btnChat.addEventListener("click", () => {
//   mediaList.append(br);
// });
// createAcct.addEventListener("click", function () {
//   registerForm.classList.remove("hideElement");
//   loginForm.classList.add("rotateNegative");
//   registerForm.classList.remove("rotatePositive");
//   registerForm.classList.add("rotateNeutral");
// });
