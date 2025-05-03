const inputBox = document.getElementById("inputBox");
const buttons = document.querySelectorAll("button");
let ansString = "";

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {

    // Equal Button Functionality

    if (e.target.innerHTML === "=") {
        
        if(ansString.length <= 1){
            alert("Not Calculatable")
            inputBox.value = ""
            return
        }
        else{
      ansString = eval(ansString);
      inputBox.value = ansString;
      return
        }
    }

// DEl Button Functionality

else if(e.target.innerHTML === "DEL"){
    ansString = ansString.substring(0, (ansString.length - 1));
    inputBox.value = ansString
return
}
    // AC Button Functionality

    if (e.target.innerHTML === "AC") {
      ansString = "";
      inputBox.value = ansString;
    }

    else{
    ansString += e.target.innerHTML;
    inputBox.value = ansString
    inputBox.scrollLeft = inputBox.scrollWidth;
    }
  });
});
