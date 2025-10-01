import * as XLSX from 'xlsx';
import { Contact } from '../types';

export const parseExcelFile = (file: File): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const contacts = jsonData.map((row: any) => {
          const contact: Contact = {
            phone: row.phone || row.Phone || row.PHONE || '',
            name: row.name || row.Name || row.NAME,
            date: row.date || row.Date || row.DATE,
            location: row.location || row.Location || row.LOCATION,
          };

          Object.keys(row).forEach(key => {
            const lowerKey = key.toLowerCase();
            if (!['phone', 'name', 'date', 'location'].includes(lowerKey)) {
              contact[lowerKey] = row[key];
            }
          });

          return contact;
        });

        resolve(contacts);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please ensure it\'s a valid Excel file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file.'));
    };

    reader.readAsBinaryString(file);
  });
};