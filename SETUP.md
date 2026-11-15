# Careers: setup (5 minutes)

**What visitors get:** Contact ▼ → **Careers**. They see open roles, tap *View & apply*, fill a short form, upload a resume (PDF/DOC/DOCX, 5 MB) and receive a **tracking code**. Under *Track my application* they enter the code + mobile number to see their status (Applied → Under review → Shortlisted → Interview → Interviewed → Offer → Hired / Not selected) and, once you schedule it, the **interview date, time, mode and address or link**.

**What you get (admin-careers.html):** post / edit / close roles, see all applications, open the resume, set status, schedule the interview, write a message the applicant can see, keep private notes, and tap **WhatsApp applicant** to message them with the interview details pre-filled.

## Steps
1. Supabase → SQL Editor → run `supabase-careers.sql` (safe to re-run). It adds one sample role; delete it in the admin page if you don't want it.
2. Copy into your project: `careers.html`, `admin-careers.html`, `css/careers.css`, `js/careers.js`, and **replace** `js/navbar.js` (adds Contact ▼ → Contact Us / Careers on desktop and mobile).
3. Add a link to `admin-careers.html` in your admin menu.
4. Pages load `js/navbar.js?v=32`. To make browsers fetch the new menu straight away, change `v=32` to `v=33` in your pages. In a terminal inside the project:
   `sed -i 's/navbar\.js?v=32/navbar.js?v=33/g' *.html`
5. Push. Test: apply with a test number, then in admin set it to *Interview scheduled* and check the Track box.

## Privacy and safety
- Resumes are in a **private** bucket. Visitors can upload but never read, replace or delete files; only admins can open them (60–120 second links).
- Applications can't be read by the public. Tracking needs both the code and the phone number used.
- A hidden field blocks simple bots; one application per role per phone number; max 3 per phone per day.
- Applicant data (name, phone, email, resume) is personal data. Delete applications you no longer need (Delete button also removes the resume file).
- Applicants are not notified automatically. Use the WhatsApp button, or ask me to wire it into the same WhatsApp/SMS sender used for bills.
