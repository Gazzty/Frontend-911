import {
  createCell,
  getCells,
  updateCell,
  getCellById,
  deleteCell,
} from "./cellApi";

// RUN: npx tsx src/api/testCellApi.ts

async function runTest() {
  try {
    console.log("🚀 Iniciando test...\n");

    // 1️⃣ CREATE
    console.log("1) Creating cell...");
    const newId = await createCell({
      description: "Test Cell",
      sensors: [],
      latitude: "-34.6",
      longitude: "-58.4",
      active: true,
    });
    console.log("✅ Created with ID:", newId, "\n");

    // 2️⃣ GET ALL
    console.log("2) Getting all cells...");
    const allCells = await getCells();
    console.log("📦 Cells:", allCells, "\n");

    // 3️⃣ UPDATE
    console.log("3) Updating cell...");
    await updateCell({
      id: newId,
      description: "Updated Cell",
      sensors: [],
      latitude: "-34.61",
      longitude: "-58.41",
      active: true,
    });
    console.log("✅ Updated\n");

    // 4️⃣ GET BY ID
    console.log("4) Getting cell by ID...");
    const cell = await getCellById(newId);
    console.log("🔎 Cell:", cell, "\n");

    // 5️⃣ DELETE
    console.log("5) Deleting cell...");
    await deleteCell(newId);
    console.log("🗑️ Deleted\n");

    console.log("🎉 Test completo OK");
  } catch (error) {
    console.error("❌ Error en el test:", error);
  }
}

runTest();