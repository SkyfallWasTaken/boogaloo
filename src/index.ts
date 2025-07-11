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

const feelingsEmojis = {
  happy: ":smile:",
  sad: ":cry:",
  angry: ":angry:",
  surprised: ":open-mouth:",
  confused: ":confused:",
  excited: ":star-struck:",
  bored: ":yawning-face:",
  anxious: ":nervous:",
  relaxed: ":relaxed:",
};

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

  const feelings = await db.get(command.user_id);
  if (!feelings) {
    await respond("Log some feelings first with `/mood1234`!");
    return;
  }

  await respond(
    `Here are your feelings: ${feelings
      .map((f: string) => `${feelingsEmojis[f] || ":aga:"} *${f}*`)
      .join(", ")}`
  );
});

await app.start();
console.log("We're up and running :)");
