/* Code to be added to the page(s) the visitor will have been redirected to */
/* This script displays a return message bar on Engaging Networks pages when visitors arrive via redirect */

/* CONFIGURATION:
This script requires a configuration object to be defined before it loads:
  window.targetPageConfig = {
    returnLinkTextTemplate: "Click here to continue to {domain}",  // Template with {domain} placeholder
    cookieExpirationSeconds: 1800,  // Cookie expiration in seconds (optional, defaults shown)
    bannerStyle: "...",              // CSS string for banner styling (optional, defaults shown)
    linkStyle: "..."                 // CSS string for link styling (optional, defaults shown)
  };
*/

(function () {
  // Check for configuration object
  if (!window.targetPageConfig) {
    console.error(
      "target-page-script.js: Configuration object 'window.targetPageConfig' is required but not found."
    );
    return;
  }

  const config = window.targetPageConfig;

  // Validate required configuration
  if (
    !config.returnLinkTextTemplate ||
    typeof config.returnLinkTextTemplate !== "string"
  ) {
    console.error(
      "target-page-script.js: 'returnLinkTextTemplate' string is required in configuration."
    );
    return;
  }

  // Set defaults for optional configuration
  const returnLinkTextTemplate = config.returnLinkTextTemplate;
  const COOKIE_EXPIRATION_SECONDS = config.cookieExpirationSeconds || 1800;
  const BANNER_STYLE =
    config.bannerStyle ||
    "position:fixed;top:0;width:100%;background-color:#00689f;color:#fff;padding:15px 10px;text-align:center;z-index:9999;box-sizing:border-box;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;";
  const LINK_STYLE =
    config.linkStyle || "color:#ffffff;text-decoration:underline;";

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

  // Set cookie with expiration (in seconds) and security attributes
  function setCookie(name, value, seconds) {
    const date = new Date();
    date.setTime(date.getTime() + seconds * 1000);
    const expires = `expires=${date.toUTCString()}`;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax${secure}`;
  }

  // Validate that a URL string is valid and uses http/https protocol
  function isValidUrl(url) {
    if (!url || typeof url !== "string") return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "http:" || urlObj.protocol === "https:";
    } catch (e) {
      return false;
    }
  }

  const queryParams = new URLSearchParams(window.location.search);
  const isRedirected = queryParams.has("was-redirected");
  const isInIframe = window.self !== window.top;
  const originatingUrlParam = queryParams.get("originating-url");
  const originatingUrlCookie = getCookie("originatingUrl");

  // Save originating URL to cookie if present in query parameters and valid
  if (originatingUrlParam && isValidUrl(originatingUrlParam)) {
    setCookie("originatingUrl", originatingUrlParam, COOKIE_EXPIRATION_SECONDS);

    // Remove the originating-url parameter from the URL for cleaner address bar
    try {
      queryParams.delete("originating-url");
      const newQueryString = queryParams.toString();
      const newUrl = `${window.location.pathname}${
        newQueryString ? "?" + newQueryString : ""
      }`;

      // Update browser URL without page reload
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, "", newUrl);
      }
    } catch (error) {
      // If URL manipulation fails, continue without updating URL
      console.error("Error updating URL:", error);
    }
  }

  const originatingUrl = originatingUrlParam || originatingUrlCookie;

  // Extract domain (hostname) from a URL string
  function getDomainFromUrl(url) {
    if (!url || typeof url !== "string") {
      return null;
    }
    
    try {
      const urlObj = new URL(url);
      
      // Handle file:// URLs - extract filename or use generic text
      if (urlObj.protocol === "file:") {
        // Try to extract a meaningful name from the path
        const pathParts = urlObj.pathname.split("/").filter(Boolean);
        if (pathParts.length > 0) {
          const filename = pathParts[pathParts.length - 1];
          // Remove .html extension if present
          return filename.replace(/\.html?$/, "") || "the original page";
        }
        return "the original page";
      }
      
      // For http/https URLs, return the hostname
      if (urlObj.protocol === "http:" || urlObj.protocol === "https:") {
        return urlObj.hostname;
      }
      
      // For other protocols, try to extract hostname
      return urlObj.hostname || null;
    } catch (e) {
      // Fallback: manually extract domain if URL constructor fails
      const httpMatch = url.match(/https?:\/\/([^\/]+)/);
      if (httpMatch) {
        return httpMatch[1];
      }
      
      // For file:// URLs, try to extract filename
      const fileMatch = url.match(/file:\/\/\/.+?\/([^\/]+\.html?)/i);
      if (fileMatch) {
        return fileMatch[1].replace(/\.html?$/, "");
      }
      
      return null;
    }
  }

  // Generate return link text by extracting domain from referrer/originating URL
  // Falls back to "the website" if no URL is available
  function getReturnLinkText() {
    const sourceUrl = originatingUrl || document.referrer;
    if (!sourceUrl) {
      return returnLinkTextTemplate.replace("{domain}", "the website");
    }
    
    const domain = getDomainFromUrl(sourceUrl);
    
    // If domain extraction failed or returned empty, use fallback
    if (!domain || domain === sourceUrl) {
      return returnLinkTextTemplate.replace("{domain}", "the website");
    }
    
    return returnLinkTextTemplate.replace("{domain}", domain);
  }

  // Declare bar outside the if block for global access within the function scope
  let bar;

  // Function to adjust the body's margin based on the banner height
  function adjustBodyMargin() {
    if (bar && document.body) {
      const barHeight = bar.offsetHeight;
      document.body.style.marginTop = `${barHeight}px`;
    }
  }

  // Show banner if redirected, in iframe, or cookie exists
  // Only proceed if document.body exists
  if ((isRedirected || isInIframe || originatingUrlCookie) && document.body) {
    bar = document.createElement("div");
    bar.style = BANNER_STYLE;

    // Create return link
    const returnLink = document.createElement("a");
    returnLink.href = originatingUrl || "#";
    returnLink.textContent = getReturnLinkText();
    returnLink.style = LINK_STYLE;

    // Append elements to banner
    bar.appendChild(returnLink);
    document.body.appendChild(bar);

    // Wait for banner to render before adjusting body margin
    requestAnimationFrame(adjustBodyMargin);

    // Adjust margin when window is resized
    window.addEventListener("resize", adjustBodyMargin);

    // Handle return link click - redirect back to originating page
    returnLink.addEventListener("click", function (e) {
      e.preventDefault();

      // Redirect back to original URL with no-redirect parameter to prevent redirect loop
      try {
        // Use originating URL, referrer, or current origin as fallback
        const fallbackUrl =
          originatingUrl ||
          document.referrer ||
          window.location.origin + window.location.pathname;
        
        // Validate URL before redirecting
        if (!isValidUrl(fallbackUrl)) {
          console.error("Invalid redirect URL:", fallbackUrl);
          return;
        }
        
        const originalUrl = new URL(fallbackUrl);
        originalUrl.searchParams.set("no-redirect", "");

        window.location.href = originalUrl.toString();
      } catch (error) {
        // If URL construction fails, redirect to origin with no-redirect
        console.error("Error constructing redirect URL:", error);
        window.location.href =
          window.location.origin + window.location.pathname + "?no-redirect";
      }
    });
  }
})();

