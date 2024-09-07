import { Markup } from 'telegraf';

import { ApiService } from '../shared/services/api.service.js';
import { messages } from '../shared/constants/messages.js';
import { buttons } from '../shared/constants/buttons.js';
import { UsersService } from '../db/services/users.service.js';

export class StockService {
  #baseUrl = 'https://webull.p.rapidapi.com/stock';

  constructor() {
    this.apiService = new ApiService();
    this.usersService = new UsersService();
  }

  async search(text) {
    return this.apiService.get(
      `${this.#baseUrl}/search`,
      { keyword: text, pageSize: 5 },
      { 'X-RapidAPI-Key': process.env.X_RAPID_API_KEY }
    );
  }

  async getStockData(tickerId) {
    return this.apiService.get(
      `${this.#baseUrl}/get-realtime-quote`,
      { tickerId },
      { 'X-RapidAPI-Key': process.env.X_RAPID_API_KEY }
    );
  }

  handleStart = async (ctx) => {
    const user = await this.usersService.findByChatId(ctx.chat.id);

    if (!user) {
      await this.usersService.createUser({
        chatId: ctx.chat.id,
        name: ctx.chat.first_name,
        username: ctx.chat.username
      });
    }

    await ctx.reply(
      messages.start,
      Markup.keyboard([
        Markup.button.callback(buttons.findStock, `findStock`),
        Markup.button.callback(buttons.watchList, `watchList`)
      ])
    );
  }

  async handleFindStock(ctx) {
    ctx.session.state[buttons.findStock] = true;
    ctx.reply(messages.findStock);
  }

  async handleWatchList(ctx) {
    const user = await this.usersService.findByChatId(ctx.chat.id);

    if (user.stocks.length) {
      const stockPromises = user.stocks.map(stock => this.getStockData(stock));
      const stocks = await Promise.all(stockPromises);

      const message = `Ваш WatchList:\n${stocks.map(stock => 
        `${stock.name} - ${stock.symbol}: цена ${stock.pPrice || stock.close} ${stock.currencyCode || ''};`).join('\n')}`;

      await ctx.reply(message);
    } else {
      ctx.reply(messages.watchListEmpty);
    }
  }

  async getStockByTickerId(ctx, tickerId) {
    const data = await this.getStockData(tickerId);

    await ctx.reply(
      `${data.name} - ${data.symbol}: цена ${data.pPrice || data.close} ${data.currencyCode || ''}`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Добавить в WatchList',
                callback_data: JSON.stringify({
                  action: buttons.addToWatchList,
                  tickerId: data.tickerId
                })
              }
            ]
          ]
        }
      }
    );
  }

  async getStocks(ctx) {
    const stocks = await this.search(ctx.message.text);
    const inlineKeyboard = stocks?.stocks?.datas?.reduce((acc, item) =>
      [
        ...acc,
        [
          {
            text: `${item.ticker.name} - ${item.ticker.symbol}`,
            callback_data: JSON.stringify({
              action: buttons.findStock,
              tickerId: item.ticker.tickerId
            })
          }
        ]
      ], []
    );

    await ctx.reply(
      inlineKeyboard ? messages.stockFound : messages.stockNotFound,
      {
        reply_markup: {
          inline_keyboard: inlineKeyboard || []
        }
      }
    );
  }

  async addToWatchList(ctx, tickerId) {
    const stock = await this.usersService.findStock(ctx.chat.id, tickerId);

    if (!stock) {
      await this.usersService.addStock(ctx.chat.id, tickerId);

      ctx.reply(messages.addedToWatchList);
    } else {
      ctx.reply(messages.alreadyInWatchList);
    }
  }
}
