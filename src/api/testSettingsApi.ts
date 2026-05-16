import {
  addSetting,
  getAllSettings,
  getSetting,
  updateSetting,
} from "./settingsApi";

// RUN:
// npx tsx src/api/testSettingsApi.ts

async function runTest() {
  try {
    console.log("🚀 Iniciando test Settings API...\n");

    //
    // 1️⃣ GET ALL
    //
    console.log("1) Getting all settings...");

    const settings = await getAllSettings();

    console.log(`✅ Settings found: ${settings.length}`);
    console.log(settings);
    console.log();

    //
    // 2️⃣ GET SINGLE SETTING
    //
    if (settings.length > 0) {
      const firstCode = settings[0].code;

      console.log(`2) Getting setting: ${firstCode}`);

      const setting = await getSetting(firstCode);

      console.log("✅ Setting found:");
      console.log(setting);
      console.log();
    }

    //
    // 3️⃣ ADD SETTING
    //
    const testCode = `TestSetting-${Date.now()}`;

    console.log("3) Adding setting...");

    await addSetting({
      code: testCode,
      summary: "Test setting created from frontend",
      value: JSON.stringify({
        createdAt: new Date().toISOString(),
        active: true,
      }),
    });

    console.log("✅ Setting added\n");

    //
    // 4️⃣ GET NEW SETTING
    //
    console.log("4) Getting newly created setting...");

    const createdSetting = await getSetting(testCode);

    console.log("✅ Created setting:");
    console.log(createdSetting);

    try {
      console.log("Parsed JSON:");
      console.log(JSON.parse(createdSetting.value));
    } catch {
      console.log("Value is not JSON");
    }

    console.log();

    //
    // 5️⃣ UPDATE SETTING
    //
    console.log("5) Updating setting...");

    await updateSetting({
      ...createdSetting,
      value: JSON.stringify({
        updatedAt: new Date().toISOString(),
        active: false,
      }),
    });

    console.log("✅ Setting updated\n");

    //
    // 6️⃣ VALIDATE UPDATE
    //
    console.log("6) Validating updated setting...");

    const updatedSetting = await getSetting(testCode);

    console.log("✅ Updated setting:");
    console.log(updatedSetting);

    try {
      console.log("Parsed JSON:");
      console.log(JSON.parse(updatedSetting.value));
    } catch {
      console.log("Value is not JSON");
    }

    console.log();

    //
    // DONE
    //
    console.log("🎉 Test Settings completo OK");
  } catch (error) {
    console.error("❌ Error en test Settings:", error);
  }
}

runTest();

