import { Telegram } from './telegram/telegram.service.js';
import { StockController } from './stock/stock.controller.js';

export class App {
  constructor() {
    this.telegram = new Telegram();
    this.stockController = new StockController(this.telegram.getBot());
  }

  async start() {
    this.telegram.start();
    this.stockController.initialize();
  }
}
