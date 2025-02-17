import { readFileSync } from 'fs';
import { http, HttpResponse } from 'msw'
import { setupServer } from "msw/node";
import { resolve } from 'path';

export const testAPIURL = 'http://fake.api/test'
// export const remoteImageUrl =  'https://picsum.photos/id/13/750/500.jpg'
export const testJPGResponse =  readFileSync(resolve(__dirname, '../test-image-picsum-13-750x500.jpg'))
export const pngAPIURL = 'http://fake.api/png'
const testPNGResponse =  readFileSync(resolve(__dirname, '../test-image-picsum-13-750x500.png'))

export const server = setupServer(
  http.get(testAPIURL, async () => new HttpResponse(testJPGResponse, {
      headers: {
        'Content-Length': testJPGResponse.byteLength.toString(),
        'Content-Type': 'image/jpeg',
      }
    })
  ),
  http.get(pngAPIURL, async () => new HttpResponse(testPNGResponse, {
      headers: {
        'Content-Length': testPNGResponse.byteLength.toString(),
        'Content-Type': 'image/png',
      }
    })
  ),
)

beforeAll(() => server.listen({
  onUnhandledRequest: (req) => console.error(`No handler for ${req.url}`),
}))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())