import {
  createCell,
  deleteCell,
  getCellById,
  getCellFullById,
  getCells,
  getCellsFull,
  updateCell,
  Cell,
} from "./cellApi";

// RUN:
// npx tsx src/api/testCellApi.ts

async function runTest() {
  try {
    console.log("🚀 Iniciando test Cell API...\n");

    //
    // 1️⃣ GET ALL
    //
    console.log("1) Getting all cells...");

    const cells = await getCells();

    console.log(`✅ Cells found: ${cells.length}\n`);
    console.log("✅ Cells found:", cells.map(x => x.id));

    //
    // 2️⃣ CREATE
    //
    console.log("2) Creating cell...");

    const newCell: Cell = {
      id: 0,
      description: `Test Cell ${Date.now()}`,
      latitude: "-34.6037",
      longitude: "-58.3816",
      active: true,
      sensors: [],
    };

    const createResult = await createCell(newCell);

    console.log("✅ Cell created");
    console.log("🆔 New ID:", createResult.id);

    if (createResult.warnings.length > 0) {
      console.log("⚠️ Warnings:", createResult.warnings);
    }

    console.log();

    const createdId = createResult.id;

    //
    // 3️⃣ GET BY ID
    //
    console.log("3) Getting cell by ID...");

    const createdCell = await getCellById(createdId);

    console.log("✅ Cell found:");
    console.log(createdCell);
    console.log();

    //
    // 4️⃣ GET FULL BY ID
    //
    console.log("4) Getting full cell by ID...");

    const fullCell = await getCellFullById(createdId);

    console.log("✅ Full cell:");
    console.log(fullCell);
    console.log();

    //
    // 5️⃣ UPDATE
    //
    console.log("5) Updating cell...");

    await updateCell({
      ...fullCell,
      description: `${fullCell.description} UPDATED`,
    });

    console.log("✅ Cell updated\n");

    //
    // 6️⃣ GET FULL LIST
    //
    console.log("6) Getting full cells list...");

    const fullCells = await getCellsFull();

    console.log(`✅ Full cells count: ${fullCells.length}\n`);
    console.log("✅ Full cells:", fullCells.map(x => x.id));

    //
    // 7️⃣ DELETE
    //
    console.log("7) Deleting cell...");

    await deleteCell(createdId);

    console.log("✅ Cell deleted\n");

    //
    // DONE
    //
    console.log("🎉 Test Cell completo OK");
  } catch (error) {
    console.error("❌ Error en test Cell:", error);
  }
}

runTest();