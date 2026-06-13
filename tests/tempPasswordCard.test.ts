import {
  buildTempPasswordPayload,
  encodeTempPasswordPayload,
  parseTempPasswordQrData,
} from "../src/utils/tempPasswordCard";

describe("parseTempPasswordQrData", () => {
  it("parses a valid eduTrack temp login payload", () => {
    const payload = buildTempPasswordPayload({
      email: "Student@School.edu",
      password: "TempPass1",
      name: "Alex Student",
    });
    const raw = encodeTempPasswordPayload(payload);

    expect(parseTempPasswordQrData(raw)).toEqual({
      type: "edutrack-temp-login",
      v: 1,
      email: "student@school.edu",
      password: "TempPass1",
      name: "Alex Student",
    });
  });

  it("rejects invalid or unrelated QR payloads", () => {
    expect(parseTempPasswordQrData("")).toBeNull();
    expect(parseTempPasswordQrData("https://example.com")).toBeNull();
    expect(parseTempPasswordQrData(JSON.stringify({ type: "other", v: 1 }))).toBeNull();
    expect(
      parseTempPasswordQrData(
        JSON.stringify({
          type: "edutrack-temp-login",
          v: 1,
          email: "",
          password: "x",
        }),
      ),
    ).toBeNull();
  });
});
