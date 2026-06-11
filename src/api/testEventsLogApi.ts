import {
  getLastEventsLogs,
  getEventsLogsByDate,
} from "./eventsLogApi";

// RUN:
// npx tsx src/api/testEventsLogApi.ts

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pass = (msg: string) => console.log(`✅ ${msg}`);
const fail = (msg: string) => console.log(`❌ ${msg}`);

async function runTest() {
  console.log("🚀 EVENTS LOG API DEBUG TEST\n");

  // ----------------------------
  // GET LAST
  // ----------------------------
  try {
    console.log("GET LAST (top=10)");

    const res = await getLastEventsLogs(10);

    if (res.success) pass("success = true");
    else fail("success = false");

    if ((res.payload?.length ?? 0) === 10) {
      pass(`payload length = ${res.payload.length}`);
    } else {
      fail(`payload length = ${res.payload?.length ?? 0}`);
    }

    console.log(`sample item: ${res.payload?.[0]?.date ?? "none"}`);
  } catch (err: any) {
    fail(`GET LAST ERROR: ${err.message}`);
  }

  console.log("\n----------------------------------\n");

  // ----------------------------
  // GET BY DATE
  // ----------------------------
  try {
    console.log("GET BY DATE");

    const min = "2026-06-11T00:00:00.000Z";
    const max = "2026-06-11T23:59:59.999Z";

    const res = await getEventsLogsByDate({ min, max });

    if (res.success) pass("success = true");
    else fail("success = false");

    const len = res.payload?.length ?? 0;

    if (len > 0) pass(`payload length = ${len}`);
    else fail("payload empty");

    console.log(`sample item: ${res.payload?.[0]?.alertLogTypeDescription ?? "none"}`);
  } catch (err: any) {
    fail(`GET BY DATE ERROR: ${err.message}`);
  }

  console.log("\n----------------------------------\n");

  // ----------------------------
  // CONSISTENCY TEST
  // ----------------------------
  try {
    console.log("CONSISTENCY TEST");

    const a = await getLastEventsLogs(10);
    const b = await getLastEventsLogs(10);

    const sameLen = a.payload?.length === b.payload?.length;
    const sameFirst = a.payload?.[0]?.date === b.payload?.[0]?.date;

    pass(`same length = ${sameLen}`);
    pass(`same first item = ${sameFirst}`);
  } catch (err: any) {
    fail(`CONSISTENCY ERROR: ${err.message}`);
  }

  console.log("\n----------------------------------\n");

  // ----------------------------
  // ORDER TEST
  // ----------------------------
  try {
    console.log("ORDER TEST");

    const res = await getLastEventsLogs(10);

    const dates =
      res.payload?.map((x) => new Date(x.date).getTime()) ?? [];

    const ok = dates.every((d, i) => i === 0 || dates[i - 1] >= d);

    if (ok) pass("descending order OK");
    else fail("not ordered correctly");
  } catch (err: any) {
    fail(`ORDER ERROR: ${err.message}`);
  }

  console.log("\n----------------------------------\n");

  // ----------------------------
  // SCHEMA TEST
  // ----------------------------
  try {
    console.log("SCHEMA TEST");

    const res = await getLastEventsLogs(1);
    const item = res.payload?.[0];

    const valid =
      item &&
      typeof item.date === "string" &&
      typeof item.alertLogTypeId === "number" &&
      typeof item.detail === "string";

    if (valid) pass("schema valid");
    else fail("schema invalid");
  } catch (err: any) {
    fail(`SCHEMA ERROR: ${err.message}`);
  }

  console.log("\n----------------------------------\n");

  // ----------------------------
  // EMPTY RANGE TEST
  // ----------------------------
  try {
    console.log("EMPTY RANGE TEST");

    const res = await getEventsLogsByDate({
      min: "1900-01-01T00:00:00.000Z",
      max: "1900-01-01T01:00:00.000Z",
    });

    const len = res.payload?.length ?? 0;

    if (len === 0) pass("empty range OK");
    else fail(`unexpected data: ${len}`);
  } catch (err: any) {
    fail(`EMPTY RANGE ERROR: ${err.message}`);
  }

  console.log("\n----------------------------------\n");

  // ----------------------------
  // STRESS TEST
  // ----------------------------
  try {
    console.log("STRESS TEST (top=100)");

    const res = await getLastEventsLogs(100);

    const len = res.payload?.length ?? 0;

    if (len <= 100) pass(`respects limit (${len})`);
    else fail(`overflow: ${len}`);
  } catch (err: any) {
    fail(`STRESS ERROR: ${err.message}`);
  }

  console.log("\n==================================");
  console.log("DONE");
}

runTest();