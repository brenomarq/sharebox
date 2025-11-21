import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '20s', target: 20 }, // subida
    { duration: '40s', target: 20 }, // sustentação
    { duration: '20s', target: 0 }, // descida
  ],
};

export default function () {
  const url = 'http://localhost:3000/auth/login';
  const payload = JSON.stringify({
    email: 'breno@gmail.com',
    password: 'qwerty',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response has token': (r) => r.json('access_token') !== undefined,
  });

  sleep(1);
}
