const path = require('path');
const utils = require('../libs/utils'); 
const pjson = require('../package.json'); 

// Get the environment from the command-line arguments or default to 'development'
let env = process.argv[2] || 'development';
if (env.startsWith('tests/')) {
    env = 'test';
}

const configPath = path.resolve(__dirname, `./envs/${env}.js`);


let config;
try {
    config = require(configPath);
    console.log(`Loaded configuration for environment: ${env}`);
} catch (error) {
    console.error(`Failed to load configuration for environment: ${env}`);
    console.error(error);
    process.exit(1);
}

const SERVICE_NAME = config.SERVICE_NAME || (process.env.SERVICE_NAME ? utils.slugify(process.env.SERVICE_NAME) : pjson.name);
const USER_PORT = config.USER_PORT || process.env.USER_PORT || 5111;
const ADMIN_PORT = config.ADMIN_PORT || process.env.ADMIN_PORT || 5222;
const ADMIN_URL = config.ADMIN_URL || process.env.ADMIN_URL || `http://localhost:${ADMIN_PORT}`;
const ENV = config.ENV || process.env.ENV || "development";
const REDIS_URI = config.REDIS_URI || process.env.REDIS_URI || "redis://127.0.0.1:6379";

const CORTEX_REDIS = config.CORTEX_REDIS || process.env.CORTEX_REDIS || REDIS_URI;
const CORTEX_PREFIX = config.CORTEX_PREFIX || process.env.CORTEX_PREFIX || 'none';
const CORTEX_TYPE = config.CORTEX_TYPE || process.env.CORTEX_TYPE || SERVICE_NAME;
const OYSTER_REDIS = config.OYSTER_REDIS || process.env.OYSTER_REDIS || REDIS_URI;
const OYSTER_PREFIX = config.OYSTER_PREFIX || process.env.OYSTER_PREFIX || 'none';

const CACHE_REDIS = config.CACHE_REDIS || process.env.CACHE_REDIS || REDIS_URI;
const CACHE_PREFIX = config.CACHE_PREFIX || process.env.CACHE_PREFIX || `${SERVICE_NAME}:ch`;
const MONGO_URI = config.MONGO_URI || process.env.MONGO_URI || `mongodb://localhost:27017/${SERVICE_NAME}`;
const LONG_TOKEN_SECRET = config.LONG_TOKEN_SECRET || process.env.LONG_TOKEN_SECRET || null;
const SHORT_TOKEN_SECRET = config.SHORT_TOKEN_SECRET || process.env.SHORT_TOKEN_SECRET || null;
const NACL_SECRET = config.NACL_SECRET || process.env.NACL_SECRET || null;
const RATE_LIMIT_WINDOW_IN_MINUTES = config.RATE_LIMIT_WINDOW_IN_MINUTES || process.env.RATE_LIMIT_WINDOW_IN_MINUTES || 15;
const RATE_LIMIT_MAX_REQUESTS = config.RATE_LIMIT_MAX_REQUESTS || process.env.RATE_LIMIT_MAX_REQUESTS || 100;

config.dotEnv = {
    SERVICE_NAME,
    USER_PORT,
    ADMIN_PORT,
    ADMIN_URL,
    ENV,
    REDIS_URI,
    CORTEX_REDIS,
    CORTEX_PREFIX,
    CORTEX_TYPE,
    OYSTER_REDIS,
    OYSTER_PREFIX,
    CACHE_REDIS,
    CACHE_PREFIX,
    MONGO_URI,
    LONG_TOKEN_SECRET,
    SHORT_TOKEN_SECRET,
    NACL_SECRET,
    RATE_LIMIT_WINDOW_IN_MINUTES,
    RATE_LIMIT_MAX_REQUESTS
}

module.exports = config;