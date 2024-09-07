import { MongoService } from '../mongo.service.js';
import { UserModel } from '../models/user.model.js';

export class UsersService {
  constructor() {
    this.mongoService = new MongoService();
    this.userCollection = this.mongoService.db.collection('users');
  }

  async createUser(user) {
    await this.userCollection.insertOne(
      new UserModel(
        await this.userCollection.count() + 1,
        user.name,
        user.username,
        user.chatId
      )
    );
  }

  async findByChatId(chatId) {
    return await this.userCollection.findOne({ chatId });
  }

  async addStock(chatId, stock) {
    await this.userCollection.updateOne(
      { chatId },
      { $push: { stocks: stock } }
    );
  }

  async removeStock(chatId, stock) {
    await this.userCollection.updateOne(
      { chatId },
      { $pull: { stocks: stock } }
    );
  }

  async findStock(chatId, tickerId) {
    return await this.userCollection.findOne(
      { chatId, stocks: tickerId }
    );
  }
}
