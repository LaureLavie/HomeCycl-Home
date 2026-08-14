// back/tests/env.cjs
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
process.env.NODE_ENV = 'test';