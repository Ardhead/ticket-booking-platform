import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000/api';

export function setup() {
  const eventRes = http.post(`${BASE_URL}/events`, JSON.stringify({
    name: 'Load Test Event',
    startsAt: '2026-12-01T20:00:00Z',
  }), { headers: { 'Content-Type': 'application/json' } });

  check(eventRes, { 'event created': (r) => r.status === 201 });
  const eventId = eventRes.json().id;

  const seatsRes = http.get(`${BASE_URL}/events/${eventId}/seats`);
  check(seatsRes, { 'seats fetched': (r) => r.status === 200 });

  return { eventId };
}
