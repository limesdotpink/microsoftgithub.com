import express, { type Request, type Response } from "express";
import * as handlebars from "express-handlebars";
import path from "node:path";
import pino from "pino-http";

import "dotenv/config";

import { usage } from "./routes/usage.js";
import { catchall } from "./routes/catchall.js";
import { stats } from "./routes/stats.js";

const app = express();
const hbs = handlebars.create();

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, 'views'));

app.use(pino());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/usage", (req: Request, res: Response) => usage(req, res));
app.get("/api/stats", (req: Request, res: Response) => stats(req, res));
app.get("/*path", (req: Request, res: Response) => catchall(req, res));
app.get("/", (req: Request, res: Response) => catchall(req, res));

app.listen(process.env.PORT || 3000, () =>
    console.log(
        `Server listening at http://localhost:${process.env.PORT || 3000}`,
    ),
);
