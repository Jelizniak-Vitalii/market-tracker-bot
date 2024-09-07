import { MongoClient } from 'mongodb';

export class MongoService {
  constructor() {
    if (MongoService._instance) {
      return MongoService._instance;
    }

    this.uri = `${process.env.MONGO_URI}${process.env.MONGO_DB_PASSWORD}@markettrackerbot.uby5q.mongodb.net/?retryWrites=true&w=majority&appName=MarketTrackerBot`;
    this.client = new MongoClient(this.uri);
    this.db = this.client.db('marketTrackerBot');

    MongoService._instance = this;
  }

  async connect() {
    try {
      await this.client.connect();
      await this.initializeCollections();
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async initializeCollections() {
    try {
      await this.db.createCollection('users');
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}
