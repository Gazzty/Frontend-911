// import {
//   createSensor,
//   deleteSensor,
//   getSensorById,
//   getSensors,
//   updateSensor,
//   getSensorPollingsByDate,
//   Sensor,
// } from "./sensorApi";

// async function runTest() {
//   try {
//     console.log("🚀 Iniciando test Sensor API...\n");

//     //
//     // 1️⃣ GET ALL
//     //
//     console.log("1) Getting all sensors...");

//     const sensors = await getSensors();

//     console.log(`✅ Sensors found: ${sensors.length}`);
//     console.log();

//     if (sensors.length === 0) {
//       throw new Error("No sensors found for test");
//     }

//     const existingRouteId =
//       sensors[0].sensorHardwareRouteId;

//     //
//     // 2️⃣ CREATE
//     //
//     console.log("2) Creating sensor...");

//     const newSensor = {
//       typeid: 1,
//       active: true,
//       sensorHardwareRouteId: existingRouteId,
//       pollingTimeInterval: 30,
//       cellId: null,
//       type: {
//         id: 1,
//         description: "Temperature",
//       },
//     };
//     console.log(JSON.stringify(newSensor, null, 2));

//     const createdId = await createSensor(newSensor);

//     console.log("✅ Sensor created");
//     console.log("🆔 New ID:", createdId);
//     console.log();

//     //
//     // 3️⃣ GET BY ID
//     //
//     console.log("3) Getting sensor by ID...");
//     const sensor = await getSensorById(createdId);

//     console.log("✅ Sensor found:");
//     console.log(sensor);
//     console.log();

//     //
//     // 4️⃣ UPDATE
//     //
//     console.log("4) Updating sensor...");

//     await updateSensor({
//       ...sensor,
//       pollingTimeInterval: sensor.pollingTimeInterval + 10,
//     });

//     console.log("✅ Sensor updated\n");

//     //
//     // 5️⃣ GET POLLINGS
//     //
//     console.log("5) Getting sensor pollings...");

//     const now = new Date();
//     const yesterday = new Date();
//     yesterday.setDate(now.getDate() - 1);

//     const pollings = await getSensorPollingsByDate({
//       sensorsIds: [createdId],
//       min: yesterday.toISOString(),
//       max: now.toISOString(),
//     });

//     console.log("✅ Pollings:");
//     console.log(JSON.stringify(pollings, null, 2));
//     console.log();

//     //
//     // 6️⃣ DELETE
//     //
//     console.log("6) Deleting sensor...");

//     await deleteSensor(createdId);

//     console.log("✅ Sensor deleted\n");

//     console.log("🎉 Test Sensor completo OK");
//   } catch (error) {
//     console.error("❌ Error en test Sensor:", error);
//   }
// }

// runTest();

import {
  getSensorById,
  getSensors,
  updateSensor,
  getSensorPollingsByDate,
} from "./sensorApi";

// RUN:
// npx tsx src/api/testSensorApi.ts

async function runTest() {

  try {

    console.log("🚀 Iniciando test Sensor API...\n");

    //
    // 1️⃣ GET ALL
    //
    console.log("1) Getting all sensors...");

    const sensors = await getSensors();

    console.log(`✅ Sensors found: ${sensors.length}`);
    console.log(sensors);
    console.log();

    if (sensors.length === 0) {
      throw new Error("No sensors found for test");
    }

    //
    // Use existing sensor for tests
    //
    const testSensor = sensors[0];

    console.log(
      `🧪 Using sensor ID ${testSensor.id} for tests\n`
    );

    //
    // 2️⃣ GET BY ID
    //
    console.log("2) Getting sensor by ID...");

    const sensor = await getSensorById(
      testSensor.id
    );

    console.log("✅ Sensor found:");
    console.log(sensor);
    console.log();

    //
    // 3️⃣ UPDATE
    //
    console.log("3) Updating sensor...");

    const newPollingInterval =
      sensor.pollingTimeInterval + 10;

    await updateSensor({
      ...sensor,
      pollingTimeInterval:
        newPollingInterval,
    });

    console.log("✅ Sensor updated\n");

    //
    // 4️⃣ VALIDATE UPDATE
    //
    console.log("4) Validating sensor update...");

    const updatedSensor = await getSensorById(
      sensor.id
    );

    console.log("✅ Updated sensor:");
    console.log(updatedSensor);
    console.log();

    if (
      updatedSensor.pollingTimeInterval !==
      newPollingInterval
    ) {

      throw new Error(
        "Polling interval update failed"
      );

    }

    console.log(
      "✅ Polling interval consistency OK\n"
    );

    //
    // 5️⃣ GET POLLINGS
    //
    console.log("5) Getting sensor pollings...");

    const now = new Date();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const pollings =
      await getSensorPollingsByDate({

        sensorsIds: [sensor.id],

        min: yesterday.toISOString(),

        max: now.toISOString(),

      });

    console.log("✅ Pollings:");
    console.log(
      JSON.stringify(pollings, null, 2)
    );

    console.log();

    //
    // DONE
    //
    console.log(
      "🎉 Test Sensor completo OK"
    );

  } catch (error) {

    console.error(
      "❌ Error en test Sensor:",
      error
    );

  }

}

runTest();