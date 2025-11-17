/* Code to be added to the page(s) the visitor will have been redirected to */
/* This script displays a return message bar on Engaging Networks pages when visitors arrive via redirect */

// ============================================================================
// CONFIGURATION
// ============================================================================
// Customize the return link text template
// The domain will be automatically extracted from the referrer/originating URL
const returnLinkTextTemplate = "Click here to continue to {domain}";
// ============================================================================

(function () {
  const queryParams = new URLSearchParams(window.location.search);
  const isRedirected = queryParams.has("was-redirected");
  const isInIframe = window.self !== window.top;
  const originatingUrlParam = queryParams.get("originating-url");
  const originatingUrlCookie = getCookie("originatingUrl");

  // Get cookie by name
  function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let c of ca) {
      while (c.charAt(0) === " ") c = c.substring(1);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
    }
    return null;
  }

  // Set cookie with expiration (in seconds)
  function setCookie(name, value, seconds) {
    const date = new Date();
    date.setTime(date.getTime() + seconds * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  }

  // Save originating URL to cookie if present
  if (originatingUrlParam) {
    setCookie("originatingUrl", originatingUrlParam, 1800);

    // Remove the originating-url argument from the URL
    queryParams.delete("originating-url");
    const newQueryString = queryParams.toString();
    const newUrl = `${window.location.pathname}${
      newQueryString ? "?" + newQueryString : ""
    }`;

    // Update the browser URL without reloading the page
    window.history.replaceState(null, "", newUrl);
  }

  const originatingUrl = originatingUrlParam || originatingUrlCookie;

  // Function to extract domain from a URL
  function getDomainFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      // If URL parsing fails, try to extract domain manually
      const match = url.match(/https?:\/\/([^\/]+)/);
      return match ? match[1] : url;
    }
  }

  // Function to generate return link text from referrer/originating URL
  function getReturnLinkText() {
    const sourceUrl = originatingUrl || document.referrer;
    if (!sourceUrl) {
      return returnLinkTextTemplate.replace("{domain}", "the website");
    }
    const domain = getDomainFromUrl(sourceUrl);
    return returnLinkTextTemplate.replace("{domain}", domain);
  }

  // Declare bar outside of the if block so it can be accessed globally within the function
  let bar;

  // Function to adjust the body's margin based on the banner height
  function adjustBodyMargin() {
    if (bar) {
      const barHeight = bar.offsetHeight;
      document.body.style.marginTop = `${barHeight}px`;
    }
  }

  // Show banner if redirected, in iframe, or cookie exists
  if (isRedirected || isInIframe || originatingUrlCookie) {
    bar = document.createElement("div");
    bar.style =
      "position:fixed;top:0;width:100%;background-color:#00689f;color:#fff;padding:15px 10px;text-align:center;z-index:9999;box-sizing:border-box;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;";

    // Create return link
    const returnLink = document.createElement("a");
    returnLink.href = originatingUrl || "#";
    returnLink.innerHTML = getReturnLinkText();
    returnLink.style = "color:#ffffff;text-decoration:underline;";

    // Append elements to banner
    bar.appendChild(returnLink);
    document.body.appendChild(bar);

    // Use requestAnimationFrame to ensure the banner is fully rendered before adjusting margin
    requestAnimationFrame(adjustBodyMargin);

    // Handle window resize
    window.addEventListener("resize", adjustBodyMargin);

    // Handle return link click
    returnLink.addEventListener("click", function (e) {
      e.preventDefault();
      queryParams.delete("was-redirected");
      queryParams.delete("originating-url");

      // Redirect back using the original URL from the cookie, adding `no-redirect`
      const originalUrl = new URL(originatingUrl || document.referrer || "/");
      originalUrl.searchParams.set("no-redirect", "");

      window.location.href = originalUrl.toString();
    });
  }
})();
