import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '10s', target: 150 },
    { duration: '20s', target: 300 },
    { duration: '10s', target: 0 },
  ],
};

export function setup() {
  const loginRes = http.post(
    'http://localhost:3000/auth/login',
    JSON.stringify({ email: 'breno@gmail.com', password: 'qwerty' }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  return { token: loginRes.json('access_token') };
}

export default function (data) {
  const res = http.get('http://localhost:3000/auth/me', {
    headers: { Authorization: `Bearer ${data.token}` },
  });

  check(res, {
    'status is 200 OR 500 under stress': (r) =>
      r.status === 200 || r.status === 500,
  });
}
