import {
  getAllSettings,
  getSetting,

  updateTempMax,
  updatePollingInterval,
  updateEmails,
  updateEmailNotifications,
  updateWhatsappNotifications,
  updateSMSNotifications,
  updatePhoneNumber,

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

    const initialSettings = await getAllSettings();
    const initialCount = initialSettings.length;

    console.log(`✅ Settings found: ${initialCount}`);
    console.log(initialSettings);
    console.log();

    //
    // 2️⃣ UPDATE SETTINGS
    //
    console.log("2) Updating settings...");

    await updateTempMax("45");

    await updatePollingInterval("15");

    await updateEmails("updated@admin.com");

    await updateEmailNotifications("false");

    await updateWhatsappNotifications("true");

    await updateSMSNotifications("true");

    await updatePhoneNumber("987654321");

    console.log("✅ Settings updated\n");

    //
    // 3️⃣ VALIDATE COUNT
    //
    console.log("3) Validating settings count...");

    const finalSettings = await getAllSettings();
    const finalCount = finalSettings.length;

    console.log(`✅ Final settings count: ${finalCount}`);

    //
    // Updates should NOT create new rows
    //
    if (finalCount !== initialCount) {

      throw new Error(
        `Inconsistent count after update. Expected ${initialCount}, got ${finalCount}`
      );

    }

    console.log("✅ Count consistency OK\n");

    //
    // 4️⃣ VALIDATE UPDATED VALUES
    //
    console.log("4) Validating updated values...\n");

    const tempMax = await getSetting("TempMax");

    console.log("TempMax:", tempMax);

    if (tempMax.value !== "45") {
      throw new Error("TempMax update failed");
    }

    const polling = await getSetting(
      "IntervalPollingDefault"
    );

    console.log("Polling:", polling);

    if (polling.value !== "15") {
      throw new Error("Polling update failed");
    }

    const emails = await getSetting("Emails");

    console.log("Emails:", emails);

    if (emails.value !== "updated@admin.com") {
      throw new Error("Emails update failed");
    }

    const emailNotifications = await getSetting(
      "EmailsNotification"
    );

    console.log(
      "Email notifications:",
      emailNotifications
    );

    if (emailNotifications.value !== "false") {
      throw new Error(
        "Email notifications update failed"
      );
    }

    const whatsapp = await getSetting(
      "WhatsappNotification"
    );

    console.log("WhatsApp:", whatsapp);

    if (whatsapp.value !== "true") {
      throw new Error(
        "WhatsApp notifications update failed"
      );
    }

    const sms = await getSetting(
      "SMSNotification"
    );

    console.log("SMS:", sms);

    if (sms.value !== "true") {
      throw new Error(
        "SMS notifications update failed"
      );
    }

    const phone = await getSetting(
      "PhoneNumber"
    );

    console.log("Phone:", phone);

    if (phone.value !== "987654321") {
      throw new Error("Phone update failed");
    }

    console.log();

    //
    // DONE
    //
    console.log("🎉 Test Settings completo OK");

  } catch (error) {

    console.error(
      "❌ Error en test Settings:",
      error
    );

  }

}

runTest();