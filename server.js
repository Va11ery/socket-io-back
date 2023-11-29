const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const multer = require("multer");
const cors = require("cors");
const book = require('./book')

const app = express();

const server = http.createServer(app);

app.use(express.json()); // Для разбора JSON из запросов
app.use(cors());
app.use('/',book)



// Мап для хранения паролей и пользовательских данных
const passwordMap = new Map();

// Опции для CORS
const corsOptions = {
  origin: "http://localhost:5000",
  methods: ["GET", "POST"],
};

// Подключение socket.io с опциями CORS
const io = socketIO(server, {
  cors: corsOptions,
});

// Подключаем функции работы с B2 Cloud Storage
const b2Functions = require("./b2"); // Замените на путь к вашему файлу с функциями

app.post(`/createFolder`, async (req, res) => {
  if (!req.body.nameFolder) {
    res.send("Напишите название папки");
  } else {
    await b2Functions.authorizeB2();
    await b2Functions.createFolderOnB2(req.body.nameFolder);

    res.send("Папка создана на B2 Cloud Storage");
  }
});

// Определяем маршруты с помощью Express
app.get("/", (req, res) => {
  res.send("Hellow World");
});

// Обработчик события при подключении клиента
io.on("connection", (socket) => {
  console.log("Пользователь подключен");

  // Обработчик события при отключении клиента
  socket.on("disconnect", () => {
    console.log("Пользователь отключен");
  });

  // Обработчик события для аутентификации
  socket.on("authenticate", (password, callback) => {
    if (password === "0816") {
      passwordMap.set(socket.id, { authenticated: true });
      io.emit("authenticate", true);
      callback(true, null);
    } else {
      passwordMap.set(socket.id, { authenticated: false });
      io.emit("authenticate", false);
      callback(false, "Не правильный пароль");
    }
  });

  // Обработчик события для передачи пользовательских данных
  socket.on("sendUserData", (userData, callback) => {
    const user = passwordMap.get(socket.id);
    if (user && user.authenticated) {
      io.emit("sendUserData", validateUserData(userData));
    } else {
    }
  });

  // Обработчик события для принятия сообщения от клиента и его широковещательной отправки
  socket.on("chat message", (msg) => {
    console.log("chat message - ", msg);
    io.emit("chat message", msg);
  });
});

// Пример функции валидации данных
function validateUserData(msg) {
  // Пример простой валидации (замените на свою логику)
  if (typeof msg !== "string") {
    return false;
  }

  return calculateSimpleHash(msg);
}

// Пример функции для вычисления простого хеша
function calculateSimpleHash(msg) {
  let hash = 0;

  // Сумма ASCII кодов первой, второй и последней букв
  hash += msg.charCodeAt(0);
  hash += msg.charCodeAt(1);
  hash += msg.charCodeAt(msg.length - 1);

  return hash;
}

// Запуск сервера на порту 3000
server.listen(3000, () => {
  console.log("Сервер запущен на порту 3000");
});
