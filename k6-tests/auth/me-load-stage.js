import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 20 },
    { duration: '40s', target: 20 },
    { duration: '20s', target: 0 },
  ],
};

export function setup() {
  const loginRes = http.post(
    'http://localhost:3000/auth/login',
    JSON.stringify({ email: 'user@example.com', password: '123456' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  return { token: loginRes.json('access_token') };
}

export default function (data) {
  const res = http.get('http://localhost:3000/auth/me', {
    headers: { Authorization: `Bearer ${data.token}` },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has id': (r) => r.json('id') !== undefined,
  });

  sleep(1);
}
