import axios from 'axios';

function base64ToUtf8(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf8');
}

async function getUsername(token: string): Promise<string> {
  if (!token) {
    return '';
  }
  const tokenPayload = token.split('.')[1];
  const userId = JSON.parse(base64ToUtf8(tokenPayload)).id;

  const userinfo = (
    await axios.get(`https://api.mttk.net/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).data;
  return userinfo.data.username;
}

export default async function matatakiGetUsername(
  token: string,
): Promise<string> {
  return getUsername(token);
}
