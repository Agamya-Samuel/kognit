export interface SmsProvider {
  send(params: { to: string; message: string }): Promise<void>;
  bulkSend(params: { recipients: string[]; message: string }): Promise<void>;
}
