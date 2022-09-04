let loginForm = document.querySelector(".loginForm");
let getStartedBtn = document.querySelector(".btn-getStarted");
let getStartedPage = document.querySelector(".Page-getStarted");
let createAcct = document.querySelector(".login-aTag");
let registerForm = document.querySelector(".registerForm");
let Form = document.querySelector(".Form");
if (getStartedBtn) {
  getStartedBtn.addEventListener("click", function () {
    loginForm.classList.remove("hideElement");
    getStartedPage.classList.add("blur");
  });
}
let TestCases = document.querySelector(".TestCases");
// let AddTestcase = document.querySelector(".btn-AddTestcase");
let IOcontainer = document.querySelector(".IO-container");
// AddTestcase.addEventListener("click", );
document.getElementById("addTestCase").onclick = () => {
  TestCases.classList.add("hideElement");
  IOcontainer.classList.remove("hideElement");
};
var btnIOrunCOde = document.querySelector(".btn-IO-runCode");
var btnTestcase = document.querySelector(".btn-testcase");
var btnRunCodeResult = document.querySelector(".btn-runCodeResult");

btnIOrunCOde.addEventListener("click", () => {
  btnRunCodeResult.classList.add("btn-IO-default");
  btnTestcase.classList.remove("btn-IO-default");
  console.log("added color");
});

// document.querySelector(".run-code").addEventListener("click", () => {
//   // var loadingElement = document.querySelector(".loading-Element");
// });

document.getElementById("runCode").onclick = () => {
  var IOtextAreaContainer = document.querySelector(".IO-textArea-container");
  IOtextAreaContainer.classList.add("loading-Element");
  // var loadingElement = document.querySelector(".loading-Element");
  // var IOtextAreaContainer = document.querySelector(".IO-textArea-container");
  // IOtextAreaContainer.classList.add(loadingElement);
  let code = ed.getValue(); //document.querySelector("textarea"); //document.getElementById("codeMirror").value,
  // console.log("==>", code);
  // let ed.
  let input = document.getElementById("testCase").value,
    language = document.getElementById("language").value;
  if (language === "clike") language = "java";
  console.log("input is ", ROOM_ID, code, input, language);
  // console.log("IO emit", io.emit("execute"));
  io.emit("execute", ROOM_ID, code, language, input);
};
// let btnChat = document.querySelector(".btn-chat");
// let mediaList = document.querySelector(".media-list");
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
