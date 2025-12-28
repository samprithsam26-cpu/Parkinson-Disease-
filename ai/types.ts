
export interface ChatMessage {
  id: string;
  sender: 'user' | 'model';
  text: string;
}

export enum Status {
  Idle = 'Idle',
  Connecting = 'Connecting...',
  Listening = 'Listening...',
  Processing = 'Processing...',
  Speaking = 'Speaking...',
  Error = 'Error',
}
