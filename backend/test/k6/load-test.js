import http from 'k6/http';
import { check } from 'k6';
import crypto from 'k6/crypto';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000/api';

function uuid() {
  const hex = crypto.hexEncode(crypto.randomBytes(16));
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-${(parseInt(hex[16],16) & 0x3 | 0x8).toString(16)}${hex.slice(17,20)}-${hex.slice(20,32)}`;
}

export const options = {
  scenarios: {
    reserve: {
      executor: 'constant-arrival-rate',
      rate: 5000,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 500,
      maxVUs: 2000,
    },
  },
  thresholds: {
    'http_req_duration{name:reserve}': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed{name:seats}': ['rate<0.01'],
  },
};

export function setup() {
  const res = http.get(`${BASE_URL}/events`);
  const events = res.json();
  const event = events.find((e) => e.name === 'Summer Concert 2026');
  if (!event) {
    throw new Error('Seed event "Summer Concert 2026" not found. Run: npm run prisma:seed');
  }
  return { eventId: event.id };
}

export default function reserve(data) {
  const seatsRes = http.get(`${BASE_URL}/events/${data.eventId}/seats`, {
    tags: { name: 'seats' },
  });
  if (seatsRes.status !== 200) {
    return;
  }
  const seats = seatsRes.json();
  if (!Array.isArray(seats) || seats.length === 0) {
    return;
  }
  const seatId = seats[Math.floor(Math.random() * seats.length)].id;

  const headers = {
    'Content-Type': 'application/json',
    'x-idempotency-key': uuid(),
    'x-user-id': uuid(),
    'x-event-id': data.eventId,
  };

  const res = http.post(`${BASE_URL}/reservations`,
    JSON.stringify({ seatIds: [seatId] }), {
      headers,
      tags: { name: 'reserve' },
    });

  check(res, {
    'reservation OK': (r) => r.status === 201 || r.status === 409,
    'response < 500ms': (r) => r.timings.duration < 500,
  });
}
