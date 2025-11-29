const passwordBox = document.getElementById("passBox");
const inputSlider = document.getElementById("inputSlider");
const sliderValue = document.getElementById("sliderValue");
const lowercase = document.getElementById("lowercase");
const uppercase = document.getElementById("uppercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");
const generateButton = document.getElementById("genBtn");
const copyIcon = document.getElementById("copyIcon");

/***********************************   Slider Value Show   ********************************/

sliderValue.innerText = inputSlider.value;
inputSlider.addEventListener("input", () => {
  sliderValue.innerText = inputSlider.value;
});

/***********************************  Generate Button   ********************************/

generateButton.addEventListener("click", () => {
  passwordBox.value = generatePassword();
});
/***********************************   Password Generate  ********************************/

const allUpperCase = "QAZWSXEDCRFVTGBYHNUJMIKLOP";
const allLowerCase = "qazwsxedcrfvtgbyhnujmiklop";
const allNumbers = "0123456789";
const allSymbols = "!@#$%^&*";

function generatePassword() {
  let genPassword = "";
  let allCharacter = "";

  allCharacter += lowercase.checked ? allLowerCase : "";
  allCharacter += uppercase.checked ? allUpperCase : "";
  allCharacter += numbers.checked ? allNumbers : "";
  allCharacter += symbols.checked ? allSymbols : "";

  if (allCharacter === "") {
    return genPassword;
  }
  let i = 1;

  while (i <= inputSlider.value) {
    genPassword += allCharacter.charAt(
      Math.floor(Math.random() * allCharacter.length)
    );
    i++;
  }
  return genPassword;
}

/***********************************   Copy Icon   ********************************/

copyIcon.addEventListener('click', () =>{
   if(passwordBox.value !== null){
    navigator.clipboard.writeText(passwordBox.value)
    copyIcon.innerHTML = "check"
    copyIcon.title = "Password Copied"
   }

   setTimeout(() =>{
    copyIcon.innerHTML = "content_copy"
    copyIcon.title = ""
   }, 3000)
})

window.addEventListener('beforeunload', (e) =>{
e.preventDefault();
e.returnValue = "Are You Sure ?"
})
