import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    stages: [
        { duration: '1m', target: 50 }, // ramp to 50 VUs
        { duration: '3m', target: 50 },
        { duration: '1m', target: 0 }
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
    }
};

export default function () {
    const payload = JSON.stringify({
        playerId: `loadtest-${Math.floor(Math.random() * 1000)}`,
        betPerShot: 0.1,
        shots: 1
    });

    const headers = { 'Content-Type': 'application/json' };
    // Adjust URL for staging/prod as needed
    const res = http.post('http://localhost:3000/api/fire', payload, { headers });
    check(res, { 'status 200': (r) => r.status === 200 });
    sleep(0.1); // Simulate rapid arcade fire
}
