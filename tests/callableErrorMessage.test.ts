import { FirebaseError } from "firebase/app";
import { getCallableErrorMessage } from "../src/utils/callableErrorMessage";

describe("getCallableErrorMessage", () => {
  it("returns server message for non-internal callable errors", () => {
    const err = new FirebaseError(
      "functions/not-found",
      "User profile not found.",
    );
    expect(getCallableErrorMessage(err, "fallback")).toBe(
      "User profile not found.",
    );
  });

  it("maps opaque NOT_FOUND to deploy guidance", () => {
    const err = new FirebaseError("functions/not-found", "NOT_FOUND");
    expect(getCallableErrorMessage(err, "fallback")).toContain(
      "not available for your school yet",
    );
  });

  it("uses fallback when internal errors hide the server message", () => {
    const err = new FirebaseError("functions/internal", "internal");
    expect(getCallableErrorMessage(err, "Could not set password.")).toBe(
      "Could not set password.",
    );
  });

  it("uses fallback when a wrapped Error only says INTERNAL", () => {
    expect(getCallableErrorMessage(new Error("INTERNAL"), "Could not set password.")).toBe(
      "Could not set password.",
    );
  });
});
