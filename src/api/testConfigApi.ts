import {
  getConfigGeneral,
  updateConfigGeneral,
  getConfigNotifications,
  updateConfigNotifications,
} from "./configApi";

// RUN: npx tsx src/api/testConfigApi.ts

async function runTest() {
  try {
    console.log("🚀 Iniciando test Config API...\n");

    //
    // 1️⃣ GET CONFIG GENERAL
    //
    console.log("1) Getting config general...");
    const configGeneral = await getConfigGeneral();
    if (!configGeneral) throw new Error("No config general");
    console.log("⚙️ Config General:", configGeneral, "\n");

    //
    // 2️⃣ UPDATE CONFIG GENERAL
    //
    console.log("2) Updating config general...");
    await updateConfigGeneral({
      interval: configGeneral.interval + 1,
      thresholdTemperature: configGeneral.thresholdTemperature + 1,
    });
    console.log("✅ Config general updated\n");

    //
    // 3️⃣ GET CONFIG NOTIFICATIONS
    //
    console.log("3) Getting config notifications...");
    const configNotif = await getConfigNotifications();
    console.log("📩 Config Notifications:", configNotif, "\n");

    //
    // 4️⃣ UPDATE CONFIG NOTIFICATIONS
    //
    console.log("4) Updating config notifications...");
    await updateConfigNotifications({
      email: configNotif.email,
      emailActive: !configNotif.emailActive,
      whatsappNumber: configNotif.whatsappNumber,
      whatsappActive: !configNotif.whatsappActive,
      smsNumber: configNotif.smsNumber,
      smsActive: !configNotif.smsActive,
    });
    console.log("✅ Config notifications updated\n");

    console.log("🎉 Test Config completo OK");
  } catch (error) {
    console.error("❌ Error en test Config:", error);
  }
}

runTest();