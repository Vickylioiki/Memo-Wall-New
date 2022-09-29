import express from "express";
import expressSession from "express-session";
import path from "path";
import fs from "fs";
import formidable from "formidable";
import { isLoggedIn } from "./guard";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { uploadDir } from "./upload";
import {
  initialize as initializeUserRoute,
  userRoutes,
} from "./routes/userRoutes";

export const form = formidable({
  uploadDir,
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 200 * 1024 ** 2, // the default limit is 200KB
  filter: (part) => part.mimetype?.startsWith("image/") || false,
});

const app = express();
const server = new http.Server(app);
export const io = new SocketIO(server); //io and server connect

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

import { memoRoutes } from "./routes/memoRoutes";
import { client } from "./database/client";
// import { UserService } from "./services/UserService";
// import UserController from "./controller/userController";

app.use(
  expressSession({
    secret: "MemoWall",
    resave: true,
    saveUninitialized: true,
  })
); //default next ( )

declare module "express-session" {
  interface SessionData {
    name?: string;
    isLoggedIn?: boolean;
  }
}

initializeUserRoute(client);

app.use("/user", userRoutes);
app.use("/memos", memoRoutes);

app.use("/upload", express.static("uploads"));
app.use(express.static("public"));
app.use(express.static("error")); //auto next (用static先可以包括埋error入面既CSS, JS)
//admin.html should be inside protected
app.use(isLoggedIn, express.static("protected"));

io.on("connection", function (socket) {
  console.log(`New socket client, socket id = ${socket.id}`);
});

app.use((req, res) => {
  res.sendFile(path.resolve("./error/error.html")); //唔加static, 就淨係拎到HTML, 拎唔到CSS, JS
});

async function startServer() {
  fs.mkdirSync(uploadDir, { recursive: true });

  server.listen(8080, () => {
    console.log("listening on port 8080");
  });
}
startServer();

// function initializeUserRoute(
//   client: Client,
//   io: SocketIO<
//     import("socket.io/dist/typed-events").DefaultEventsMap,
//     import("socket.io/dist/typed-events").DefaultEventsMap,
//     import("socket.io/dist/typed-events").DefaultEventsMap,
//     any
//   >
// ) {
//   throw new Error("Function not implemented.");
// }
