const B2 = require("backblaze-b2");
const fs = require("fs");
const path = require("path");

// Замените 'yourAccountId', 'yourApplicationKey', 'yourBucketName' на ваши значения
const accountId = "00572ea10c3b91f0000000001";
const applicationKey = "K0050T80cVLTjnjA7shAbcomWqIOtX4";
const bucketName = "Test";

const b2 = new B2({
  accountId: accountId,
  applicationKey: applicationKey,
});

async function authorizeB2() {
  const { data } = await b2.authorize();

  console.log(data);
}

async function createFolderOnB2(folderName) {
  try {
    const params = {
      accountId: accountId,
      bucketName: folderName,
      bucketType: "allPublic",
    };

    await b2.createBucket(params);

    console.log(`Папка ${folderName} создана на B2 Cloud Storage`);
  } catch (error) {
    console.error("Ошибка создания папки на B2 Cloud Storage:", error);
  }
}

async function uploadFileToB2(folderName, localFilePath) {
  try {
    const fileContent = fs.readFileSync(localFilePath);

    // Указываем параметры для загрузки файла
    const params = {
      fileName: `${folderName}/${path.basename(localFilePath)}`,
      contentLength: fileContent.length,
      data: fileContent,

      onUploadProgress: (event) => {
        // Обработчик прогресса загрузки
        console.log("Upload progress:", event);
      },
    };

    console.log(params);
    await b2.uploadFile(params);
    console.log("Файл загружен на B2 Cloud Storage");
  } catch (error) {
    console.error("Ошибка загрузки файла на B2 Cloud Storage:", error);
  }
}

async function downloadFileFromB2(folderName, remoteFileName, localFilePath) {
  try {
    const params = {
      Bucket: bucketName,
      Key: `${folderName}/${remoteFileName}`,
    };
    const file = fs.createWriteStream(localFilePath);
    const result = await b2.downloadFile(params);
    result.data.pipe(file);
    console.log("Файл скачан с B2 Cloud Storage");
  } catch (error) {
    console.error("Ошибка скачивания файла с B2 Cloud Storage:", error);
  }
}

module.exports = {
  authorizeB2,
  createFolderOnB2,
  uploadFileToB2,
  downloadFileFromB2,
};
