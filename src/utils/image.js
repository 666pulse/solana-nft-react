
function base64ToBlob(base64) {
  var arr = base64.split(','),
    mime = arr[0].match(/:(.\*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime,
  });
}

function blobToFile(blob, fileName) {
  return new File([blob], fileName);
}

export const base64ToFile = (base64, fileName) => {
  const blob = base64ToBlob(base64);
  return blobToFile(blob, fileName);
};

export const getBase64 = async (imgFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      resolve(reader.result);
    });
    reader.addEventListener('error', () => {
      reject('file reader error');
    });
    reader.readAsDataURL(imgFile);
  });
};
