/* Partner dashboard logic. Needs: Supabase CDN + js/supabaseClient.js */
(function () {
"use strict";
const $ = id => document.getElementById(id);
const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const isHttps = u => { try { return new URL(u).protocol === "https:"; } catch (e) { return false; } };
const money = n => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const CATEGORIES = ["Dogs","Cats","Fish","Birds","Small Pets","Reptiles","Pet Food","Accessories","Aquariums","Toys","Plants","Grooming"];
const DOCS = [
  { key: "id_proof",        title: "ID Proof",            hint: "PAN or Aadhaar card",             required: true },
  { key: "bank_proof",      title: "Bank Proof",          hint: "Cancelled cheque or passbook page" },
  { key: "gst_certificate", title: "GST Certificate",     hint: "Only if you are GST registered" },
  { key: "shop_license",    title: "Shop / Trade Licence", hint: "Shop & Establishment or trade licence" }
];
const MAX_FILE = 5 * 1024 * 1024;
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

let user = null, profile = null, isActive = false, products = [], docs = [], orders = [], csvRows = [], addMode = "manual";

function flash(text, type) {
  $("topMsg").innerHTML = `<div class="ptn-msg ${type === "ok" ? "ok" : "err"}">${esc(text)}</div>`;
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (type === "ok") setTimeout(() => { $("topMsg").innerHTML = ""; }, 5000);
}
function mask(s, vis) { s = String(s || ""); return !s ? "—" : s.length <= vis ? s : "•".repeat(s.length - vis) + s.slice(-vis); }

/* ---------- tabs ---------- */
function showTab(name) {
  if (!$("tab-" + name)) name = "overview";
  document.querySelectorAll(".ptn-sec").forEach(s => s.classList.toggle("on", s.id === "tab-" + name));
  document.querySelectorAll("#pdNav button").forEach(b => b.classList.toggle("on", b.dataset.tab === name));
  if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
}
$("pdNav").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) showTab(b.dataset.tab); });

/* ---------- init ---------- */
async function init() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) { location.href = "seller-login.html"; return; }
  user = session.user;
  $("sellerEmail").textContent = user.email || "";

  const { data: p, error } = await supabaseClient.from("profiles").select("*").eq("id", user.id).single();
  if (error || !p) { $("shopName").textContent = "🏪 Partner profile not found"; flash("Your partner profile could not be loaded. Please contact support.", "err"); return; }
  profile = p;
  const today = new Date().toISOString().split("T")[0];
  isActive = p.subscription_status === "active" && !!p.plan_expiry && p.plan_expiry >= today;

  renderHeader();
  fillCategorySelect();
  renderProfile();
  await Promise.all([loadProducts(), loadDocs(), loadOrders()]);
  renderChecklist();
  renderAddGate();
  showTab((location.hash || "#overview").slice(1));
}

function renderHeader() {
  $("shopName").textContent = "🏪 " + (profile.shop_name || "My Shop");
  const v = String(profile.verification_status || "pending").toLowerCase();
  const vCls = ["approved", "verified"].includes(v) ? "ok" : ["rejected", "suspended"].includes(v) ? "bad" : "warn";
  const vTxt = { approved: "Verified partner", verified: "Verified partner", pending: "Verification pending", under_review: "Under review", rejected: "Verification rejected", suspended: "Suspended" }[v] || v;
  $("badges").innerHTML =
    `<span class="ptn-badge ${vCls}">${esc(vTxt)}</span>` +
    (isActive ? `<span class="ptn-badge ok">${esc(profile.plan_name || "Plan")} · expires ${esc(profile.plan_expiry)}</span>`
              : `<span class="ptn-badge bad">No active subscription</span>`);
  $("subscribeBtn").textContent = isActive ? "Change plan" : "Subscribe to sell";
  $("viewShopBtn").href = "marketplace.html?seller=" + encodeURIComponent(user.id);
  $("viewShopBtn").textContent = "View my shop";
}

function renderChecklist() {
  const v = String(profile.verification_status || "").toLowerCase();
  const items = [
    [docs.some(d => d.doc_type === "id_proof"), 'Submit your ID proof', 'documents'],
    [["approved", "verified"].includes(v), 'Get verified by our team', null],
    [isActive, 'Activate a subscription plan', null],
    [!!profile.shop_website, 'Add your website link', 'profile'],
    [products.length > 0, 'List your first product', 'add']
  ];
  $("checklist").innerHTML = items.map(([done, label, tab]) =>
    `<li class="${done ? "done" : ""}"><span class="t">${done ? "✓" : ""}</span>${tab && !done ? `<a href="#${tab}" data-go="${tab}">${esc(label)}</a>` : esc(label)}</li>`).join("");
  $("checklist").querySelectorAll("[data-go]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); showTab(a.dataset.go); }));
  $("docDot").hidden = docs.some(d => d.doc_type === "id_proof");
}

/* ---------- products ---------- */
async function loadProducts() {
  const { data, error } = await supabaseClient.from("products").select("*").eq("shop_owner_id", user.id).order("created_at", { ascending: false });
  if (error) { $("productList").innerHTML = `<div class="ptn-msg err">Could not load products.</div>`; return; }
  products = data || [];
  $("pCount").textContent = products.length;
  $("stTotal").textContent = products.length;
  $("stLive").textContent = products.filter(p => p.is_active !== false && isActive).length;
  $("stLow").textContent = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  renderProducts();
  $("latestProducts").innerHTML = products.length
    ? products.slice(0, 4).map(productRow.bind(null, false)).join("")
    : `<div class="ptn-empty">No products yet.<br>Use “Add Products” to list your first one.</div>`;
}
function productRow(withButtons, p) {
  const hidden = p.is_active === false;
  const src = p.product_url ? `<span class="ptn-badge mute">🔗 Website link</span>` : "";
  return `<div class="ptn-item">
    ${p.image_url && isHttps(p.image_url) ? `<img src="${esc(p.image_url)}" alt="" loading="lazy">` : `<div class="ph">📦</div>`}
    <div><div class="n">${esc(p.product_name)}</div>
      <div class="m"><b>${money(p.price)}</b><span>Stock: ${esc(p.stock)}</span><span>${esc(p.category || "")}</span>${src}
      ${hidden ? `<span class="ptn-badge bad">Hidden by admin</span>` : ""}</div></div>
    ${withButtons ? `<div class="btns"><button class="ptn-btn sm" data-edit="${esc(p.id)}">Edit</button><button class="ptn-btn sm danger" data-del="${esc(p.id)}">Delete</button></div>` : ""}
  </div>`;
}
function renderProducts() {
  const q = $("pSearch").value.toLowerCase(), f = $("pStock").value;
  const rows = products.filter(p => ((p.product_name || "") + " " + (p.category || "")).toLowerCase().includes(q) &&
    (f === "all" || (f === "available" && p.stock > 0) || (f === "low" && p.stock > 0 && p.stock <= 5) || (f === "out" && Number(p.stock) === 0)));
  $("productList").innerHTML = rows.length ? rows.map(productRow.bind(null, true)).join("") : `<div class="ptn-empty">No matching products.</div>`;
}
$("pSearch").addEventListener("input", renderProducts);
$("pStock").addEventListener("change", renderProducts);
$("productList").addEventListener("click", async e => {
  const ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
  if (ed) openEdit(ed.dataset.edit);
  if (del) {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    const { error } = await supabaseClient.from("products").delete().eq("id", del.dataset.del).eq("shop_owner_id", user.id);
    if (error) flash(error.message, "err"); else { flash("Product deleted.", "ok"); await loadProducts(); renderChecklist(); }
  }
});

/* edit dialog */
let editId = null;
function openEdit(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  editId = id;
  $("e_name").textContent = p.product_name;
  $("e_price").value = p.price; $("e_stock").value = p.stock;
  $("e_url").value = p.product_url || ""; $("e_desc").value = p.description || "";
  $("editDlg").showModal();
}
$("e_cancel").onclick = () => $("editDlg").close();
$("editForm").addEventListener("submit", async e => {
  e.preventDefault();
  const price = Number($("e_price").value), stock = parseInt($("e_stock").value, 10), url = $("e_url").value.trim();
  if (!(price >= 0) || !(stock >= 0)) return alert("Enter a valid price and stock.");
  if (url && !isHttps(url)) return alert("Website link must start with https://");
  const { error } = await supabaseClient.from("products")
    .update({ price, stock, product_url: url || null, description: $("e_desc").value.trim() })
    .eq("id", editId).eq("shop_owner_id", user.id);
  $("editDlg").close();
  if (error) flash(error.message, "err"); else { flash("Product updated.", "ok"); await loadProducts(); }
});

/* add product */
function fillCategorySelect() {
  $("f_cat").innerHTML = `<option value="">Select…</option>` + CATEGORIES.map(c => `<option>${esc(c)}</option>`).join("");
}
function renderAddGate() {
  if (isActive) { $("addGate").innerHTML = ""; $("addCard").style.display = ""; return; }
  $("addCard").style.display = "none";
  $("addGate").innerHTML = `<div class="ptn-msg err">An active subscription is required to list products. <a href="subscription.html" style="color:#ffd36b">Subscribe now →</a></div>`;
}
$("addSeg").addEventListener("click", e => {
  const b = e.target.closest("button[data-mode]"); if (!b) return;
  addMode = b.dataset.mode;
  document.querySelectorAll("#addSeg button").forEach(x => x.classList.toggle("on", x === b));
  $("mode-manual-website").classList.toggle("on", addMode !== "csv");
  $("mode-csv").classList.toggle("on", addMode === "csv");
  $("urlField").hidden = addMode !== "website";
});

async function uploadImage(file) {
  if (!file) return "";
  if (!file.type.startsWith("image/")) throw new Error("Product image must be an image file.");
  if (file.size > MAX_FILE) throw new Error("Product image must be under 5 MB.");
  const name = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const up = await supabaseClient.storage.from("product-images").upload(name, file);
  if (up.error) throw up.error;
  return supabaseClient.storage.from("product-images").getPublicUrl(name).data.publicUrl;
}
$("productForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("f_submit");
  const name = $("f_name").value.trim(), cat = $("f_cat").value, price = Number($("f_price").value),
        stock = parseInt($("f_stock").value, 10), url = $("f_url").value.trim(), imgUrl = $("f_imgurl").value.trim();
  if (!name || !cat) return flash("Product name and category are required.", "err");
  if (!(price >= 0) || $("f_price").value === "") return flash("Enter a valid price.", "err");
  if (!(stock >= 0)) return flash("Enter a valid stock quantity.", "err");
  if (addMode === "website" && !isHttps(url)) return flash("Enter the product page link (must start with https://).", "err");
  if (imgUrl && !isHttps(imgUrl)) return flash("Image link must start with https://", "err");
  btn.disabled = true; btn.textContent = "Publishing…";
  try {
    const image_url = (await uploadImage($("f_img").files[0])) || imgUrl || null;
    const { error } = await supabaseClient.from("products").insert([{
      shop_owner_id: user.id, product_name: name, category: cat, brand: $("f_brand").value.trim() || null,
      price, stock, image_url, description: $("f_desc").value.trim(),
      product_url: addMode === "website" ? url : null, source: addMode === "website" ? "website" : "manual"
    }]);
    if (error) throw error;
    $("productForm").reset(); flash("✅ Product published to the marketplace.", "ok");
    await loadProducts(); renderChecklist();
  } catch (err) { flash(err.message || "Could not publish product.", "err"); }
  finally { btn.disabled = false; btn.textContent = "Publish product"; }
});

/* CSV bulk upload */
function parseCSV(text) {
  const rows = []; let row = [], cur = "", q = false;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some(x => x.trim() !== "")) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some(x => x.trim() !== "")) rows.push(row);
  return rows;
}
$("csvTemplate").onclick = () => {
  const csv = "name,category,price,stock,brand,image_url,product_url,description\n" +
    '"Aquarium Air Pump",Aquariums,499,25,Sobo,https://example.com/pump.jpg,https://yourshop.com/air-pump,"Quiet 2-outlet pump"\n';
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "vimal-products-template.csv"; a.click(); URL.revokeObjectURL(a.href);
};
$("csvFile").addEventListener("change", async e => {
  csvRows = []; $("csvSubmit").disabled = true; $("csvReport").innerHTML = "";
  const f = e.target.files[0]; if (!f) return;
  if (f.size > 1024 * 1024) { $("csvReport").innerHTML = `<div class="ptn-msg err">CSV must be under 1 MB.</div>`; return; }
  const grid = parseCSV(await f.text());
  if (grid.length < 2) { $("csvReport").innerHTML = `<div class="ptn-msg err">The file has no product rows.</div>`; return; }
  const head = grid[0].map(h => h.trim().toLowerCase());
  const need = ["name", "category", "price", "stock"].filter(h => !head.includes(h));
  if (need.length) { $("csvReport").innerHTML = `<div class="ptn-msg err">Missing column(s): ${esc(need.join(", "))}</div>`; return; }
  if (grid.length - 1 > 100) { $("csvReport").innerHTML = `<div class="ptn-msg err">Maximum 100 products per upload.</div>`; return; }
  const errs = [], out = [];
  grid.slice(1).forEach((r, i) => {
    const o = {}; head.forEach((h, j) => o[h] = (r[j] || "").trim());
    const line = i + 2, price = Number(o.price), stock = Number(o.stock);
    const cat = CATEGORIES.find(c => c.toLowerCase() === (o.category || "").toLowerCase());
    if (!o.name) errs.push(`Row ${line}: name is empty`);
    if (!cat) errs.push(`Row ${line}: category must be one of ${CATEGORIES.join(", ")}`);
    if (o.price === "" || !(price >= 0)) errs.push(`Row ${line}: invalid price`);
    if (o.stock === "" || !Number.isInteger(stock) || stock < 0) errs.push(`Row ${line}: invalid stock`);
    if (o.image_url && !isHttps(o.image_url)) errs.push(`Row ${line}: image_url must start with https://`);
    if (o.product_url && !isHttps(o.product_url)) errs.push(`Row ${line}: product_url must start with https://`);
    out.push({ shop_owner_id: user.id, product_name: o.name.slice(0, 120), category: cat, price, stock,
      brand: o.brand || null, image_url: o.image_url || null, product_url: o.product_url || null,
      description: (o.description || "").slice(0, 2000), source: "csv" });
  });
  if (errs.length) { $("csvReport").innerHTML = `<div class="ptn-msg err">${errs.slice(0, 12).map(esc).join("<br>")}${errs.length > 12 ? `<br>…and ${errs.length - 12} more` : ""}<br><b>Fix these and choose the file again. Nothing was imported.</b></div>`; return; }
  csvRows = out; $("csvSubmit").disabled = false;
  $("csvReport").innerHTML = `<div class="ptn-msg ok">${out.length} product(s) ready to import.</div>`;
});
$("csvSubmit").onclick = async () => {
  if (!csvRows.length) return;
  $("csvSubmit").disabled = true; $("csvSubmit").textContent = "Importing…";
  const { error } = await supabaseClient.from("products").insert(csvRows);
  $("csvSubmit").textContent = "Import products";
  if (error) { $("csvSubmit").disabled = false; return flash(error.message, "err"); }
  flash(`✅ ${csvRows.length} products imported.`, "ok"); csvRows = []; $("csvFile").value = ""; $("csvReport").innerHTML = "";
  await loadProducts(); renderChecklist();
};

/* ---------- documents (write-once) ---------- */
async function loadDocs() {
  const { data } = await supabaseClient.from("seller_documents").select("*").eq("seller_id", user.id);
  docs = data || [];
  // Pick up files uploaded during signup (before this table existed / before login) so they show as submitted.
  try {
    const { data: files } = await supabaseClient.storage.from("seller-kyc-docs").list(user.id);
    for (const f of (files || [])) {
      const key = f.name.replace(/\.[^.]+$/, "").replace(/-/g, "_");
      if (DOCS.some(d => d.key === key) && !docs.some(d => d.doc_type === key)) {
        const { data: row } = await supabaseClient.from("seller_documents")
          .insert([{ seller_id: user.id, doc_type: key, file_path: `${user.id}/${f.name}`, file_name: f.name }]).select().single();
        if (row) docs.push(row);
      }
    }
  } catch (e) { /* non-fatal */ }
  renderDocs();
}
function renderDocs() {
  $("docGrid").innerHTML = DOCS.map(d => {
    const row = docs.find(x => x.doc_type === d.key);
    if (row) {
      const st = row.review_status || "submitted";
      const cls = st === "approved" ? "ok" : st === "rejected" ? "bad" : "mute";
      return `<div class="ptn-doc locked"><h4>${esc(d.title)} <span class="ptn-badge ${cls}">${esc(st)}</span></h4>
        <p>${esc(d.hint)}</p>
        <div class="file">📎 ${esc(row.file_name || "document")}<br><small>Submitted ${esc(new Date(row.uploaded_at).toLocaleDateString("en-IN"))} · 🔒 Locked</small></div>
        ${row.admin_note ? `<div class="file"><small>Note from team: ${esc(row.admin_note)}</small></div>` : ""}
        <button class="ptn-btn sm" data-view="${esc(row.file_path)}">👁 View my file</button></div>`;
    }
    return `<div class="ptn-doc"><h4>${esc(d.title)}${d.required ? ` <span class="ptn-badge warn">Required</span>` : ""}</h4>
      <p>${esc(d.hint)} · JPG, PNG, WebP or PDF, max 5 MB</p>
      <input type="file" id="doc_${esc(d.key)}" accept="image/jpeg,image/png,image/webp,application/pdf" hidden>
      <button class="ptn-btn sm solid" data-upload="${esc(d.key)}">⬆ Upload (one time)</button></div>`;
  }).join("");
}
$("docGrid").addEventListener("click", async e => {
  const v = e.target.closest("[data-view]"), u = e.target.closest("[data-upload]");
  if (v) {
    const { data, error } = await supabaseClient.storage.from("seller-kyc-docs").createSignedUrl(v.dataset.view, 60);
    if (error) return flash("Could not open the file: " + error.message, "err");
    window.open(data.signedUrl, "_blank", "noopener");
  }
  if (u) $("doc_" + u.dataset.upload).click();
});
$("docGrid").addEventListener("change", async e => {
  const inp = e.target; if (!inp.id || !inp.id.startsWith("doc_") || !inp.files[0]) return;
  const key = inp.id.slice(4), file = inp.files[0], def = DOCS.find(d => d.key === key);
  if (!OK_TYPES.includes(file.type)) { inp.value = ""; return flash("Only JPG, PNG, WebP or PDF files are allowed.", "err"); }
  if (file.size > MAX_FILE) { inp.value = ""; return flash("File must be under 5 MB.", "err"); }
  if (!confirm(`Submit "${file.name}" as your ${def.title}?\n\nOnce submitted it cannot be changed or deleted.`)) { inp.value = ""; return; }
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/${key.replace(/_/g, "-")}.${ext}`;
  const up = await supabaseClient.storage.from("seller-kyc-docs").upload(path, file, { upsert: false, contentType: file.type });
  if (up.error) { inp.value = ""; return flash(/exist|duplicate/i.test(up.error.message) ? "This document was already submitted and is locked." : up.error.message, "err"); }
  const { data: row, error } = await supabaseClient.from("seller_documents")
    .insert([{ seller_id: user.id, doc_type: key, file_path: path, file_name: file.name }]).select().single();
  if (error) return flash("File uploaded but could not be recorded. Please contact support. (" + error.message + ")", "err");
  docs.push(row); renderDocs(); renderChecklist(); flash(`✅ ${def.title} submitted and locked.`, "ok");
});

/* ---------- orders ---------- */
async function loadOrders() {
  const { data, error } = await supabaseClient.from("orders").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }).limit(10);
  if (error) { $("ordersArea").innerHTML = `<div class="ptn-empty">Orders will appear here once marketplace checkout is connected.</div>`; return; }
  orders = data || []; $("stOrders").textContent = orders.length;
  $("ordersArea").innerHTML = orders.length ? orders.map(o => `<div class="ptn-item" style="grid-template-columns:minmax(0,1fr) auto">
    <div><div class="n">Order #${esc(String(o.id).slice(0, 8))}</div><div class="m"><span>${esc(o.status || "Pending")}</span>
    <span>${esc(o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "")}</span></div></div><b style="color:#FFD700">${money(o.total_amount)}</b></div>`).join("")
    : `<div class="ptn-empty">No orders yet.</div>`;
}

/* ---------- profile ---------- */
let revealed = false;
function renderProfile() {
  const p = profile, lock = `<span class="ptn-lock" title="Locked after submission">🔒</span>`;
  const m = (v, n) => revealed ? (v || "—") : mask(v, n);
  const rows = [
    ["Business type", p.business_type], ["Shop name", p.shop_name], ["Owner", p.owner_name], ["Email", user.email],
    ["Phone", p.phone], ["Address", [p.shop_address || p.address, p.city, p.state, p.pincode].filter(Boolean).join(", ")],
    ["PAN", m(p.pan_number, 2)], ["Aadhaar", m(p.aadhaar_number, 4)], ["GSTIN", p.gstin || "Not provided"],
    ["Bank", p.bank_name], ["Account holder", p.account_holder], ["Account no.", m(p.account_number, 4)], ["IFSC", p.ifsc]
  ];
  $("lockedInfo").innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v || "—")} ${v ? lock : ""}</dd>`).join("");
  $("p_site").value = p.shop_website || ""; $("p_wa").value = p.whatsapp || ""; $("p_about").value = p.shop_description || "";
  $("revealBtn").textContent = revealed ? "🙈 Hide full numbers" : "👁 Show full numbers";
}
$("revealBtn").addEventListener("click", () => { revealed = !revealed; renderProfile(); });
$("profileForm").addEventListener("submit", async e => {
  e.preventDefault();
  const site = $("p_site").value.trim(), wa = $("p_wa").value.trim();
  if (site && !isHttps(site)) return flash("Website must start with https://", "err");
  if (wa && !/^\d{10}$/.test(wa)) return flash("WhatsApp number must be 10 digits.", "err");
  $("p_save").disabled = true;
  const patch = { shop_website: site || null, whatsapp: wa || null, shop_description: $("p_about").value.trim() || null };
  const { error } = await supabaseClient.from("profiles").update(patch).eq("id", user.id);
  $("p_save").disabled = false;
  if (error) return flash(error.message, "err");
  Object.assign(profile, patch); renderChecklist(); flash("Profile updated.", "ok");
});

$("logoutBtn").onclick = async () => { await supabaseClient.auth.signOut(); location.href = "seller-login.html"; };
window.addEventListener("hashchange", () => showTab((location.hash || "#overview").slice(1)));
init();
})();
