import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 200 },  // Fast warm-up
    { duration: '1m', target: 1000 },  // Heavy load
    { duration: '30s', target: 2000 }, // Extreme spike to test the breaking point
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'], 
    http_req_failed: ['rate<0.10'],    
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  group('1. Visit Home', function () {
    const res = http.get(`${BASE_URL}/`);
    check(res, { 'home loaded (200)': (r) => r.status === 200 });
    sleep(Math.random() * 2 + 1); 
  });

  group('2. Anime List Navigation', function () {
    const res = http.get(`${BASE_URL}/anime`);
    check(res, { 'anime list loaded (200)': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 2); 
  });

  group('3. Anime Detail', function () {
    const animeId = 1;
    const res = http.get(`${BASE_URL}/anime/${animeId}`);
    check(res, { 'detail loaded (200)': (r) => r.status === 200 });
    sleep(Math.random() * 3 + 1); 
  });

  group('4. Visit Profile', function () {
    const res = http.get(`${BASE_URL}/profile/pippo`);
    check(res, { 'profile loaded (200)': (r) => r.status === 200 });
    sleep(1);
  });
}