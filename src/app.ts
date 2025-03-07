import express from "express"; // for creating an Express server
import cors from "cors"; // for enabling CORS support
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { usersRouter } from "./routes/users.js";
import { reviewsRouter } from "./routes/reviews.js";
import { userProfilesRouter } from "./routes/userProfiles.js";
import { eventsRouter } from "./routes/events.js";

import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import fs from "fs"; 
import {Server} from 'socket.io'
dotenv.config();

// The Express server instance
const app = express();

// Add CORS middleware to server, allowing it to handle cross-origin requests
const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:3000",
	"https://localhost:8005",
	"https://studenter.miun.se",
];

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.indexOf(origin) !== -1) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true,
};

app.use(cors(corsOptions));
app.use(fileUpload({
	limits:{fileSize: 5000000}, // 5MB max, kanske för lite...
	abortOnLimit: true}));
app.options("*", cors(corsOptions));
const DB =
	process.env.NODE_ENV === "production"
		? process.env.PROD_DB_SERVER
		: process.env.DEV_DB_SERVER;



if (!DB) {
	throw new Error("DB SERVER is not defined in environment variables.");
}



const store = MongoStore.create({
	mongoUrl: DB,
	collectionName: "sessions",
	ttl: 14 * 24 * 60 * 60, // 14 days
});


if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use(session(getProdSessionConfig()));
} else {
  app.use(session(getDevSessionConfig()));
}

mongoose
	.connect(DB)
	.then(() => console.log("Database is connected"))
	.catch((err) => console.log("Unable to connect to Database: ", err));

app.use(cookieParser());

// Add express.json middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * The port on which the Express server will listen for incoming requests.
 * Uses the environment variable PORT, if it exists, or defaults to 3000.
 */
const port = process.env.PORT || 3000;

/**
 * The api path as defined in .env
 */
const api_path = process.env.API_PATH || "";

global.fileRoot = path.dirname(fileURLToPath(import.meta.url));

if(!fs.existsSync(path.join(global.fileRoot, "images"))) {
  fs.mkdirSync(path.join(global.fileRoot, "images"));
}

app.use(`${api_path}/users`, usersRouter);
app.use(`${api_path}/reviews`, reviewsRouter);
app.use(`${api_path}/userProfiles`, userProfilesRouter);
app.use(`${api_path}/events`, eventsRouter);
app.use(`${api_path}/images`, express.static(path.join(global.fileRoot, "images")));

const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

app.get("/", function (req, res) {
	res.send("Backend is running");
});
const io = new Server(server, {
  cors: corsOptions
});
// socket IO 
io.on('connection', (socket) => {
  //console.log(socket.id+" connected");
  // användare går med i events

  socket.on("join_events", (data) => {
    data.forEach((entry:any) => {
      if(!socket.rooms.has("E:"+entry._id)) {
        socket.join("E:"+entry._id);
        //console.log("joined "+entry.name);
      }
    });
  });

  socket.on("join_event", (data) => {
    if(!socket.rooms.has("E:"+data._id)) {
      socket.join("E:"+data._id);
    }
    //console.log("joined "+data._id);
  })

  socket.on("leave_event", (data) => {
    socket.leave("E:"+data._id);
    //console.log("left "+data._id);
  })

  // organizer startar event, skickas till användares notiser
  socket.on("start_event", (event) => {
    socket.nsp.to("E:"+event._id).emit("notify_start", {message:"event ("+event.name+") is starting!"});
  })
  // organizer uppdaterar event
  socket.on("update_event", (event) => {
    socket.nsp.to("E:"+event._id).emit("notify");
  })

  socket.on("disconnect", () => {
    //console.log(socket.id+" left");
  });
})



function getProdSessionConfig() {
  return {
    secret: process.env.SECRET || "MY_SECRET",
    cookie: {
      sameSite: "none" as const,
      secure: true,
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 min ttl
    },
    rolling: true,
    resave: false,
    saveUninitialized: false,
    store: store,
  };
}

function getDevSessionConfig() {
  return {
    secret: process.env.SECRET || "MY_SECRET",
    cookie: {
      sameSite: "strict" as const,
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 min ttl
    },
    rolling: true,
    resave: false,
    saveUninitialized: false,
    store: store,
  };
}

