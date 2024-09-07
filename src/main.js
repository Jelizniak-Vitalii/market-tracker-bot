import { Telegram } from './telegram/telegram.service.js';
import { StockController } from './stock/stock.controller.js';
import { MongoService } from './db/mongo.service.js';

export class App {
  constructor() {
    this.telegram = new Telegram();
    this.mongoService = new MongoService();
    this.stockController = new StockController(this.telegram.getBot());
  }

  async start() {
    this.telegram.start();
    await this.mongoService.connect();
    this.stockController.initialize();
  }
}
