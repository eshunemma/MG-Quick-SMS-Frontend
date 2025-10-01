export interface Contact {
  phone: string;
  name?: string;
  date?: string;
  location?: string;
  [key: string]: string | undefined;
}

export interface PreviewMessage {
  phone: string;
  message: string;
}