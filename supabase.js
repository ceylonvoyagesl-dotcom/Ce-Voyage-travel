/* Ce Voyage — small Supabase REST client for the static website.
 * Only use a public anon/publishable key here. Never put service_role keys in browser code.
 */
(function () {
  "use strict";

  var config = (window.CE_VOYAGE && window.CE_VOYAGE.supabase) || {};
  var url = String(config.url || "").replace(/\/$/, "");
  var key = String(config.anonKey || "");
  var configured = /^https:\/\/.+\.supabase\.co$/i.test(url) && key && key.indexOf("YOUR_") === -1;

  function pageMetadata() {
    return {
      page_url: window.location.href,
      page_path: window.location.pathname,
      language: document.documentElement.lang || navigator.language || "en",
      user_agent: navigator.userAgent
    };
  }

  function insert(table, record) {
    if (!configured) {
      console.info("Ce Voyage: Supabase is not configured; request was not stored.");
      return Promise.resolve({ stored: false, reason: "not_configured" });
    }

    return fetch(url + "/rest/v1/" + table, {
      method: "POST",
      keepalive: true,
      headers: {
        apikey: key,
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(record)
    }).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (body) {
          throw new Error("Supabase insert failed (" + response.status + "): " + body);
        });
      }
      return { stored: true };
    });
  }

  function saveInquiry(fields) {
    fields = fields || {};
    return insert("inquiries", Object.assign({
      inquiry_type: fields.inquiry_type || "general",
      status: "new",
      source: "website"
    }, pageMetadata(), fields));
  }

  function subscribe(email) {
    return insert("newsletter_subscribers", Object.assign({
      email: String(email || "").trim().toLowerCase(),
      status: "subscribed",
      source: "website"
    }, pageMetadata()));
  }

  window.CeVoyageBackend = {
    configured: configured,
    saveInquiry: saveInquiry,
    subscribe: subscribe
  };
})();
