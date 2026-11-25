
// Google Apps Script URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8pEL8lBSy7YGOddp0Jo_SYxQJiorNIO_UmaGSanoE7clMpvQt1NpKJKGHKRU8vw1-Vw/exec";

// รายการสินค้า
const products = [
    {
        sku: "SKU001",
        name: "แปรงสีฟัน Soft",
        price: 59
    },
    {
        sku: "SKU002",
        name: "แปรงสีฟัน Premium",
        price: 89
    }
];

// ตะกร้าสินค้า
let cart = [];


// เพิ่มสินค้าลงตะกร้า
function addToCart(sku) {

    const product = products.find(p => p.sku === sku);

    if (!product) {
        alert("ไม่พบสินค้า");
        return;
    }

    const item = cart.find(p => p.sku === sku);

    if (item) {
        item.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    showCart();
}


// แสดงรายการสินค้าในตะกร้า
function showCart() {

    const cartItems = document.getElementById("cartItems");

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="text-gray-400 text-center">
                ยังไม่มีสินค้าในตะกร้า
            </p>
        `;

    }

    cart.forEach((item, index) => {

        const subtotal = item.price * item.quantity;

        total += subtotal;

        const div = document.createElement("div");

        div.className =
            "flex justify-between items-center border-b py-4 gap-3";

        const name = document.createElement("span");

        name.textContent =
            `${item.name} x ${item.quantity} = ฿${subtotal}`;

        const button = document.createElement("button");

        button.textContent = "ลบ";

        button.className =
            "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600";

        button.onclick = function () {
            removeItem(index);
        };

        div.appendChild(name);
        div.appendChild(button);

        cartItems.appendChild(div);

    });

    document.getElementById("total").innerText =
        "฿" + total;
}


// ลบสินค้าออกจากตะกร้า
function removeItem(index) {

    cart.splice(index, 1);

    showCart();

}


// ยืนยันคำสั่งซื้อ
async function checkout() {

    const customer = document
        .getElementById("customer")
        .value.trim();

    const phone = document
        .getElementById("phone")
        .value.trim();

    const address = document
        .getElementById("address")
        .value.trim();


    // ตรวจสอบสินค้า
    if (cart.length === 0) {

        alert("กรุณาเลือกสินค้าก่อน");

        return;
    }


    // ตรวจสอบข้อมูลลูกค้า
    if (!customer || !phone || !address) {

        alert("กรุณากรอกข้อมูลจัดส่งให้ครบ");

        return;
    }


    // ตรวจสอบเบอร์โทรศัพท์
    if (!/^[0-9]{9,10}$/.test(phone)) {

        alert("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");

        return;
    }


    // สร้างข้อมูลคำสั่งซื้อ
    const order = {

        orderId: "ORD" + Date.now(),

        customer: customer,

        phone: phone,

        address: address,

        items: cart.map(item => ({
            sku: item.sku,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),

        total: cart.reduce(
            (sum, item) =>
                sum + (item.price * item.quantity), 0
        ),

        status: "รอจัดส่ง"

    };


    try {

        // ส่งข้อมูลไป Google Sheets
        await fetch(SCRIPT_URL, {

            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(order)

        });


        // แสดงใบปะหน้าพัสดุ
        showPacking(order);


        // แจ้งเตือน
        alert(
            "ส่งคำขอสั่งซื้อแล้ว เลขคำสั่งซื้อ: " +
            order.orderId
        );


        // ล้างตะกร้า
        cart = [];

        showCart();

        // ล้างข้อมูลลูกค้า
        document.getElementById("customer").value = "";

        document.getElementById("phone").value = "";

        document.getElementById("address").value = "";


    } catch (error) {

        alert("เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ");

        console.error(error);

    }

}


// แสดงใบปะหน้าพัสดุ
function showPacking(order) {

    const content = document.getElementById("packingContent");

    content.innerHTML = "";


    // หัวข้อ
    const title = document.createElement("h2");

    title.className = "text-2xl font-bold text-dark mb-4";

    title.textContent = "BRUSHY - ใบปะหน้าพัสดุ";

    content.appendChild(title);


    // ข้อมูลคำสั่งซื้อ
    const info = document.createElement("div");

    info.className = "space-y-3";


    const details = [
        "เลขคำสั่งซื้อ: " + order.orderId,
        "ชื่อผู้รับ: " + order.customer,
        "เบอร์โทร: " + order.phone,
        "ที่อยู่: " + order.address
    ];


    details.forEach(text => {

        const p = document.createElement("p");

        p.textContent = text;

        info.appendChild(p);

    });


    content.appendChild(info);


    // รายการสินค้า
    const heading = document.createElement("h3");

    heading.className = "text-xl font-bold mt-6 mb-3";

    heading.textContent = "รายการสินค้า";

    content.appendChild(heading);


    order.items.forEach(item => {

        const p = document.createElement("p");

        p.className = "py-2 border-b";

        p.textContent =
            `${item.name} (${item.sku}) x ${item.quantity}`;

        content.appendChild(p);

    });


    // ยอดรวม
    const total = document.createElement("h3");

    total.className =
        "text-2xl font-bold text-primary mt-6";

    total.textContent = "ยอดรวม: ฿" + order.total;

    content.appendChild(total);


    // สถานะ
    const status = document.createElement("p");

    status.className = "mt-3";

    status.textContent = "สถานะ: " + order.status;

    content.appendChild(status);


    // แสดงส่วนใบปะหน้า
    const packing = document.getElementById("packing");

    packing.style.display = "block";


    // เลื่อนหน้าจอไปยังใบปะหน้า
    packing.scrollIntoView({
        behavior: "smooth"
    });

}


// เริ่มต้นแสดงตะกร้าว่าง
showCart();
