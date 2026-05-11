import mongoose from "mongoose";
import dns from "node:dns";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8"]);

dotenv.config();

mongoose.set("strictQuery", false);

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "chatApp",
  })
  .then(() => {
    console.log("Mongo has connected successfully");
  })
  .catch((error) => {
    console.error("Mongo connection has an error", error);
  });

mongoose.connection.on("reconnected", () => {
  console.log("Mongo has reconnected");
});
mongoose.connection.on("disconnected", () => {
  console.log("Mongo connection is disconnected");
});
