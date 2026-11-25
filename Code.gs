
function doPost(e) {
    try {
        const sheet = SpreadsheetApp
            .getActiveSpreadsheet()
            .getSheetByName("Orders");

        const order = JSON.parse(e.postData.contents);

        const items = order.items.map(item =>
            item.name + " (" + item.sku + ") x " + item.quantity
        ).join(", ");

        sheet.appendRow([
            new Date(),
            order.orderId,
            order.customer,
            order.phone,
            order.address,
            items,
            order.total,
            order.status
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({
                success: true,
                message: "บันทึกคำสั่งซื้อสำเร็จ"
            }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({
                success: false,
                message: error.toString()
            }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}
