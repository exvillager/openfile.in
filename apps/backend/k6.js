import http from "k6/http";
import { sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 60 },
    { duration: "30s", target: 120 },
    { duration: "30s", target: 160 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500"],
  },
};

export default function () {
  http.get(
    "https://openfile.exvillager.xyz/upload?token=019c2eb4-9b98-7be0-aa25-0fc738c16829#key=v2IsVsx5tvllS-MTOXEa1RkxKowZf-0zL1zdyMTgmkA&iv=lgXgezwpcI7hYFhrX1erSA",
  );
  sleep(1);
}
