# Creating a basic React/Next application with TS support

### Requirements:
* Node Version Manager (NVM)

#### Create Next application
* `$ npx create-next-app@latest snowplow-test-next`:
  ```
  ✔ Would you like to use TypeScript? … Yes
  ✔ Would you like to use ESLint? … Yes
  ✔ Would you like to use Tailwind CSS? … No
  ✔ Would you like your code inside a `src/` directory? … Yes
  ✔ Would you like to use App Router? (recommended) … Yes
  ✔ Would you like to use Turbopack for `next dev`? … Yes
  ✔ Would you like to customize the import alias (`@/*` by default)? … No
  ```

#### Latest Node.js
* `$ nvm install node` (23.7.0 at time of writing)
* Create `./.nvmrc`:
  ```
  v23.7.0
  ```

#### Yarn
* `$ npm install -g yarn`

#### Start dev server
* `$ yarn run dev`
* View at http://localhost:3000/

#### Add Jest/React Testing Library
* `$ yarn add -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node @types/jest`
* Create `./jest.config.ts`:
  ```
  import type { Config } from 'jest'
  import nextJest from 'next/jest.js'

  const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
  })

  // Add any custom config to be passed to Jest
  const config: Config = {
    coverageProvider: 'v8',
    testEnvironment: 'jsdom',
    // Add more setup options before each test is run
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  }

  // createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
  export default createJestConfig(config)
  ```
* Add test commands to `./package.json` scripts:
  ```
  {
    ...,
    "scripts": {
      ...,
      "test": "jest",
      "test:watch": "jest --watch"
    },
    ...
  }
  ```
* Create `./__tests__/page.test.tsx`:
  ```
  import '@testing-library/jest-dom'
  import { render, screen } from '@testing-library/react'
  import Home from '../src/app/page'

  describe('Home', () => {
    it('renders a heading', () => {
      render(<Home />)

      const heading = screen.getByRole('heading', { level: 1 })

      expect(heading).toBeInTheDocument()
    })
  })
  ```
* `$ yarn run test` (Test will fail)
* Add attributes to Next.js logo in `./src/app/page.tsx`:
  ```
  role="heading"
  aria-level={1}
  ```
* `$ yarn run test` (Test should pass)