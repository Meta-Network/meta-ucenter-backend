import { Injectable } from '@nestjs/common';
import { createPublicKey } from 'crypto';
import { JWT_KEY } from 'src/constants';

@Injectable()
export class SystemService {
  getPublicKeyForAccessToken() {
    const pk = createPublicKey(JWT_KEY.privateKey);
    return {
      type: pk.type,
      detail: pk.asymmetricKeyDetails,
      asymmetricKeyType: pk.asymmetricKeyType,
      publicKey: pk.export({
        type: 'spki',
        format: 'pem',
      }),
    };
  }
}
