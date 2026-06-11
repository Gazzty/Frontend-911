import { sendFiredPolling } from "./firedApi";

type Expected = {
  success: boolean;
  errors: string[];
  warning: string[];
};

type TestCase = {
  category: string;
  input: string;
  expected: Expected;
};

// ----------------------------
// helpers
// ----------------------------
function sameArray(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

// ----------------------------
// TEST CASES (FULL SUITE 19)
// ----------------------------
const TEST_CASES: TestCase[] = [
  // =========================
  // 🟢 NORMAL
  // =========================
  {
    category: "NORMAL",
    input: "1:22,3|3:0;6:23,5|7:0",
    expected: { success: true, errors: [], warning: [] },
  },

  // =========================
  // 🔴 FALLAS INDIVIDUALES
  // =========================
  {
    category: "FAIL - sensor 1",
    input: "1:E|3:0;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: ["El sensor 1 del hardwareroute 1 tiene una medición errónea."],
    },
  },
  {
    category: "FAIL - sensor 2",
    input: "1:22,3|3:E;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: ["El sensor 2 del hardwareroute 3 tiene una medición errónea."],
    },
  },
  {
    category: "FAIL - sensor 3",
    input: "1:22,3|3:0;6:E|7:0",
    expected: {
      success: true,
      errors: [],
      warning: ["El sensor 3 del hardwareroute 6 tiene una medición errónea."],
    },
  },
  {
    category: "FAIL - sensor 4",
    input: "1:22,3|3:0;6:23,5|7:E",
    expected: {
      success: true,
      errors: [],
      warning: ["El sensor 4 del hardwareroute 7 tiene una medición errónea."],
    },
  },

  // =========================
  // 🔴 FALLA CELDA COMPLETA
  // =========================
  {
    category: "FAIL - dual sensors",
    input: "1:E|3:E;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 1 del hardwareroute 1 tiene una medición errónea.",
        "El sensor 2 del hardwareroute 3 tiene una medición errónea.",
      ],
    },
  },
  {
    category: "FAIL - mixed cell",
    input: "1:22,3|3:0;6:E|7:E",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 3 del hardwareroute 6 tiene una medición errónea.",
        "El sensor 4 del hardwareroute 7 tiene una medición errónea.",
      ],
    },
  },

  // =========================
  // 🔴 TODO FALLA
  // =========================
  {
    category: "ALL FAIL",
    input: "1:E|3:E;6:E|7:E",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 1 del hardwareroute 1 tiene una medición errónea.",
        "El sensor 2 del hardwareroute 3 tiene una medición errónea.",
        "El sensor 3 del hardwareroute 6 tiene una medición errónea.",
        "El sensor 4 del hardwareroute 7 tiene una medición errónea.",
      ],
    },
  },

  // =========================
  // 🟡 MIX EDGE CASES
  // =========================
  {
    category: "MIX 1",
    input: "1:E|3:E;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 1 del hardwareroute 1 tiene una medición errónea.",
        "El sensor 2 del hardwareroute 3 tiene una medición errónea.",
      ],
    },
  },
  {
    category: "MIX 2",
    input: "1:E|3:0;6:E|7:0",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 1 del hardwareroute 1 tiene una medición errónea.",
        "El sensor 3 del hardwareroute 6 tiene una medición errónea.",
      ],
    },
  },
  {
    category: "MIX 3",
    input: "1:E|3:0;6:23,5|7:E",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 1 del hardwareroute 1 tiene una medición errónea.",
        "El sensor 4 del hardwareroute 7 tiene una medición errónea.",
      ],
    },
  },
  {
    category: "MIX 4",
    input: "1:22,3|3:E;6:E|7:0",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 2 del hardwareroute 3 tiene una medición errónea.",
        "El sensor 3 del hardwareroute 6 tiene una medición errónea.",
      ],
    },
  },
  {
    category: "MIX 5",
    input: "1:22,3|3:E;6:23,5|7:E",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 2 del hardwareroute 3 tiene una medición errónea.",
        "El sensor 4 del hardwareroute 7 tiene una medición errónea.",
      ],
    },
  },
  {
    category: "MIX 6",
    input: "1:22,3|3:0;6:E|7:E",
    expected: {
      success: true,
      errors: [],
      warning: [
        "El sensor 3 del hardwareroute 6 tiene una medición errónea.",
        "El sensor 4 del hardwareroute 7 tiene una medición errónea.",
      ],
    },
  },

  // =========================
  // 🔥 FIRE EVENTS
  // =========================
  {
    category: "FIRE 1",
    input: "1:22,3|3:1;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: ["FUEGO. Sensor 2 del hardwareroute 3 arrojó medición alerta de fuego."],
    },
  },
  {
    category: "FIRE 2",
    input: "1:22,3|3:0;6:23,5|7:1",
    expected: {
      success: true,
      errors: [],
      warning: ["FUEGO. Sensor 4 del hardwareroute 7 arrojó medición alerta de fuego."],
    },
  },
  {
    category: "FIRE 3",
    input: "1:22,3|3:1;6:23,5|7:1",
    expected: {
      success: true,
      errors: [],
      warning: [
        "FUEGO. Sensor 2 del hardwareroute 3 arrojó medición alerta de fuego.",
        "FUEGO. Sensor 4 del hardwareroute 7 arrojó medición alerta de fuego.",
      ],
    },
  },

  // =========================
  // 🌡 PARSE ERRORS
  // =========================
  {
    category: "PARSE dot decimal",
    input: "1:27.5|3:0;6:23,5|7:0",
    expected: {
      success: false,
      errors: ["Input string was not in a correct format."],
      warning: [],
    },
  },
  {
    category: "PARSE mixed decimal",
    input: "1:22,3|3:0;6:27.5|7:0",
    expected: {
      success: false,
      errors: ["Input string was not in a correct format."],
      warning: [],
    },
  },
  // =========================
  // 🔥 IR FORMAT EDGE CASES
  // =========================
  {
    category: "IR decimal point sensor 2",
    input: "1:22,3|3:0.0;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: [],
    },
  },
  {
    category: "IR decimal comma sensor 2",
    input: "1:22,3|3:0,0;6:23,5|7:0",
    expected: {
      success: true,
      errors: [],
      warning: [],
    },
  },
  {
    category: "IR decimal comma sensor 4",
    input: "1:22,3|3:0;6:23,5|7:0,0",
    expected: {
      success: true,
      errors: [],
      warning: [],
    },
  },
  {
    category: "IR decimal point sensor 4",
    input: "1:22,3|3:0;6:23,5|7:0.0",
    expected: {
      success: true,
      errors: [],
      warning: [],
    },
  },

  // =========================
  // 🛰 INVALID SENSOR IDS
  // =========================
  {
    category: "INVALID ID 129 temp sensor 1",
    input: "129:22,3|3:0;6:23,5|7:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID ID 129 ir sensor 2",
    input: "1:22,3|129:0;6:23,5|7:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID ID 129 temp sensor 3",
    input: "1:22,3|3:0;129:23,5|7:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID ID 129 ir sensor 4",
    input: "1:22,3|3:0;6:23,5|129:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },

  // =========================
  // 🛰 MULTIPLE INVALID IDS
  // =========================
  {
    category: "INVALID IDS 129 130 cell 1",
    input: "129:22,3|130:0;6:23,5|7:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID IDS 129 130 cell 2",
    input: "1:22,3|3:0;129:23,5|130:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID IDS mixed A",
    input: "129:22,3|3:0;130:23,5|7:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID IDS mixed B",
    input: "1:22,3|129:0;130:23,5|7:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },
  {
    category: "INVALID IDS mixed C",
    input: "1:22,3|129:0;6:23,5|130:0",
    expected: {
      success: false,
      errors: ["Nullable object must have a value."],
      warning: [],
    },
  },  
];

// ----------------------------
// RUNNER
// ----------------------------
async function runTest() {
  console.log("🚀 Fired API DEBUG TEST\n");

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];

    console.log(`\n[${i + 1}] ${tc.category}`);
    console.log("INPUT:", tc.input);

    const res = await sendFiredPolling(tc.input);

    const successMatch = res.success === tc.expected.success;
    const errorsMatch = sameArray(res.errors ?? [], tc.expected.errors);
    const warningMatch = sameArray(res.warning ?? [], tc.expected.warning);

    const match = successMatch && errorsMatch && warningMatch;

    console.log("\nRESULT:");
    console.log("  success:", res.success);
    console.log("  errors:", JSON.stringify(res.errors ?? []));
    console.log("  warning:", JSON.stringify(res.warning ?? []));

    console.log("\nEXPECTED:");
    console.log("  success:", tc.expected.success);
    console.log("  errors:", JSON.stringify(tc.expected.errors));
    console.log("  warning:", JSON.stringify(tc.expected.warning));

    console.log("\nSTATUS:", match ? "OK" : "ERROR");

    if (match) ok++;
    else fail++;

    console.log("----------------------------------------------");
  }

  console.log("\n======================");
  console.log("SUMMARY");
  console.log("======================");
  console.log("OK:", ok);
  console.log("FAIL:", fail);
  console.log("TOTAL:", TEST_CASES.length);
}

runTest();