import type { FetchImplementation } from "./index.js";

export type FetchRecord = {
  request: Request;
};

export function createFetchRecorder(
  responder: (request: Request) => Response | Promise<Response>,
) {
  const records: FetchRecord[] = [];
  const fetchImplementation: FetchImplementation = async (input, init) => {
    const request = new Request(input, init);
    records.push({ request });
    return responder(request);
  };
  return { fetchImplementation, records };
}
