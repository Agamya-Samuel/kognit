export interface EmailProvider {
  send(params: { to: string; subject: string; html: string; text?: string }): Promise<void>;
  bulkSend(params: { recipients: string[]; subject: string; html: string; text?: string }): Promise<void>;
}
