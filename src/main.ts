import * as dotenv from "../node_modules/dotenv"
import { LastFmDataGrabber } from "./lastfm-data-grabber/main";
import { Telegraf } from "telegraf";

dotenv.config(); 

const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.command('list', async (ctx) => {
  let response = await getLastFmData('ndeast')
  await ctx.telegram.sendMessage(ctx.message.chat.id, response)
})

async function getLastFmData(user: string) {
  const lfm = new LastFmDataGrabber(user);
  return await lfm.main();
}

bot.launch()