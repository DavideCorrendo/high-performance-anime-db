import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 200 },  // Riscaldamento veloce
    { duration: '1m', target: 1000 },  // Carico pesante 
    { duration: '30s', target: 2000 }, // Picco estremo per testare il punto di rottura
    { duration: '30s', target: 0 },    // Discesa
  ],
  thresholds: {
    // Sotto stress estremo, alziamo la tolleranza per considerare il test "valido"
    http_req_duration: ['p(95)<1500'], 
    http_req_failed: ['rate<0.10'],    // Tolleriamo fino al 10% di drop prima di dichiarare il server morto
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  group('1. Visita Home', function () {
    const res = http.get(`${BASE_URL}/`);
    check(res, { 'home caricata (200)': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1); 
  });

  group('2. Navigazione Lista Anime', function () {
    const res = http.get(`${BASE_URL}/anime`);
    check(res, { 'lista anime caricata (200)': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2); 
  });

  group('3. Dettaglio Anime', function () {
    const animeId = 1;
    const res = http.get(`${BASE_URL}/anime/${animeId}`);
    check(res, { 'dettaglio caricato (200)': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 1); 
  });

  group('4. Visita Profilo', function () {
    const res = http.get(`${BASE_URL}/profile/pippo`);
    check(res, { 'profilo caricato (200)': (r) => r.status === 200 });
    sleep(1);
  });
}