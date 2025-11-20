import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 10, // 10 usuários virtuais
  duration: '30s', // por 30 segundos
};

export default function () {
  const res = http.get('http://localhost:3000/items/available'); // ajuste a rota
  check(res, {
    'status 200': (r) => r.status === 200,
    'latency < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1); // espera 1s entre iterações do mesmo VU
}
