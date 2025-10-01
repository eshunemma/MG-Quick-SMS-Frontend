import { Contact, PreviewMessage } from '../types';

export const processMessage = (template: string, contact: Contact): string => {
  let message = template;

  const placeholderRegex = /\{\{(\w+)\}\}/g;
  message = message.replace(placeholderRegex, (match, key) => {
    const value = contact[key.toLowerCase()];
    return value !== undefined ? value : match;
  });

  return message;
};

export const generatePreviews = (
  template: string,
  contacts: Contact[],
  count: number = 3
): PreviewMessage[] => {
  return contacts.slice(0, count).map(contact => ({
    phone: contact.phone,
    message: processMessage(template, contact),
  }));
};

export const extractPlaceholders = (template: string): string[] => {
  const placeholderRegex = /\{\{(\w+)\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(template)) !== null) {
    if (!placeholders.includes(match[1])) {
      placeholders.push(match[1]);
    }
  }

  return placeholders;
};