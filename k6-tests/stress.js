import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'], // permite até 5% de erros antes de considerar falha
  },
};

export default function () {
  const res = http.get('http://localhost:3000/users/all');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.5);
}
