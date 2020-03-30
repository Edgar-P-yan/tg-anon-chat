export class TelegramBotError extends Error {
  constructor(public readonly message: string) {
    super(message);
  }
}
