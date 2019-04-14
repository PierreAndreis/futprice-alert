// Global import for typeorm
import "reflect-metadata";
require("dotenv").config();

import { createConnection } from "typeorm";
import updatePrices from "./crons/updatePrices";
import "./discord";

createConnection()
  .then(async () => {
    console.log("Database ready");
    setInterval(updatePrices.run, 1 * 60 * 1000);
  })
  .catch(error => console.log(error));
