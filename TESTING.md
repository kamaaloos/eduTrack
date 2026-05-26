# EduTrack Testing Guide

## Overview

This guide explains how to run tests in the EduTrack application. Tests are organized into three categories:

1. **Unit Tests** - Test individual functions and components in isolation
2. **Validation Tests** - Test input validation logic
3. **Integration Tests** - Test complete user workflows

## Continuous integration

GitHub Actions runs on every push and pull request to `main` / `master`:

- `npm test` — Jest unit tests (`tests/**/*.test.ts`)
- `npm run lint` — Expo ESLint

Workflow file: [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

Run the same checks locally:

```bash
npm run ci
```

## Setup

### 1. Install Testing Dependencies

```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native firebase-mock ts-jest
```

### 2. Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3. Start Firebase Emulator (for integration tests)

```bash
firebase emulators:start
```

This allows tests to run against a local Firebase instance without affecting production data.

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test:watch
```

This re-runs tests when files change - useful during development.

### Run Specific Test File

```bash
npm test tests/validation.test.ts
```

### Generate Coverage Report

```bash
npm test:coverage
```

This shows which parts of your code are tested and which need more tests.

## Test Files

### `tests/validation.test.ts`

Tests input validation functions used throughout the app:

- Email validation
- Password validation
- Score validation (0-100 range)
- Class name validation

**To run:**

```bash
npm test validation.test.ts
```

### `tests/services.test.ts`

Tests the business logic layer:

- Report card generation
- Grade calculation
- Authentication state management

**To run:**

```bash
npm test services.test.ts
```

### `tests/integration.test.ts`

Tests complete user workflows using Firebase Emulator:

- Admin user management
- Class management and relationships
- Grade recording and report cards
- Homework assignment
- Parent-student linking
- Attendance tracking
- Error recovery
- Data migration

**To run:**

```bash
npm test integration.test.ts
```

## Writing New Tests

### Example: Testing a Simple Function

```typescript
describe("addNumbers", () => {
  it("should add two positive numbers correctly", () => {
    const result = addNumbers(2, 3);
    expect(result).toBe(5);
  });

  it("should handle negative numbers", () => {
    const result = addNumbers(-2, 3);
    expect(result).toBe(1);
  });
});
```

### Example: Testing Async Operations

```typescript
describe("getUser", () => {
  it("should fetch user from database", async () => {
    const user = await getUser("user-123");
    expect(user.id).toBe("user-123");
    expect(user.email).toBeDefined();
  });

  it("should throw error for non-existent user", async () => {
    await expect(getUser("invalid")).rejects.toThrow();
  });
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(5); // Exact equality
expect(obj).toEqual({ name: "John" }); // Deep equality

// Truthiness
expect(value).toBeTruthy(); // Any truthy value
expect(value).toBeFalsy(); // Any falsy value
expect(value).toBeNull(); // Explicitly null
expect(value).toBeDefined(); // Not undefined

// Numbers
expect(value).toBeGreaterThan(5);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(5.1);

// Strings
expect(text).toContain("substring");
expect(text).toMatch(/regex/);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain("item");

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith("arg");
expect(fn).rejects.toThrow();
```

## Testing Firebase Operations

### Mock Firebase

```typescript
import { jest } from "@jest/globals";

jest.mock("../src/services/firebase", () => ({
  auth: {
    currentUser: { uid: "test-user" },
  },
  db: {},
}));
```

### Test with Real Data (using Emulator)

```typescript
import { db } from "../src/services/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

it("should add and retrieve data", async () => {
  const docRef = await addDoc(collection(db, "users"), {
    name: "John",
    email: "john@example.com",
  });

  expect(docRef.id).toBeDefined();

  const querySnapshot = await getDocs(collection(db, "users"));
  expect(querySnapshot.size).toBeGreaterThan(0);
});
```

## Debugging Tests

### Print Debugging Output

```typescript
it("should debug the data", () => {
  const data = { name: "John", age: 30 };
  console.log("Data:", data); // Will appear in test output
  expect(data.name).toBe("John");
});
```

### Run Single Test

Use `test.only()` to run just one test:

```typescript
test.only("should test this one thing", () => {
  // Only this test runs
});
```

### Skip a Test

Use `test.skip()` to temporarily disable a test:

```typescript
test.skip("should skip this test", () => {
  // This test is skipped
});
```

## Coverage Goals

Our target coverage is:

- **Branches**: 70% - Most code paths tested
- **Functions**: 70% - Most functions tested
- **Lines**: 70% - Most lines executed in tests
- **Statements**: 70% - Most statements executed

View coverage report:

```bash
npm run test:coverage
```

## CI/CD Integration

In your CI/CD pipeline, run:

```bash
npm test -- --ci --coverage --watchAll=false
```

This runs tests once, generates coverage, and fails the build if coverage is below thresholds.

## Troubleshooting

### Issue: "Cannot find module 'firebase'"

**Solution:** Ensure Firebase is installed and `jest.config.json` has correct moduleNameMapper

### Issue: "ReferenceError: fetch is not defined"

**Solution:** Add `jest-fetch-mock` or use `node-fetch` polyfill in `setup.ts`

### Issue: "Timeout - Async callback was not invoked"

**Solution:** Increase timeout or ensure promises are properly resolved:

```typescript
jest.setTimeout(10000); // 10 seconds
```

### Issue: Firebase Emulator not connecting

**Solution:** Ensure emulator is running and `FIREBASE_EMULATOR_HOST` is set in `setup.ts`

## Firestore indexes (attendance queries)

Bounded attendance and admin analytics use composite indexes defined in `firestore.indexes.json`. Deploy them to each **school** Firebase project (not only the registry):

```bash
firebase deploy --only firestore:indexes --project YOUR_SCHOOL_PROJECT_ID
```

Or open the link from the in-app `failed-precondition` / index error in the Firebase console and click **Create index**. Indexes take a few minutes to build.

## Next Steps

1. Run `npm install` with test dependencies
2. Update `package.json` with test scripts
3. Run `npm test` to verify setup
4. Add Firebase Emulator setup for integration tests
5. Expand tests as you add new features
