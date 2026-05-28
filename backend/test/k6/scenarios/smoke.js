import http from 'k6/http';
import { check, sleep, group } from 'k6';
import crypto from 'k6/crypto';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000/api';

function uuid() {
  const hex = crypto.hexEncode(crypto.randomBytes(16));
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-${(parseInt(hex[16],16) & 0x3 | 0x8).toString(16)}${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

export const options = {
  vus: 2,
  duration: '10s',
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function (data) {
  const eventId = data.eventId;

  group('browse events', () => {
    const res = http.get(`${BASE_URL}/events`);
    check(res, { 'events listed': (r) => r.status === 200 });
  });

  group('browse seats', () => {
    const res = http.get(`${BASE_URL}/events/${eventId}/seats`);
    check(res, { 'seats listed': (r) => r.status === 200 });
  });

  group('reserve seats', () => {
    const headers = {
      'Content-Type': 'application/json',
      'x-idempotency-key': uuid(),
      'x-user-id': uuid(),
      'x-event-id': eventId,
    };
    const res = http.post(`${BASE_URL}/reservations`,
      JSON.stringify({ seatIds: [uuid()] }), { headers });
    check(res, { 'reservation handled': (r) => r.status === 409 });
  });

  sleep(1);
}
