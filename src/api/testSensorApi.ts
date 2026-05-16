import {
  createSensor,
  deleteSensor,
  getSensorById,
  getSensors,
  updateSensor,
  getSensorPollingsByDate,
  Sensor,
} from "./sensorApi";

async function runTest() {
  try {
    console.log("🚀 Iniciando test Sensor API...\n");

    //
    // 1️⃣ GET ALL
    //
    console.log("1) Getting all sensors...");
    const sensors = await getSensors();

    console.log(`✅ Sensors found: ${sensors.length}`);
    console.log();

    //
    // 2️⃣ CREATE
    //
    console.log("2) Creating sensor...");

    const newSensor = {
      active: true,
      sensorHardwareRouteId: 1000,
      pollingTimeInterval: 30,
      cellId: 1,
      type: {
        id: 1,
        description: "Temperature",
      },
    };

    const createdId = await createSensor(newSensor);

    console.log("✅ Sensor created");
    console.log("🆔 New ID:", createdId);
    console.log();

    //
    // 3️⃣ GET BY ID
    //
    console.log("3) Getting sensor by ID...");
    const sensor = await getSensorById(createdId);

    console.log("✅ Sensor found:");
    console.log(sensor);
    console.log();

    //
    // 4️⃣ UPDATE
    //
    console.log("4) Updating sensor...");

    await updateSensor({
      ...sensor,
      pollingTimeInterval: sensor.pollingTimeInterval + 10,
    });

    console.log("✅ Sensor updated\n");

    //
    // 5️⃣ GET POLLINGS
    //
    console.log("5) Getting sensor pollings...");

    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const pollings = await getSensorPollingsByDate({
      sensorsIds: [createdId],
      min: yesterday.toISOString(),
      max: now.toISOString(),
    });

    console.log("✅ Pollings:");
    console.log(JSON.stringify(pollings, null, 2));
    console.log();

    //
    // 6️⃣ DELETE
    //
    console.log("6) Deleting sensor...");

    await deleteSensor(createdId);

    console.log("✅ Sensor deleted\n");

    console.log("🎉 Test Sensor completo OK");
  } catch (error) {
    console.error("❌ Error en test Sensor:", error);
  }
}

runTest();