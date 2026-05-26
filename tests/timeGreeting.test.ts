import { getTimeGreetingParts } from "../src/utils/timeGreeting";

describe("getTimeGreetingParts", () => {
  const realDate = Date;

  afterEach(() => {
    global.Date = realDate;
  });

  function mockHour(hour: number) {
    global.Date = class extends realDate {
      constructor() {
        super();
      }
      getHours() {
        return hour;
      }
    } as DateConstructor;
  }

  it("returns morning before noon", () => {
    mockHour(8);
    expect(getTimeGreetingParts("dashboard")).toEqual({
      key: "dashboard.goodMorning",
      icon: "sunny-outline",
    });
  });

  it("returns afternoon between noon and 6pm", () => {
    mockHour(14);
    expect(getTimeGreetingParts("teacher.dashboard")).toEqual({
      key: "teacher.dashboard.goodAfternoon",
      icon: "partly-sunny-outline",
    });
  });

  it("returns evening after 6pm", () => {
    mockHour(20);
    expect(getTimeGreetingParts("dashboard")).toEqual({
      key: "dashboard.goodEvening",
      icon: "moon-outline",
    });
  });
});
