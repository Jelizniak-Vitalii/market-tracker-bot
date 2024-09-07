import { session, Telegraf } from 'telegraf';
import { messages } from '../shared/constants/messages.js';

export class Telegram {
  #tgBot = new Telegraf(process.env.TELEGRAM_TOKEN);

  constructor() {
    if (Telegram._instance) {
      return Telegram._instance;
    }

    Telegram._instance = this;
    this.#tgBot.use(session());

    this.#tgBot.use( async (ctx, next) => {
      if (!ctx.session) {
        ctx.session = {};
        ctx.session.state = {};
      }

      return await next();
    });

    this.#tgBot.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        console.error('An error occurred:', error);
        await ctx.reply(messages.error);
      }
    });
  }

  start() {
    this.#tgBot.launch();
  }

  getBot() {
    return this.#tgBot;
  }
}
