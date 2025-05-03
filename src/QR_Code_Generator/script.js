/*********************************  Button Select ******************************************************/

const inputText = document.getElementById("qr-text");
const sizes = document.getElementById("sizes");
const generateButton = document.getElementById("generateBtn");
const downloadButton = document.getElementById("downloadBtn");
const qrCodeCotainer = document.querySelector(".qr-body");

let QRSize = parseInt(sizes.value);

/*********************************  Generate Button functionality ******************************************************/

generateButton.addEventListener("click", (e) => {
  e.preventDefault();
  isEmptyInput();
});
/*********************************  Download Button functionality ******************************************************/

downloadButton.addEventListener("click", () => {
  let QRImg = document.querySelector(".qr-body img");
  if (QRImg !== null) {
    // QRImg.setAttribute.style ="border: 2px solid white; border-radius: 10px;"
    downloadButton.setAttribute("href", QRImg.getAttribute('src'));
  } else {
    downloadButton.setAttribute(
      "href",
      `${document.querySelector("canvas").toDataURL()}`
    );
  }
});

/*********************************  Check Input Field Empty or Not ******************************************************/

function isEmptyInput() {
  return inputText.value != ""
    ? generateQRCode()
    : alert("Please Type your text or URL");
}

/*********************************  Size Select ******************************************************/

sizes.addEventListener("change", (e) => {
  QRSize = parseInt(e.target.value);
  isEmptyInput();
});
/*********************************  Generate New QR Code ******************************************************/

function generateQRCode() {
  qrCodeCotainer.innerHTML = "";
  new QRCode(qrCodeCotainer, {
    text: inputText.value,
    height: QRSize,
    width: QRSize,
    colorLight: "#ffffff",
    colorDark: "#212121",
  });
}
