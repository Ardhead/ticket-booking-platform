import http from 'k6/http';
import { check, sleep } from 'k6';
import crypto from 'k6/crypto';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000/api';

function uuid() {
  const hex = crypto.hexEncode(crypto.randomBytes(16));
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-${(parseInt(hex[16],16) & 0x3 | 0x8).toString(16)}${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

const SEAT_POOL = [
  'A1', 'A2', 'A3', 'A4', 'A5',
  'B1', 'B2', 'B3', 'B4', 'B5',
  'C1', 'C2', 'C3', 'C4', 'C5',
];

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 50 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.10'],
  },
};

export default function (data) {
  const eventId = data.eventId;
  const seatId = `${eventId}-${SEAT_POOL[Math.floor(Math.random() * SEAT_POOL.length)]}`;

  const headers = {
    'Content-Type': 'application/json',
    'x-idempotency-key': uuid(),
    'x-user-id': uuid(),
    'x-event-id': eventId,
  };

  const res = http.post(`${BASE_URL}/reservations`,
    JSON.stringify({ seatIds: [seatId] }), { headers });

  check(res, {
    'reservation responded': (r) => r.status === 201 || r.status === 409,
    'response under 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.5);
}
