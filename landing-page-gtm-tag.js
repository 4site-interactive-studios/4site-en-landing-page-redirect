/* Engaging Networks Homepage Takeover Redirect Script

Source Code: https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/landing-page-gtm-tag.js

This script manages time-based redirections for specific dates on landing pages. It checks the current date and, if it matches a target date, redirects users to a designated Engaging Networks page URL for that day. The script also includes a suppression feature: it sets a cookie to prevent multiple redirects within a 24-hour period and allows users to opt out of redirection by adding a 'no-redirect' parameter to the URL. Additionally, any query parameters from the original URL are preserved and passed along to the redirect destination.
*/

// ============================================================================
// CONFIGURATION
// ============================================================================
// Configure the dates and corresponding Engaging Networks page URLs
// Date format: "MM-DD" (e.g., "12-03" for December 3rd)
// Include any necessary URL parameters such as tracking codes in the URLs
var urlsByDate = {
  "12-03":
    "https://support.yourorganization.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
  "12-30":
    "https://support.yourorganization.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
  "12-31":
    "https://support.yourorganization.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
};

// Cookie name used to suppress redirects (prevents multiple redirects within 24 hours)
var suppressionCookie = "redirectSuppressed";
// ============================================================================

(function () {
  var queryParams = new URLSearchParams(window.location.search);

  // Set a cookie with expiration date (specified in days)
  function setCookie(name, value, days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000); // Convert days to milliseconds
    var expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + "; " + expires + "; path=/";
  }

  // If no-redirect parameter is present, set suppression cookie and exit
  // This allows users to opt out of redirects
  if (queryParams.has("no-redirect")) {
    setCookie(suppressionCookie, "true", 1); // Suppress redirects for 24 hours
    return;
  }

  // Check if suppression cookie exists (user has already been redirected or opted out)
  if (document.cookie.indexOf(suppressionCookie) !== -1) {
    return; // Exit early - suppression is active
  }

  // Build redirect URL by appending original query parameters and tracking flags
  // Preserves all original URL parameters and adds was-redirected and originating-url flags
  function buildRedirectUrl(redirectUrl) {
    var redirectParams = new URLSearchParams(queryParams.toString());
    redirectParams.append("was-redirected", "");
    redirectParams.append("originating-url", window.location.href);
    var separator = redirectUrl.indexOf("?") === -1 ? "?" : "&";
    return redirectUrl + separator + redirectParams.toString();
  }

  // Get current date in MM-DD format, or use simulated date from query parameter for testing
  // Allows testing redirects on any date using ?simulate-date=MM-DD
  function getCurrentOrSimulatedDate() {
    var simulateDate = queryParams.get("simulate-date");
    if (simulateDate && /^\d{2}-\d{2}$/.test(simulateDate)) {
      return simulateDate; // Use simulated date if provided and valid (MM-DD format)
    }
    var today = new Date();
    return (
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }

  // Check if today's date matches a configured redirect date
  var todayFormatted = getCurrentOrSimulatedDate();

  if (urlsByDate[todayFormatted]) {
    // Set suppression cookie before redirecting to prevent redirect loops
    setCookie(suppressionCookie, "true", 1); // Suppress for 24 hours

    // Redirect to the configured Engaging Networks page for this date
    window.location.href = buildRedirectUrl(urlsByDate[todayFormatted]);
  }
})();
