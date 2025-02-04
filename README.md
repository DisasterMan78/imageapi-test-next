This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:
Yarn has been used. but any package manager should work

```bash
yarn run build
# or
yarn run start
# or
yarn run dev
# or
yarn run test
# or
yarn run test:watch
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Test Notes

The majority of the project has been done with a TDD approach - you can see this process in the git commit history.
I will confess to cutting some corners towards the end (I am only human!) with the edit image functionality, but I have backfilled the tests for that after.  Not my preferred approach, but the functionality was simple enough that I was able to go forward with a high degree of confidence.
Nonetheless, backfilling tests still helps with thinking about areas that might have been missed, so it is worth it.

*UPDATE:* localStorage now tested, and other branches have been covered. Coverage isn't _quite_ a perfect 100% coverage score, but the remaining branches on `src/app/id/[image]/page.tsx` seem to be false negatives.

Styling is super basic, but at least it doesn't look like it was written by a COBOL coder! There are some layout shift and alignment issues that I would fix ideally, and all the inputs are ugly as hell.

There are definitely areas ripe for refactoring. Things could be broken into sub-components, although where they aren't reused currently this is a stylistic choice rather than practical, and there are some small bits of repetition that could be abstracted.

Here are the acceptance criteria, with a few notes. All of them have been fulfilled.

* As a user, I want to be able to browse through the list of images.

      Done: Works from the homepage and from {url}/{page-number}
      Both pages share the same component to reduce duplication and unnecessary testing

  * Images list should be paginated.

        Done: Pagination is only Prev\Next page buttons as Picsum does not provide data on how many items are available on the API that I was able to find.

        It would be possible to hardcode the number (993 currently) but this would be brittle and break easily.

        Currently, the browser page checks to see if the number of results is equal to the number requested - if less, it doesn't show a next button.

        If the number of images should fit the last page exactly, it will display a next button, but the following page will notify the user that there are no more images.

  * Image items should include image preview and author's name.

        Done

* As a user, I want to click an image and be navigated to the edit image page.

      Done

* As a user, I want to be able to edit the image, i.e. be able to:

    * select the image size [height, width]

          Done

    * choose the greyscale mode.

          Done

    * blur the image (grade between 1 - 10)

          Done. Ideally this would use a number slider rather than an input type="number" - would be better UI and can help to reduce unnecessary http calls for the updated thumbnail

          All the inputs should have debounce added to reduce the number of page repaints

    * see the currently edited image preview

          Done. The image proportions do not update with changes to height and width.

          This could be achieved with another API to the info endpoint, but would also result in layout shift. A note has been added for the users.

* As a user, I want to be able to refresh the page at any point and still get the previous result

      Done: Editor values are stored in localStorage on a per image basis by id.

      LocalStorage functionality is not covered by tests.

      OnChange functions handling this are a little repetitive and could be refactored.

* As a user I want the page to remember where I was when going back in history

      Done: NextJS routing works fine, URLS are updated when navigating and automatically pushed to history
