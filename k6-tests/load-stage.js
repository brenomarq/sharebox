import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // aquecer: 0 -> 10 VUs
    { duration: '1m', target: 50 }, // sobe para 50 VUs
    { duration: '2m', target: 50 }, // manter 50 VUs por 2min (soak)
    { duration: '30s', target: 0 }, // ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // p95 menor que 500ms
    http_req_failed: ['rate<0.01'], // erros < 1%
  },
};

export default function () {
  const res = http.get('http://localhost:3000/users/all');
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(1);
}
