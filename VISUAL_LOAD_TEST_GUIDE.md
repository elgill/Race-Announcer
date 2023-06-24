# Visual Load Testing Guide

This document provides a guide for using the `VisualLoadTestService`, which is included in this project to simulate the rapid entry of bib numbers for visual load testing.

## Usage

### Setup

1. The `VisualLoadTestService` should be provided in the root of your application. In a standard Angular application, this is already the case.

2. In your `AppComponent` (or whichever component gets loaded at startup), expose the `VisualLoadTestService` instance to the global `window` object:

    ```typescript
    constructor(private visualLoadTestService: VisualLoadTestService) {
      (window as any).visualLoadTestService = visualLoadTestService;
    }
    ```

### Running the Visual Load Test

3. After the setup, you can access the `VisualLoadTestService` from the console in your browser's development tools:

    ```javascript
    visualLoadTestService.loadTestWithDelay([
      { bib: '123', timeElapsed: 0 },
      { bib: '456', timeElapsed: 100 },
      { bib: '789', timeElapsed: 200 },
      { bib: '012', timeElapsed: 300 },
      { bib: '345', timeElapsed: 400 }
    ], 200);
    ```

   This command will start entering the bib numbers with a delay based on their `timeElapsed` attribute. The `startFrom` parameter (200 in the example above) specifies the time elapsed to start from, skipping any entries with a time elapsed less than this.

### Stopping the Visual Load Test

4. If you wish to stop any pending bib entries from being entered, use the following command:

    ```javascript
    visualLoadTestService.stopLoadTest();
    ```

   This will cancel all pending bib entries from being entered.
