import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 1 }, 
    { duration: "1m", target: 5 },  // ramp-up to 5 users
    { duration: "1m", target: 10 },  // ramp-up to 10 users
    { duration: "1m", target: 3 },  // ramp-down
    { duration: "1m", target: 0 },   // ramp-down

  ],
  thresholds: {
    http_req_failed: ["rate<0.02"], 
    http_req_duration: ["p(95)<300"], 
  },
};

const BASE_URL = __ENV.BASE_URL;
if (!BASE_URL) {
	throw new Error("BASE_URL environment variable is not set");
}
const SEARCH_TERMS = ["fruit", "fruits", "tacos", "pizza", "coffee", "hot%20dog"];
export default function () {
  const term = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
  const res = http.get(`${BASE_URL}/search?q=${term}`);
  let data;
  try { data = res.json(); } catch (e) { data = {}; }
  check(res, {
    "status is 200": (r) => r.status === 200,
    "search success": (r) => data.status === "success",
    "has trucks": (r) => data.hits >= 0,
  });
  sleep(1);
}
