import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';

import { App } from './src/main.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, `.env.${process.env.NODE_ENV}`) });

const app = new App();

await app.start();
