/* Careers page: list open roles, apply (resume upload), track an application. Needs js/supabaseClient.js */
(function () {
  "use strict";
  var sb = supabaseClient, $ = function (id) { return document.getElementById(id); };
  var jobs = [];
  var MAX = 5 * 1024 * 1024;
  var OK = { "application/pdf": "pdf", "application/msword": "doc", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx" };

  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function isHttps(u) { try { return new URL(u).protocol === "https:"; } catch (e) { return false; } }
  function when(d) { return new Date(d).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }); }
  function day(d) { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

  /* ---------- roles ---------- */
  async function load() {
    var r = await sb.from("career_jobs").select("*").order("created_at", { ascending: false });
    if (r.error) { $("crJobs").innerHTML = '<p class="cr-empty">Could not load roles right now. Please try again later.</p>'; return; }
    jobs = r.data || [];
    render();
    var jid = new URLSearchParams(location.search).get("job");
    if (jid && jobs.some(function (j) { return j.id === jid; })) openJob(jid);
  }
  function render() {
    var q = $("crSearch").value.toLowerCase(), t = $("crType").value;
    var rows = jobs.filter(function (j) { return (j.title + " " + (j.department || "") + " " + (j.location || "")).toLowerCase().indexOf(q) > -1 && (!t || j.job_type === t); });
    $("crCount").textContent = rows.length;
    $("crJobs").innerHTML = rows.length ? rows.map(function (j) {
      return '<article class="cr-card"><h3>' + esc(j.title) + '</h3><div class="cr-tags">' +
        '<span class="cr-tag t">' + esc(j.job_type) + '</span>' +
        (j.department ? '<span class="cr-tag">' + esc(j.department) + '</span>' : "") +
        '<span class="cr-tag">📍 ' + esc(j.location) + '</span>' +
        (j.experience ? '<span class="cr-tag">🎓 ' + esc(j.experience) + '</span>' : "") +
        (j.salary_range ? '<span class="cr-tag">💰 ' + esc(j.salary_range) + '</span>' : "") + '</div>' +
        '<p>' + esc((j.description || "").slice(0, 160)) + ((j.description || "").length > 160 ? "…" : "") + '</p>' +
        '<div class="foot"><span>Posted ' + esc(day(j.created_at)) + (j.closes_on ? " · Apply by " + esc(day(j.closes_on)) : "") + '</span>' +
        '<button class="cr-btn" data-job="' + esc(j.id) + '" type="button">View &amp; apply</button></div></article>';
    }).join("") : '<p class="cr-empty">No open roles match right now. You can still send a general application below.</p>';
  }
  $("crSearch").addEventListener("input", render);
  $("crType").addEventListener("change", render);
  $("crJobs").addEventListener("click", function (e) { var b = e.target.closest("[data-job]"); if (b) openJob(b.dataset.job); });
  $("crGeneral").addEventListener("click", function () { openJob(null); });
  $("crClose").addEventListener("click", function () { $("crDlg").close(); });
  $("crDlg").addEventListener("click", function (e) { if (e.target === $("crDlg")) $("crDlg").close(); });

  /* ---------- apply ---------- */
  function openJob(id) {
    var j = id ? jobs.filter(function (x) { return x.id === id; })[0] : null;
    if (id && !j) return;
    var h = j ? '<h3>' + esc(j.title) + '</h3><div class="cr-tags"><span class="cr-tag t">' + esc(j.job_type) + '</span>' +
      (j.department ? '<span class="cr-tag">' + esc(j.department) + '</span>' : "") + '<span class="cr-tag">📍 ' + esc(j.location) + '</span>' +
      (j.experience ? '<span class="cr-tag">🎓 ' + esc(j.experience) + '</span>' : "") + (j.salary_range ? '<span class="cr-tag">💰 ' + esc(j.salary_range) + '</span>' : "") + '</div>' +
      '<h4>About the role</h4><div class="txt">' + esc(j.description) + '</div>' +
      (j.requirements ? '<h4>What we are looking for</h4><div class="txt">' + esc(j.requirements) + '</div>' : "")
      : '<h3>General application</h3><p class="txt">Tell us about yourself and attach your resume. We will contact you when a suitable role opens.</p>';
    h += '<form id="crForm" novalidate><div class="cr-hp"><label>Leave empty<input id="aWeb" tabindex="-1" autocomplete="off"></label></div>' +
      '<div class="cr-f"><label for="aName">Full name *</label><input id="aName" maxlength="120" autocomplete="name"></div>' +
      '<div class="cr-2"><div class="cr-f"><label for="aPhone">Mobile number *</label><input id="aPhone" type="tel" inputmode="numeric" maxlength="10" autocomplete="tel"></div>' +
      '<div class="cr-f"><label for="aEmail">Email *</label><input id="aEmail" type="email" maxlength="160" autocomplete="email"></div></div>' +
      '<div class="cr-2"><div class="cr-f"><label for="aCity">City</label><input id="aCity" maxlength="80" value="Coimbatore"></div>' +
      '<div class="cr-f"><label for="aExp">Years of experience</label><input id="aExp" type="number" min="0" max="60" step="0.5" placeholder="0 if fresher"></div></div>' +
      '<div class="cr-f"><label for="aNote">Why do you want to join us? (optional)</label><textarea id="aNote" rows="3" maxlength="1500"></textarea></div>' +
      '<div class="cr-f"><label for="aFile">Resume * (PDF, DOC or DOCX, max 5 MB)</label><input id="aFile" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></div>' +
      '<label class="cr-chk"><input id="aOk" type="checkbox"><span>I agree that Vimal Pets &amp; Toys may store and use my details only for hiring.</span></label>' +
      '<div id="crFormMsg" aria-live="polite"></div><button class="cr-btn" id="aSubmit" type="submit">Submit application</button></form>';
    $("crDlgBody").innerHTML = h;
    $("crDlg").showModal();
    $("crForm").addEventListener("submit", function (e) { e.preventDefault(); submit(j); });
  }
  function fail(t) { $("crFormMsg").innerHTML = '<div class="cr-msg err">' + esc(t) + '</div>'; }

  async function submit(j) {
    var name = $("aName").value.trim(), phone = $("aPhone").value.trim(), email = $("aEmail").value.trim(),
      city = $("aCity").value.trim(), expRaw = $("aExp").value, note = $("aNote").value.trim(), file = $("aFile").files[0];
    if ($("aWeb").value) return;                                   /* honeypot: bots fill this */
    if (name.length < 2) return fail("Please enter your full name.");
    if (!/^[0-9]{10}$/.test(phone)) return fail("Enter a valid 10-digit mobile number.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Enter a valid email address.");
    if (!file) return fail("Please attach your resume.");
    if (!OK[file.type]) return fail("Resume must be a PDF, DOC or DOCX file.");
    if (file.size > MAX) return fail("Resume must be under 5 MB.");
    if (!$("aOk").checked) return fail("Please tick the consent box to continue.");
    var btn = $("aSubmit"); btn.disabled = true; btn.textContent = "Submitting…";
    try {
      var id = (crypto.randomUUID ? crypto.randomUUID() : null);
      if (!id) throw new Error("Your browser is too old to submit. Please use an updated browser.");
      var path = id + "/resume." + OK[file.type];
      var up = await sb.storage.from("career-resumes").upload(path, file, { upsert: false, contentType: file.type });
      if (up.error) throw up.error;
      var r = await sb.rpc("career_apply", { p_id: id, p_job: j ? j.id : null, p_name: name, p_email: email, p_phone: phone, p_city: city,
        p_experience: expRaw === "" ? null : Number(expRaw), p_note: note, p_resume_path: path, p_resume_name: file.name.slice(0, 120) });
      if (r.error) throw r.error;
      var code = r.data.tracking_code;
      $("crDlgBody").innerHTML = '<h3>🎉 Application received</h3><p class="txt">Thank you, ' + esc(name.split(" ")[0]) + '! Your application for <b>' + esc(r.data.job_title) + '</b> is with our team.</p>' +
        '<p class="txt">Your tracking code (please save it):</p><div class="cr-code">' + esc(code) + '</div>' +
        '<p class="txt">Use it with your mobile number under “Track my application” to see your status and interview details.</p>' +
        '<button class="cr-btn" id="crDone" type="button">Done</button>';
      $("crDone").addEventListener("click", function () { $("crDlg").close(); });
    } catch (err) {
      fail((err && err.message) || "Something went wrong. Please try again.");
      btn.disabled = false; btn.textContent = "Submit application";
    }
  }

  /* ---------- track ---------- */
  var STEPS = [["applied", "Applied"], ["under_review", "Under review"], ["shortlisted", "Shortlisted"], ["interview_scheduled", "Interview"], ["interviewed", "Interviewed"], ["offered", "Offer"], ["hired", "Hired"]];
  var LABEL = { applied: "Application received", under_review: "Under review", shortlisted: "Shortlisted", interview_scheduled: "Interview scheduled", interviewed: "Interview completed", offered: "Offer made", hired: "Selected. Welcome to the team!", rejected: "Not selected this time" };
  var MODE = { in_person: "In person", phone: "Phone call", video: "Video call" };
  $("crTrackForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var code = $("crCode").value.trim(), ph = $("crTPhone").value.trim(), out = $("crTrackOut");
    if (!code || !/^[0-9]{10}$/.test(ph)) { out.innerHTML = '<div class="cr-msg err">Enter your tracking code and 10-digit mobile number.</div>'; return; }
    out.innerHTML = '<p class="cr-sub">Checking…</p>';
    var r = await sb.rpc("career_track", { p_code: code, p_phone: ph });
    if (r.error || !r.data) { out.innerHTML = '<div class="cr-msg err">We could not find an application with those details. Check the code and the mobile number you applied with.</div>'; return; }
    var a = r.data, st = a.status, idx = STEPS.map(function (s) { return s[0]; }).indexOf(st);
    var cls = st === "rejected" ? "cr-s-bad" : (["interview_scheduled", "shortlisted", "offered", "hired"].indexOf(st) > -1 ? "cr-s-ok" : "cr-s-wait");
    var h = '<div class="cr-res"><h3>' + esc(a.applicant_name) + '</h3><p>' + esc(a.job_title) + ' · applied ' + esc(day(a.applied_at)) + '</p>' +
      '<span class="cr-status ' + cls + '">' + esc(LABEL[st] || st) + '</span>';
    if (st !== "rejected") h += '<div class="cr-steps">' + STEPS.map(function (s, i) { return '<span class="cr-step ' + (i === idx ? "on" : (i < idx ? "done" : "")) + '">' + (i < idx ? "✓ " : "") + s[1] + '</span>'; }).join("") + '</div>';
    if (a.interview_at && ["interview_scheduled", "interviewed"].indexOf(st) > -1) {
      var place = a.interview_place ? (isHttps(a.interview_place) ? '<a href="' + esc(a.interview_place) + '" target="_blank" rel="noopener noreferrer" style="color:#22c1c3">' + esc(a.interview_place) + '</a>' : esc(a.interview_place)) : "";
      h += '<div class="cr-iv"><b>📅 ' + esc(when(a.interview_at)) + ' (IST)</b>' + (a.interview_mode ? '<br>Mode: ' + esc(MODE[a.interview_mode] || a.interview_mode) : "") + (place ? '<br>Where / link: ' + place : "") + '</div>';
    }
    if (a.public_note) h += '<p style="margin-top:10px"><b>Message from our team:</b><br>' + esc(a.public_note) + '</p>';
    out.innerHTML = h + '</div>';
  });

  load();
})();
