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



module.exports = {
  authorizeB2,
  createFolderOnB2,
 
};
