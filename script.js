document
  .getElementById("cameraFileInput")
  .addEventListener("change", function () {
    document
      .getElementById("pictureFromCamera")
      .setAttribute("src", window.URL.createObjectURL(this.files[0]));
  });


// 獲取元素
const cameraButton = document.getElementById('cameraButton');
const previewImage = document.getElementById('previewImage');
const resultDiv = document.getElementById('result');
const retryButton = document.getElementById('retryButton');

// 創建一個隱藏的文件輸入元素來觸發相機
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.capture = 'environment'; // 優先使用後置相機

// 監聽相機按鈕點擊事件
cameraButton.addEventListener('click', function () {
  fileInput.click();
});

// 監聽文件輸入元素的變化事件
fileInput.addEventListener('change', function () {
  const file = fileInput.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    previewImage.src = objectURL;
    previewImage.style.display = 'block';

    // TODO: 將照片發送到後端進行辨識
    sendImageToServer(file);
  }
});

// 重新拍照功能
retryButton.addEventListener('click', function () {
  fileInput.value = ''; // 清空文件輸入元素
  previewImage.style.display = 'none';
  resultDiv.textContent = '結果: 等待辨識...';
  cameraButton.click(); // 重新觸發相機
});

// 將照片發送到後端進行辨識的函數
function sendImageToServer(file) {
  const formData = new FormData();
  formData.append('photo', file);

  fetch('/api/recognize', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.result) {
        resultDiv.textContent = '結果: ' + data.result;
      } else {
        resultDiv.textContent = '辨識失敗，請重試。';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      resultDiv.textContent = '發生錯誤，請重試。';
    });
}
