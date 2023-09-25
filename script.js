
//window.addEventListener('load', yourFunction, false);
// OR: 
//window.addEventListener('DOMContentLoaded', yourFunction, false);

// if (typeof window !== "undefined") {
//   document
//     .getElementById("cameraFileInput")
//     .addEventListener("change", function () {
//       document
//         .getElementById("pictureFromCamera")
//         .setAttribute("src", window.URL.createObjectURL(this.files[0]));
//     });
// }
// else {
//   console.log("In nodeJS");
// }

document
  .getElementById("cameraFileInput")
  .addEventListener("change", function () {
    document
      .getElementById("pictureFromCamera")
      .setAttribute("src", window.URL.createObjectURL(this.files[0]));
  });
