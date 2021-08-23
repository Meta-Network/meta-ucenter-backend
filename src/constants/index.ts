import fs from 'fs';
import path from 'path';

const configPath =
  process.env.CONFIG_PATH || path.join(__dirname, '..', '..', 'config');

export const JWT_KEY = {
  privateKey: fs.readFileSync(path.join(configPath, 'JWT_PRIVATE_KEY.pem')),
  publicKey: fs.readFileSync(path.join(configPath, 'JWT_PUBLIC_KEY.pub')),
};

export const APP_NAME_ON_AUTHENTICATOR = 'Meta Auth Dev';

/**
 * Config for OTPLib
 * default 1 step = 30 secs
 * so current valid code range: [-30 + now(), 60 + now()]
 */
export const TotpWindow = {
  past: 1,
  future: 2,
};
