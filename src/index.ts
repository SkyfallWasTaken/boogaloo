import { App } from "@slack/bolt";
import * as chrono from "chrono-node";
import Keyv from "keyv";
import KeyvSqlite from "@keyv/sqlite";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const db = new Keyv(
  new KeyvSqlite({
    uri: "db.sqlite",
  })
);

app.command("/mood1234", async ({ command, ack, respond }) => {
  await ack();

  if (!command.text) {
    await respond(
      "You need to put a mood after the command, like `/mood1234 happy`"
    );
    return;
  }

  const slackId = command.user_id;

  const oldValues = await db.get(slackId);

  if (oldValues) {
    console.log(oldValues);
    await db.set(slackId, [...oldValues, command.text]);
  } else {
    await db.set(slackId, [command.text]);
  }

  await respond(`:yay: I've logged your mood: *${command.text}*`);
});

app.command("/mood1234history", async ({ command, ack, respond }) => {
  await ack();
});

await app.start();
console.log("We're up and running :)");
