const PDFDocument = require("pdfkit");

const generateResultsPdf = (request, items) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];

      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      doc.fontSize(18).text("LabTrack Test Results", { align: "center" });
      doc.moveDown(1);

      doc.fontSize(12).text(`Request ID: ${request._id}`);
      doc.text(`Patient: ${request.patientId.name}`);
      doc.text(`Patient Email: ${request.patientId.email}`);
      doc.text(`Doctor: ${request.doctorId?.name || "N/A"}`);
      doc.text(`Status: ${request.status.replace(/_/g, " ").toUpperCase()}`);
      doc.text(`Created At: ${request.createdAt.toLocaleString()}`);
      doc.moveDown(1);

      doc.fontSize(14).text("Results Summary", { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const itemPositions = {
        name: 50,
        value: 260,
        unit: 360,
        range: 430,
        notes: 520,
      };

      doc.fontSize(10).text("Test", itemPositions.name, tableTop, { bold: true });
      doc.text("Value", itemPositions.value, tableTop);
      doc.text("Unit", itemPositions.unit, tableTop);
      doc.text("Range", itemPositions.range, tableTop);
      doc.text("Notes", itemPositions.notes, tableTop);

      doc.moveTo(50, tableTop + 15)
        .lineTo(560, tableTop + 15)
        .stroke();

      let y = tableTop + 25;

      items.forEach((item) => {
        const valueText = item.resultValue !== null && item.resultValue !== undefined ? String(item.resultValue) : "-";
        const rangeText = item.testTypeId?.normalRange || "-";
        const unitText = item.testTypeId?.unit || "-";
        const notesText = item.notes || "-";

        doc.text(item.testTypeId?.name || "Unknown Test", itemPositions.name, y, {
          width: 200,
          ellipsis: true,
        });
        doc.text(valueText, itemPositions.value, y);
        doc.text(unitText, itemPositions.unit, y);
        doc.text(rangeText, itemPositions.range, y);
        doc.text(notesText, itemPositions.notes, y, { width: 110, ellipsis: true });

        y += 20;
        if (y > 720) {
          doc.addPage();
          y = 50;
        }
      });

      doc.moveDown(2);
      doc.fontSize(10).text("This PDF contains the final lab test results for your request.", {
        align: "left",
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateResultsPdf;
