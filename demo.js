const menusDefault=[
{name:"Ayam Gepuk Kecil + Nasi",cat:"Ayam Gepuk",price:15000,stock:40},
{name:"Ayam Gepuk Besar + Nasi",cat:"Ayam Gepuk",price:23000,stock:35},
{name:"Ayam Gepuk Kecil - Nasi",cat:"Ayam Gepuk",price:12000,stock:30},
{name:"Ayam Gepuk Besar - Nasi",cat:"Ayam Gepuk",price:20000,stock:30},
{name:"Nasi",cat:"Pelengkap",price:5000,stock:60},
{name:"Sambal",cat:"Pelengkap",price:4000,stock:50},
{name:"Tempe",cat:"Pelengkap",price:1000,stock:80},
{name:"Es Teh Manis",cat:"Minuman",price:3000,stock:70},
{name:"Air Mineral",cat:"Minuman",price:3000,stock:70},
{name:"Ketan Susu Kelapa",cat:"Ketan Susu",price:7000,stock:40},
{name:"Ketan Susu Bubuk Kedelai",cat:"Ketan Susu",price:7000,stock:40},
{name:"Ketan Susu Kelapa + Bubuk Kedelai",cat:"Ketan Susu",price:9000,stock:35},
{name:"Ketan Susu Keju",cat:"Ketan Susu",price:10000,stock:35},
{name:"Ketan Susu Oreo",cat:"Ketan Susu",price:10000,stock:35},
{name:"Ketan Susu Cokelat",cat:"Ketan Susu",price:10000,stock:35}
];

const state={
 menus:JSON.parse(localStorage.getItem("sk_demo_menus")||"null")||menusDefault,
 sales:JSON.parse(localStorage.getItem("sk_demo_sales")||"[]"),
 purchases:JSON.parse(localStorage.getItem("sk_demo_purchases")||"[]"),
 cash:JSON.parse(localStorage.getItem("sk_demo_cash")||"[]"),
 cart:[], category:"Semua Menu", pay:"CASH"
};
function save(){localStorage.setItem("sk_demo_menus",JSON.stringify(state.menus));localStorage.setItem("sk_demo_sales",JSON.stringify(state.sales));localStorage.setItem("sk_demo_purchases",JSON.stringify(state.purchases));localStorage.setItem("sk_demo_cash",JSON.stringify(state.cash))}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(n)}
function toast(t){const x=document.getElementById("toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function totalCart(){return state.cart.reduce((s,x)=>s+x.price*x.qty,0)}
function renderCategories(){
 const cats=["Semua Menu",...new Set(state.menus.map(x=>x.cat))];
 document.getElementById("categories").innerHTML=cats.map(c=>`<button class="chip ${state.category===c?"active":""}" data-cat="${c}">${c}</button>`).join("");
 document.querySelectorAll(".chip").forEach(b=>b.onclick=()=>{state.category=b.dataset.cat;renderProducts();renderCategories()});
}
function renderProducts(){
 const q=document.getElementById("searchMenu").value.toLowerCase();
 const list=state.menus.filter(x=>(state.category==="Semua Menu"||x.cat===state.category)&&x.name.toLowerCase().includes(q));
 document.getElementById("productGrid").innerHTML=list.map((m,i)=>`<div class="product"><h3>${m.name}</h3><small>${m.cat} • Stok demo: ${m.stock}</small><div class="price">${rupiah(m.price)}</div><button class="primary" data-add="${state.menus.indexOf(m)}">+ Tambah</button></div>`).join("");
 document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>addCart(+b.dataset.add));
}
function addCart(i){const m=state.menus[i];const x=state.cart.find(x=>x.i===i);if(x){if(x.qty>=m.stock)return toast("Stok demo tidak mencukupi");x.qty++}else state.cart.push({i,qty:1,name:m.name,price:m.price});renderCart();toast("Menu ditambahkan ke keranjang")}
function renderCart(){
 const el=document.getElementById("cartItems");
 el.innerHTML=state.cart.length?state.cart.map((x,k)=>`<div class="cart-row"><div><div class="cart-name">${x.name}</div><div class="cart-price">${rupiah(x.price)} × ${x.qty}</div></div><div class="qty"><button onclick="changeQty(${k},-1)">−</button><strong>${x.qty}</strong><button onclick="changeQty(${k},1)">+</button></div></div>`).join(""):`<div class="empty">Keranjang masih kosong.<br><br>Pilih menu untuk mencoba transaksi.</div>`;
 const t=totalCart();document.getElementById("cartTotal").textContent=rupiah(t);updateChange();
}
function changeQty(k,d){const x=state.cart[k],m=state.menus[x.i];x.qty+=d;if(x.qty>m.stock)x.qty=m.stock;if(x.qty<=0)state.cart.splice(k,1);renderCart()}
function updateChange(){const t=totalCart(),paid=Number(document.getElementById("cashPaid").value||0);document.getElementById("change").textContent=rupiah(Math.max(0,paid-t))}
document.getElementById("searchMenu").oninput=renderProducts;
document.getElementById("cashPaid").oninput=updateChange;
document.getElementById("clearCart").onclick=()=>{state.cart=[];renderCart()};
document.querySelectorAll(".pay").forEach(b=>b.onclick=()=>{state.pay=b.dataset.pay;document.querySelectorAll(".pay").forEach(x=>x.classList.remove("active"));b.classList.add("active");document.getElementById("cashPaid").style.display=state.pay==="CASH"?"block":"none";document.getElementById("cashLabel").style.display=state.pay==="CASH"?"block":"none";updateChange()});
document.getElementById("checkout").onclick=checkout;
function checkout(){
 const total=totalCart();if(!total)return toast("Keranjang masih kosong");
 const paid=state.pay==="CASH"?Number(document.getElementById("cashPaid").value||0):total;
 if(state.pay==="CASH"&&paid<total)return toast("Uang dibayar kurang");
 const now=new Date();
 const sale={id:"DEMO-"+Date.now(),time:now.toLocaleString("id-ID"),items:state.cart.map(x=>({...x})),total,pay:state.pay,paid,change:paid-total};
 state.sales.unshift(sale);state.cart.forEach(x=>state.menus[x.i].stock-=x.qty);
 if(state.pay==="CASH")state.cash.unshift({time:now.toLocaleString("id-ID"),desc:"Penjualan "+sale.id,type:"Masuk",amount:total});
 save();showReceipt(sale);state.cart=[];document.getElementById("cashPaid").value="";renderAll();
}
function showReceipt(s){
 document.getElementById("receipt").innerHTML=`<div class="receipt"><h2>SolusiKasirKu</h2><p>DEMO SISTEM KASIR<br>${s.time}</p>${s.items.map(x=>`<div class="receipt-line"><span>${x.name} x${x.qty}</span><span>${rupiah(x.price*x.qty)}</span></div>`).join("")}<div class="receipt-line receipt-total"><span>TOTAL</span><span>${rupiah(s.total)}</span></div><div class="receipt-line"><span>Pembayaran</span><span>${s.pay}</span></div><div class="receipt-line"><span>Dibayar</span><span>${rupiah(s.paid)}</span></div><div class="receipt-line"><span>Kembalian</span><span>${rupiah(s.change)}</span></div><p style="margin-top:18px">Terima kasih<br>Ini hanya transaksi DEMO</p></div>`;
 document.getElementById("receiptModal").classList.add("show");
}
document.getElementById("closeReceipt").onclick=()=>document.getElementById("receiptModal").classList.remove("show");
document.getElementById("printReceipt").onclick=()=>window.print();
function renderDashboard(){
 const sales=state.sales.reduce((s,x)=>s+x.total,0),items=state.sales.reduce((s,x)=>s+x.items.reduce((a,i)=>a+i.qty,0),0);
 const cash=state.cash.reduce((s,x)=>s+(x.type==="Masuk"?x.amount:-x.amount),0);
 document.getElementById("dashSales").textContent=rupiah(sales);document.getElementById("dashTransactions").textContent=state.sales.length+" transaksi";document.getElementById("dashItems").textContent=items+" pcs";document.getElementById("dashCash").textContent=rupiah(cash);
 const counts={};state.sales.forEach(s=>s.items.forEach(i=>counts[i.name]=(counts[i.name]||0)+i.qty));
 const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6),max=top[0]?.[1]||1;
 document.getElementById("topMenus").innerHTML=top.length?top.map(([n,v],i)=>`<div class="top-item"><div class="top-line"><span>${i+1}. ${n}</span><b>${v} pcs</b></div><div class="track"><div class="fill" style="width:${v/max*100}%"></div></div></div>`).join(""):"<p class='muted'>Belum ada transaksi. Coba lakukan transaksi di menu Kasir.</p>";
 document.getElementById("dashboardBars").innerHTML=state.sales.slice(0,7).reverse().map(s=>`<div class="bar-item"><div class="bar" style="height:${Math.max(8,Math.min(190,s.total/200))}px"></div><small>${s.time.split(",")[0]}</small></div>`).join("")||"<div class='muted'>Grafik akan muncul setelah demo digunakan.</div>";
}
function renderSales(){
 document.getElementById("salesTable").innerHTML=state.sales.length?state.sales.map((s,i)=>`<tr><td>${state.sales.length-i}</td><td>${s.time}</td><td>${s.items.map(x=>`${x.name} ×${x.qty}`).join("<br>")}</td><td>${s.pay}</td><td><b>${rupiah(s.total)}</b></td><td><button class="secondary" onclick='showReceipt(${JSON.stringify(s).replaceAll("'","&#39;")})'>Lihat</button></td></tr>`).join(""):`<tr><td colspan="6" style="text-align:center">Belum ada transaksi demo.</td></tr>`;
}
function renderPurchases(){
 if(!state.purchases.length)state.purchases=[{date:new Date().toLocaleDateString("id-ID"),name:"Ayam & bahan baku",qty:10,total:850000},{date:new Date().toLocaleDateString("id-ID"),name:"Bahan Ketan Susu",qty:8,total:420000}];
 document.getElementById("purchaseTable").innerHTML=state.purchases.map(x=>`<tr><td>${x.date}</td><td>${x.name}</td><td>${x.qty}</td><td>${rupiah(x.total)}</td></tr>`).join("");
}
function renderCash(){
 const ins=state.cash.filter(x=>x.type==="Masuk").reduce((s,x)=>s+x.amount,0),outs=state.cash.filter(x=>x.type==="Keluar").reduce((s,x)=>s+x.amount,0);
 document.getElementById("cashIn").textContent=rupiah(ins);document.getElementById("cashOut").textContent=rupiah(outs);document.getElementById("cashBalance").textContent=rupiah(ins-outs);
 document.getElementById("cashTable").innerHTML=state.cash.length?state.cash.map(x=>`<tr><td>${x.time}</td><td>${x.desc}</td><td>${x.type}</td><td>${rupiah(x.amount)}</td></tr>`).join(""):`<tr><td colspan="4" style="text-align:center">Belum ada catatan kas.</td></tr>`;
}
function renderReport(){
 const sales=state.sales.reduce((s,x)=>s+x.total,0),purchase=state.purchases.reduce((s,x)=>s+x.total,0),cashIn=state.cash.filter(x=>x.type==="Masuk").reduce((s,x)=>s+x.amount,0),cashOut=state.cash.filter(x=>x.type==="Keluar").reduce((s,x)=>s+x.amount,0);
 document.getElementById("reportContent").innerHTML=`<div class="stats mini"><div class="stat"><span>Total Penjualan</span><strong>${rupiah(sales)}</strong></div><div class="stat"><span>Total Pembelian</span><strong>${rupiah(purchase)}</strong></div><div class="stat"><span>Arus Kas Bersih</span><strong>${rupiah(cashIn-cashOut)}</strong></div></div><p><b>Catatan demo:</b> angka di atas berasal dari transaksi dan data contoh. Pada aplikasi nyata, laporan dapat disesuaikan dengan kebutuhan usaha.</p>`;
}
function renderMenus(){
 document.getElementById("menuTable").innerHTML=state.menus.map((m,i)=>`<div class="menu-row"><strong>${m.name}</strong><span>${m.cat} • ${rupiah(m.price)} • stok ${m.stock}</span></div>`).join("");
}
function renderAll(){renderCategories();renderProducts();renderCart();renderDashboard();renderSales();renderPurchases();renderCash();renderReport();renderMenus()}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>{document.querySelectorAll(".nav").forEach(x=>x.classList.remove("active"));n.classList.add("active");document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));document.getElementById("page-"+n.dataset.page).classList.add("active");const titles={kasir:["Kasir","Simulasikan transaksi penjualan seperti aplikasi kasir sebenarnya."],dashboard:["Dashboard","Lihat ringkasan penjualan, transaksi, kas dan menu terlaris."],penjualan:["Penjualan","Riwayat transaksi demo yang baru saja dibuat."],pembelian:["Pembelian","Contoh pengelolaan pembelian dan bahan."],kas:["Kas","Simulasikan arus kas masuk dan keluar."],laporan:["Laporan Keuangan","Ringkasan keuangan dari data demo."],menu:["Master Menu","Kelola daftar menu untuk simulasi."]};document.getElementById("pageTitle").textContent=titles[n.dataset.page][0];document.getElementById("pageSubtitle").textContent=titles[n.dataset.page][1]});
document.getElementById("resetDemo").onclick=()=>{if(confirm("Reset semua data demo?")){localStorage.removeItem("sk_demo_menus");localStorage.removeItem("sk_demo_sales");localStorage.removeItem("sk_demo_purchases");localStorage.removeItem("sk_demo_cash");location.reload()}};
document.getElementById("addMenu").onclick=()=>{const name=prompt("Nama menu baru:");if(!name)return;const price=Number(prompt("Harga:",10000));if(!price)return;state.menus.push({name,cat:"Menu Custom",price,stock:50});save();renderAll();toast("Menu demo berhasil ditambahkan")};
document.getElementById("addPurchase").onclick=()=>{const name=prompt("Nama barang:", "Bahan Baku");if(!name)return;const qty=Number(prompt("Jumlah:",1));const total=Number(prompt("Total pembelian:",100000));if(!qty||!total)return;state.purchases.unshift({date:new Date().toLocaleDateString("id-ID"),name,qty,total});save();renderPurchases();renderReport();toast("Pembelian demo ditambahkan")};
document.getElementById("addCash").onclick=()=>{const desc=prompt("Keterangan:", "Pengeluaran operasional");if(!desc)return;const type=prompt("Jenis: ketik MASUK atau KELUAR","KELUAR").toUpperCase();const amount=Number(prompt("Nominal:",50000));if(!amount)return;state.cash.unshift({time:new Date().toLocaleString("id-ID"),desc,type:type==="MASUK"?"Masuk":"Keluar",amount});save();renderCash();renderDashboard();renderReport();toast("Catatan kas demo ditambahkan")};
document.getElementById("printReport").onclick=()=>window.print();
renderAll();
