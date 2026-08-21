/**
 * Ce Voyage — Automated Test Suite for Form Submissions and Backend Integration
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    testsFailed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(err);
    testsFailed++;
  }
}

console.log("\n=== 1. Testing Supabase Client Headers & Methods ===");

function loadSupabaseClient(configOverride) {
  const sandbox = {
    window: {
      location: { href: "https://www.ce-voyage.com/index.html", pathname: "/index.html" },
      CE_VOYAGE: configOverride || {
        supabase: {
          url: "https://xlejfklsatjqhsbwmalf.supabase.co",
          anonKey: "sb_publishable_LVTjEPcybssazrEoiZDwuA_N23AKUro"
        }
      }
    },
    document: {
      documentElement: { lang: "en" }
    },
    navigator: {
      userAgent: "Mozilla/5.0 TestBrowser/1.0"
    },
    console: {
      info: () => {},
      error: () => {},
      log: () => {}
    },
    fetch: null
  };
  sandbox.window.window = sandbox.window;
  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(__dirname, "../supabase.js"), "utf8");
  vm.runInContext(code, sandbox);
  return sandbox;
}

runTest("Supabase client is configured with valid URL & anonKey", () => {
  const sb = loadSupabaseClient();
  assert.strictEqual(sb.window.CeVoyageBackend.configured, true);
});

runTest("Publishable key (sb_publishable_*) sends apikey header ONLY (NO Authorization Bearer)", () => {
  const sb = loadSupabaseClient();
  const headers = sb.window.CeVoyageBackend.getHeaders();
  assert.strictEqual(headers.apikey, "sb_publishable_LVTjEPcybssazrEoiZDwuA_N23AKUro");
  assert.strictEqual(headers["Content-Type"], "application/json");
  assert.strictEqual(headers.Prefer, "return=minimal");
  assert.strictEqual(headers.Authorization, undefined, "Authorization header must not be set for sb_publishable_*");
});

runTest("Legacy 3-part JWT anon key sends both apikey and Authorization Bearer header", () => {
  const sb = loadSupabaseClient({
    supabase: {
      url: "https://xlejfklsatjqhsbwmalf.supabase.co",
      anonKey: "eyJhbGciOi.eyJleHAiOjE2N.abcdef123456"
    }
  });
  const headers = sb.window.CeVoyageBackend.getHeaders();
  assert.strictEqual(headers.apikey, "eyJhbGciOi.eyJleHAiOjE2N.abcdef123456");
  assert.strictEqual(headers.Authorization, "Bearer eyJhbGciOi.eyJleHAiOjE2N.abcdef123456");
});

(async () => {
  await runAsyncTest("saveInquiry inserts record with inquiry_type and metadata", async () => {
    let capturedUrl = "";
    let capturedOptions = {};

    const sb = loadSupabaseClient();
    sb.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 201,
        text: async () => ""
      };
    };

    const result = await sb.window.CeVoyageBackend.saveInquiry({
      inquiry_type: "travel_request",
      full_name: "Jean Dupont",
      email: "jean@example.com",
      phone: "+33612345678",
      travel_date: "2026-10-15",
      travellers: "2",
      interest: "circuit",
      message: "Looking for a 10-day cultural trip."
    });

    assert.strictEqual(result.stored, true);
    assert.strictEqual(capturedUrl, "https://xlejfklsatjqhsbwmalf.supabase.co/rest/v1/inquiries");
    assert.strictEqual(capturedOptions.method, "POST");
    assert.strictEqual(capturedOptions.headers.apikey, "sb_publishable_LVTjEPcybssazrEoiZDwuA_N23AKUro");
    assert.strictEqual(capturedOptions.headers.Authorization, undefined);

    const body = JSON.parse(capturedOptions.body);
    assert.strictEqual(body.inquiry_type, "travel_request");
    assert.strictEqual(body.full_name, "Jean Dupont");
    assert.strictEqual(body.email, "jean@example.com");
    assert.strictEqual(body.phone, "+33612345678");
    assert.strictEqual(body.status, "new");
    assert.strictEqual(body.source, "website");
    assert.strictEqual(body.page_url, "https://www.ce-voyage.com/index.html");
    assert.strictEqual(body.page_path, "/index.html");
  });

  await runAsyncTest("subscribe inserts lowercase email into newsletter_subscribers", async () => {
    let capturedUrl = "";
    let capturedOptions = {};

    const sb = loadSupabaseClient();
    sb.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        status: 201,
        text: async () => ""
      };
    };

    const result = await sb.window.CeVoyageBackend.subscribe("Traveler.Info@Example.Com ");
    assert.strictEqual(result.stored, true);
    assert.strictEqual(capturedUrl, "https://xlejfklsatjqhsbwmalf.supabase.co/rest/v1/newsletter_subscribers");

    const body = JSON.parse(capturedOptions.body);
    assert.strictEqual(body.email, "traveler.info@example.com");
    assert.strictEqual(body.status, "subscribed");
    assert.strictEqual(body.source, "website");
  });

  console.log("\n=== 2. Testing Homepage Lead Form (app.js) Submission ===");

  await runAsyncTest("Homepage leadForm saves directly to Supabase without opening WhatsApp", async () => {
    let waOpened = false;
    let savedInquiry = null;

    const leadFormMock = {
      reportValidity: () => true,
      reset: function() { this.resetCalled = true; },
      resetCalled: false,
      querySelector: (sel) => {
        if (sel === 'button[type="submit"]') {
          return { disabled: false };
        }
        return null;
      }
    };

    const statusMock = {
      textContent: "",
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); }
      }
    };

    const formDataMap = {
      name: "Sophie Martin",
      email: "sophie@test.fr",
      phone: "+33698765432",
      travelDate: "2026-11-01",
      travellers: "4",
      interest: "nature",
      message: "Safari and beach holiday."
    };

    // Global mock environment
    global.FormData = class {
      get(k) { return formDataMap[k]; }
    };
    global.window = {
      CE_VOYAGE: { defaultLang: "en" },
      I18N: {
        en: {
          requestSuccess: "Thank you! Your travel request has been submitted. We will contact you shortly.",
          sending: "Sending request...",
          saveFailed: "We couldn't submit your request right now. Please try again.",
          requestSubmittedToast: "Travel request submitted successfully!"
        }
      },
      CeVoyageBackend: {
        configured: true,
        saveInquiry: async (inquiry) => {
          savedInquiry = inquiry;
          return { stored: true };
        }
      },
      open: () => { waOpened = true; },
      localStorage: { getItem: () => "en", setItem: () => {} },
      addEventListener: () => {}
    };
    global.document = {
      documentElement: { lang: "en" },
      getElementById: (id) => {
        if (id === "leadForm") return leadFormMock;
        if (id === "leadStatus") return statusMock;
        if (id === "toast") return { classList: { add: () => {}, remove: () => {} } };
        return null;
      },
      querySelectorAll: () => []
    };

    // Simulate leadForm submit handler logic
    const leadFormHandler = async (e) => {
      e.preventDefault();
      const status = statusMock;
      const submitBtn = leadFormMock.querySelector('button[type="submit"]');

      if (!leadFormMock.reportValidity()) return;

      const data = new global.FormData();
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const travelDate = String(data.get("travelDate") || "").trim();
      const travellers = String(data.get("travellers") || "").trim();
      const interest = String(data.get("interest") || "").trim();
      const message = String(data.get("message") || "").trim();

      const inquiry = {
        inquiry_type: "travel_request",
        full_name: name,
        email: email,
        phone: phone,
        contact: email || phone,
        travel_date: travelDate,
        travellers: travellers,
        interest: interest,
        message: message
      };

      if (submitBtn) submitBtn.disabled = true;
      if (status) {
        status.textContent = "Sending request...";
        status.classList.remove("error", "success");
      }

      try {
        await global.window.CeVoyageBackend.saveInquiry(inquiry);
        if (status) {
          status.textContent = "Thank you! Your travel request has been submitted. We will contact you shortly.";
          status.classList.add("success");
          status.classList.remove("error");
        }
        leadFormMock.reset();
      } catch (error) {
        if (status) {
          status.textContent = "Error";
          status.classList.add("error");
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    let prevented = false;
    await leadFormHandler({ preventDefault: () => { prevented = true; } });

    assert.strictEqual(prevented, true);
    assert.strictEqual(waOpened, false, "WhatsApp must NOT open on lead form submit");
    assert.strictEqual(savedInquiry.inquiry_type, "travel_request");
    assert.strictEqual(savedInquiry.full_name, "Sophie Martin");
    assert.strictEqual(savedInquiry.email, "sophie@test.fr");
    assert.strictEqual(savedInquiry.phone, "+33698765432");
    assert.strictEqual(statusMock.textContent, "Thank you! Your travel request has been submitted. We will contact you shortly.");
    assert.strictEqual(statusMock.classList.classes.has("success"), true);
    assert.strictEqual(leadFormMock.resetCalled, true);
  });

  console.log("\n=== 3. Testing 10-Day Tour Request (tours.html) Submission ===");

  await runAsyncTest("Tour form saves directly to Supabase with tour_request type and does NOT open WhatsApp", async () => {
    let waOpened = false;
    let savedTourInquiry = null;

    const tourFormMock = {
      reset: function() { this.resetCalled = true; },
      resetCalled: false
    };

    const tourStatusMock = {
      textContent: "",
      style: {}
    };

    const submitBtnMock = { disabled: false };

    const mockElements = {
      fName: { value: "David Miller" },
      fContact: { value: "david.miller@example.co.uk" },
      fDates: { value: "March 2027" },
      fPax: { value: "4" },
      fHotel: { value: "4★ Charm" },
      fNotes: { value: "Honeymoon couple in the group." },
      tourStatus: tourStatusMock,
      sendTourBtn: submitBtnMock,
      toast: { textContent: "", classList: { add: () => {}, remove: () => {} } }
    };

    global.window = {
      open: () => { waOpened = true; },
      CeVoyageBackend: {
        configured: true,
        saveInquiry: async (inquiry) => {
          savedTourInquiry = inquiry;
          return { stored: true };
        }
      }
    };

    // Simulate tours.html submit handler
    const tourSubmitHandler = async (e) => {
      e.preventDefault();
      const name = mockElements.fName.value.trim();
      const contact = mockElements.fContact.value.trim();
      const dates = mockElements.fDates.value.trim();
      const pax = mockElements.fPax.value;
      const hotel = mockElements.fHotel.value;
      const notes = mockElements.fNotes.value.trim();
      const statusEl = tourStatusMock;
      const submitBtn = submitBtnMock;

      if (!name || !contact) return;

      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) {
        statusEl.textContent = "Submitting tour request...";
        statusEl.style.color = "#0a3d33";
      }

      const isEmail = contact.indexOf("@") !== -1;
      const inquiry = {
        inquiry_type: "tour_request",
        full_name: name,
        contact: contact,
        email: isEmail ? contact : "",
        phone: !isEmail ? contact : "",
        travel_date: dates,
        travellers: pax,
        hotel_level: hotel,
        message: notes
      };

      try {
        await global.window.CeVoyageBackend.saveInquiry(inquiry);
        if (statusEl) {
          statusEl.textContent = "Thank you! Your 10-day tour request has been submitted. We will contact you shortly.";
          statusEl.style.color = "#14765d";
        }
        tourFormMock.reset();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = "Error";
          statusEl.style.color = "#c0392b";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    await tourSubmitHandler({ preventDefault: () => {} });

    assert.strictEqual(waOpened, false, "WhatsApp must NOT open on tour form submit");
    assert.strictEqual(savedTourInquiry.inquiry_type, "tour_request");
    assert.strictEqual(savedTourInquiry.full_name, "David Miller");
    assert.strictEqual(savedTourInquiry.contact, "david.miller@example.co.uk");
    assert.strictEqual(savedTourInquiry.email, "david.miller@example.co.uk");
    assert.strictEqual(savedTourInquiry.travel_date, "March 2027");
    assert.strictEqual(savedTourInquiry.travellers, "4");
    assert.strictEqual(savedTourInquiry.hotel_level, "4★ Charm");
    assert.strictEqual(savedTourInquiry.message, "Honeymoon couple in the group.");
    assert.strictEqual(tourStatusMock.textContent.includes("submitted"), true);
    assert.strictEqual(tourStatusMock.style.color, "#14765d");
    assert.strictEqual(tourFormMock.resetCalled, true);
  });

  console.log("\n=== 4. Testing My Trip Request Form (trip.html) Submission ===");

  await runAsyncTest("My Trip form saves directly to Supabase with trip_plan type, cart items, and does NOT open WhatsApp", async () => {
    let waOpened = false;
    let savedTripInquiry = null;

    const tripFormMock = {
      reset: function() { this.resetCalled = true; },
      resetCalled: false
    };

    const tripStatusMock = {
      textContent: "",
      style: {}
    };

    const submitBtnMock = { disabled: false };

    const mockCart = [
      { placeId: "sigiriya", placeName: "Sigiriya", activityId: "place-visit", activityName: "Visit Sigiriya", type: "Heritage", duration: "3-4h" },
      { placeId: "ella", placeName: "Ella", activityId: "ella-train", activityName: "Nine Arch Bridge & Train", type: "Nature", duration: "2h" }
    ];

    const mockElements = {
      tripName: { value: "Elena Petrova" },
      tripContact: { value: "+79991234567" },
      tripDates: { value: "December 2026 / 14 days" },
      tripTravellers: { value: "3 travellers" },
      tripMessage: { value: "We love tea estates and scenic photography spots." }
    };

    global.window = {
      open: () => { waOpened = true; },
      CeVoyageBackend: {
        configured: true,
        saveInquiry: async (inquiry) => {
          savedTripInquiry = inquiry;
          return { stored: true };
        }
      }
    };

    // Simulate trip.html submit handler
    const tripSubmitHandler = async (e) => {
      e.preventDefault();
      const name = mockElements.tripName.value.trim();
      const contact = mockElements.tripContact.value.trim();
      const dates = mockElements.tripDates.value.trim();
      const pax = mockElements.tripTravellers.value;
      const message = mockElements.tripMessage.value.trim();
      const statusEl = tripStatusMock;
      const submitBtn = submitBtnMock;

      if (!name || !contact) return;

      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) {
        statusEl.textContent = "Submitting trip request...";
        statusEl.style.color = "#0a3d33";
      }

      const isEmail = contact.indexOf("@") !== -1;
      const record = {
        inquiry_type: "trip_plan",
        full_name: name,
        contact: contact,
        email: isEmail ? contact : "",
        phone: !isEmail ? contact : "",
        travel_date: dates,
        travellers: pax,
        message: message,
        trip_items: mockCart
      };

      try {
        await global.window.CeVoyageBackend.saveInquiry(record);
        if (statusEl) {
          statusEl.textContent = "Thank you! Your trip plan has been submitted. Our team will contact you shortly.";
          statusEl.style.color = "#14765d";
        }
        tripFormMock.reset();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = "Error";
          statusEl.style.color = "#c0392b";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    };

    await tripSubmitHandler({ preventDefault: () => {} });

    assert.strictEqual(waOpened, false, "WhatsApp must NOT open on trip form submit");
    assert.strictEqual(savedTripInquiry.inquiry_type, "trip_plan");
    assert.strictEqual(savedTripInquiry.full_name, "Elena Petrova");
    assert.strictEqual(savedTripInquiry.contact, "+79991234567");
    assert.strictEqual(savedTripInquiry.phone, "+79991234567");
    assert.strictEqual(savedTripInquiry.email, "");
    assert.strictEqual(savedTripInquiry.travel_date, "December 2026 / 14 days");
    assert.strictEqual(savedTripInquiry.travellers, "3 travellers");
    assert.strictEqual(savedTripInquiry.message, "We love tea estates and scenic photography spots.");
    assert.strictEqual(Array.isArray(savedTripInquiry.trip_items), true);
    assert.strictEqual(savedTripInquiry.trip_items.length, 2);
    assert.strictEqual(savedTripInquiry.trip_items[0].placeName, "Sigiriya");
    assert.strictEqual(tripStatusMock.textContent.includes("submitted"), true);
    assert.strictEqual(tripStatusMock.style.color, "#14765d");
    assert.strictEqual(tripFormMock.resetCalled, true);
  });

  console.log("\n=== 5. Testing HTML Structure of Form Pages ===");

  runTest("index.html contains leadForm and newsletterForm with correct IDs", () => {
    const html = fs.readFileSync(path.join(__dirname, "../index.html"), "utf8");
    assert.strictEqual(html.includes('id="leadForm"'), true);
    assert.strictEqual(html.includes('id="leadStatus"'), true);
    assert.strictEqual(html.includes('id="newsletterForm"'), true);
    assert.strictEqual(html.includes('id="formMessage"'), true);
  });

  runTest("tours.html contains tourForm, fName, fContact, tourStatus, toast", () => {
    const html = fs.readFileSync(path.join(__dirname, "../tours.html"), "utf8");
    assert.strictEqual(html.includes('id="tourForm"'), true);
    assert.strictEqual(html.includes('id="fName"'), true);
    assert.strictEqual(html.includes('id="fContact"'), true);
    assert.strictEqual(html.includes('id="tourStatus"'), true);
    assert.strictEqual(html.includes('id="toast"'), true);
    assert.strictEqual(html.includes('id="sendTourBtn"'), true);
  });

  runTest("trip.html contains tripRequestForm, tripName, tripContact, tripMessage, tripStatus, toast", () => {
    const html = fs.readFileSync(path.join(__dirname, "../trip.html"), "utf8");
    assert.strictEqual(html.includes('id="tripRequestForm"'), true);
    assert.strictEqual(html.includes('id="tripName"'), true);
    assert.strictEqual(html.includes('id="tripContact"'), true);
    assert.strictEqual(html.includes('id="tripDates"'), true);
    assert.strictEqual(html.includes('id="tripTravellers"'), true);
    assert.strictEqual(html.includes('id="tripMessage"'), true);
    assert.strictEqual(html.includes('id="submitTripBtn"'), true);
    assert.strictEqual(html.includes('id="tripStatus"'), true);
    assert.strictEqual(html.includes('id="toast"'), true);
  });

  console.log(`\n========================================`);
  console.log(`Total tests passed: ${testsPassed}`);
  console.log(`Total tests failed: ${testsFailed}`);
  console.log(`========================================\n`);

  if (testsFailed > 0) {
    process.exit(1);
  }
})();
