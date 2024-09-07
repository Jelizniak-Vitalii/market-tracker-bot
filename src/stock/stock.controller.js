import { StockService } from './stock.service.js';
import { buttons } from '../shared/constants/buttons.js';

export class StockController {
  constructor(tgBot) {
    this.tgBot = tgBot;
    this.stockService = new StockService();
  }

  commands = Object.freeze({
    [buttons.findStock]: (ctx) => this.stockService.handleFindStock(ctx),
  });

  initialize() {
    this.handleStart();
    this.initializeCommands();
    this.onInputText();
    this.onInputAction();
  }

  handleStart() {
    this.tgBot.command(buttons.start, this.stockService.handleStart);
  }

  initializeCommands() {
    for (const command in this.commands) {
      this.tgBot.hears(command, this.commands[command]);
    }
  }

  onInputText() {
    this.tgBot.on('text', async (ctx) => {
      if (ctx.session.state?.[buttons.findStock]) {
        await this.stockService.getStocks(ctx);
      }
    });
  }

  onInputAction() {
    this.tgBot.action(/\d+/, async (ctx) => {
      const data = JSON.parse(ctx.match.input);

      if (data.action === buttons.findStock) {
        await this.stockService.getStockByTickerId(ctx, data.tickerId);
      }
    });
  }
}
