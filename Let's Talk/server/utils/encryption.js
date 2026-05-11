import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'letstalk-secret-key-2026';

export const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || ciphertext; // Fallback to ciphertext if decryption fails
    } catch (error) {
        console.error('Decryption error:', error);
        return ciphertext;
    }
};
