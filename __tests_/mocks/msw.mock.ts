import { readFileSync } from 'fs';
import { http, HttpResponse } from 'msw'
import { setupServer } from "msw/node";
import { resolve } from 'path';

export const testAPIURL = 'http://fake.api/test'
// export const remoteImageUrl =  'https://picsum.photos/id/13/750/500.jpg'
export const testJPGResponse = readFileSync(resolve(__dirname, '../test-image-picsum-13-750x500.jpg'))
export const testSmallJPGURL = 'http://fake.api/smalltiny-jpg'
const testSmallJPGResponse =  readFileSync(resolve(__dirname, '../test-image-spectrum-7x7.jpg'))
export const testTinyJPGURL = 'http://fake.api/tiny-jpg'
const testTinyJPGResponse =  readFileSync(resolve(__dirname, '../test-image-spectrum-3x3.jpg'))
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
  http.get(testSmallJPGURL, async () => new HttpResponse(testSmallJPGResponse, {
      headers: {
        'Content-Length': testSmallJPGResponse.byteLength.toString(),
        'Content-Type': 'image/jpeg',
      }
    })
  ),
  http.get(testTinyJPGURL, async () => new HttpResponse(testTinyJPGResponse, {
      headers: {
        'Content-Length': testTinyJPGResponse.byteLength.toString(),
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