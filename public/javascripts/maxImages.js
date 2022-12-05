const imagesUpload = document.querySelector("#images");
const modalButton = document.querySelector("#modalbtn");
const form = document.querySelector(".images-form");

if (form) {
  form.addEventListener("submit", function (e) {
    //Check for number of files in the images input
    if (imagesUpload.files.length > 3) {
      // If no. of files selected is greater than 3
      // disable form from submitting
      e.preventDefault();
      //Show modal
      modalButton.click();
    }
  });
}
  