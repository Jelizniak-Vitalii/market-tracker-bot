import { Markup } from 'telegraf';

import { ApiService } from '../shared/services/api.service.js';
import { messages } from '../shared/constants/messages.js';
import { buttons } from '../shared/constants/buttons.js';

export class StockService {
  #baseUrl = 'https://webull.p.rapidapi.com/stock';

  constructor() {
    this.apiService = new ApiService();
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

  async handleStart(ctx) {
    await ctx.reply(
      messages.start,
      Markup.keyboard([
        Markup.button.callback(buttons.findStock, `findStock`),
        // Markup.button.callback(buttons.watchList, `watchList`)
      ])
    );
  }

  async handleFindStock(ctx) {
    ctx.session.state[buttons.findStock] = true;
    ctx.reply(messages.findStock);
  }

  async getStockByTickerId(ctx, tickerId) {
    const data = await this.getStockData(tickerId);

    await ctx.reply(
      `${data.name} - ${data.symbol}: цена ${data.pPrice || data.close} ${data.currencyCode || ''}`,
      // {
      //   reply_markup: {
      //     inline_keyboard: [
      //       [
      //         {
      //           text: 'Добавить в WatchList',
      //           callback_data: JSON.stringify({
      //             action: buttons.addToWatchList,
      //             tickerId: data.tickerId
      //           })
      //         }
      //       ]
      //     ]
      //   }
      // }
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
}
