export class UserModel {
  constructor(
    id,
    name,
    username,
    chatId,
    createdAt = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.chatId = chatId;
    this.username = username;
    this.createdAt = createdAt;
    this.stocks = [];
  }
}
