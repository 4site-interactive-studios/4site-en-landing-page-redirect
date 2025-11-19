# Engaging Networks Homepage Takeover Redirect

This repository contains example code and resources for a **homepage takeover** campaign flow for any client using Engaging Networks (EN) and Google Tag Manager (GTM). In a "Homepage Takeover," all homepage visitors are temporarily redirected to a dedicated Engaging Networks donation page on specific dates. The GTM tag (running on both the live site and staging environment) triggers these site-wide redirects on the designated dates. These demo pages and scripts simulate various campaign scenarios, including date-based redirects and a custom message bar to guide users.

**DEMO Recording**: [Demo Recording](https://cln.sh/gWLHqRry)

**Landing Page Script**: [`redirect-script.js`](https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/redirect-script.js)

**Engaging Networks Page Code**: [`target-page-script.js`](https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/target-page-script.js)

**Example HTML Files**:

- [`index.html`](https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/index.html) - Generic example landing page
- [`wwf/index.html`](https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/wwf/index.html) - WWF-specific example landing page

---

## How It Works

1. **Automatic Redirects on Key Dates**
   On a specified takeover date (or a simulated date for testing), the GTM tag script checks the current date. If it matches a target date, the user is **automatically redirected** from the landing page (e.g. the homepage) to the corresponding EN donation page. All URL query parameters from the original page are preserved and passed along to the donation page during the redirect.

2. **Message Bar & Return Link**
   When a visitor lands on the EN donation page via the redirect, a notice bar appears at the top of the page with a customizable prompt. The return link text automatically extracts the domain from the referrer URL (e.g. _"Click here to continue to yourwebsite.org"_). This message bar provides a **return link** that takes the user back to the original page they came from (the originating URL is stored and used for this link). This allows users to easily navigate back to the main site after seeing the donation form.

3. **Redirect Suppression**
   If the user clicks the return link (or if the system detects a `no-redirect` flag in the URL), the script will append a `no-redirect` parameter to the homepage URL and set a **suppression cookie**. This cookie lasts for 24 hours and tells the script not to redirect that user again. In other words, once a user returns to the site, they won't be immediately redirected again (even if they revisit the homepage on the same date), preventing any potential redirect loop or frustration.

---

## Setup Instructions

To implement this homepage takeover on your site, follow these steps:

1. **Configure the Redirect Script**
   The redirect script uses a configuration object that must be defined before the script loads. Create a configuration object with your specific dates and corresponding Engaging Networks page URLs.

   **Date Format:**

   - Only `"YYYY-MM-DD"` format is supported (e.g., `"2025-12-03"`). All dates must include the full year.

   Include any necessary URL arguments such as tracking codes in the URLs. See the example HTML files for reference on how to structure the configuration.

2. **Configure the EN Page Code**
   The target page script uses a configuration object that must be defined before the script loads. Create a `window.targetPageConfig` object with your desired settings. The `returnLinkTextTemplate` should include `{domain}` as a placeholder, which will be automatically replaced with the actual domain from the referrer URL. On the Engaging Networks donation page (and its thank-you page) that users will be redirected to, include the configuration object and script tag. This code is responsible for displaying the return message bar and handling the return link logic on the EN pages.

3. **Configure GTM Tag**
   In **Google Tag Manager**, create or edit a Custom HTML tag that includes:

   1. The configuration object (`window.landingPageRedirectConfig`) with your dates and URLs
   2. A script tag that loads `redirect-script.js` (you can host this file on your server or use a CDN)

   Set the tag to fire on the appropriate pages (e.g., the site's homepage or site-wide). The script will automatically check dates and redirect when needed.

4. **Publish / Testing GTM Changes**
   After configuring the tag, publish the updated GTM container so that the changes are saved and ready. Before pushing the GTM container live, you can preview the homepage takeover using **GTM's Preview Mode**. This lets you test the functionality on the real site without affecting all visitors.

   **Testing with Simulated Dates:**

   - Use the `YYYY-MM-DD` format: `https://yourwebsite.org?simulate-date=2025-12-03` (simulates December 3rd, 2025)

   Using these URLs (with GTM Preview enabled for that container version) will simulate the redirect as if it were the specified date. You should see the homepage redirect to the specified EN page and the message bar appear, just as it would during a live campaign.

   You can also test locally using the example HTML files (`index.html` or `wwf/index.html`) by opening them in a browser and adding the `?simulate-date=YYYY-MM-DD` parameter to the URL.

5. **Verify Deployment**
   Once the container is pushed live, test the functionality on the live site around the specified date to ensure the redirect and return bar work as expected.

---

## Date Configuration

The script only supports the `YYYY-MM-DD` date format (ISO 8601 standard) for all date configurations. This ensures clear, unambiguous date matching. No other date formats are supported.

### Configuration Structure

The script requires a configuration object to be defined before it loads:

```javascript
window.landingPageRedirectConfig = {
  urlsByDate: {
    "2025-12-03": "https://support.example.org/page/12345/donate/1",
    "2025-12-30": "https://support.example.org/page/12345/donate/1",
    "2025-12-31": "https://support.example.org/page/12345/donate/1",
  },
  suppressionCookie: "redirectSuppressed", // Optional, defaults shown
  suppressionDurationDays: 1, // Optional, defaults shown
};
```

### Date Format (`YYYY-MM-DD`)

**Only `YYYY-MM-DD` format is supported.** All dates must be in `YYYY-MM-DD` format (e.g., `"2025-12-03"` for December 3rd, 2025). This format:

- Requires the full year (each date must include the full year)
- Follows ISO 8601 standard for consistency
- Prevents ambiguity between different date formats
- Makes it easy to configure multiple years with different URLs

**Note:** Other date formats (such as `MM-DD` or `MM-DD-YYYY`) are not supported.

### Example Configuration

```javascript
window.landingPageRedirectConfig = {
  urlsByDate: {
    "2025-12-03":
      "https://support.example.org/page/12345/donate/1?campaign=year-end-2025",
    "2025-12-31":
      "https://support.example.org/page/12345/donate/1?campaign=new-year-eve-2025",
    "2026-12-03":
      "https://support.example.org/page/12345/donate/1?campaign=year-end-2026",
  },
  suppressionCookie: "redirectSuppressed",
  suppressionDurationDays: 1,
};
```

This configuration will redirect users on:

- December 3rd, 2025 to the year-end-2025 campaign page
- December 31st, 2025 to the new-year-eve-2025 campaign page
- December 3rd, 2026 to the year-end-2026 campaign page

---

## Demo Pages and Simulating Different Dates

For testing purposes, the landing page script supports a `simulate-date` query parameter. You can append this to the URL to simulate how the redirect behaves on specific dates. This is useful for previewing the takeover logic without waiting for the actual dates.

**Date Format:**

- Only `YYYY-MM-DD` format is supported: `?simulate-date=2025-12-03`

Example usage:

- **Simulate December 3rd, 2025** – _Redirects to configured EN page for that date_ -
  `https://yourwebsite.org?simulate-date=2025-12-03`

- **Simulate December 30th, 2025** – _Redirects to configured EN page for that date_ -
  `https://yourwebsite.org?simulate-date=2025-12-30`

- **Simulate January 15th, 2025** – _No redirect occurs (date not in redirect list)_ -
  `https://yourwebsite.org?simulate-date=2025-01-15`

- **Test locally with example files** – Open `index.html?simulate-date=2025-12-03` in your browser to test the redirect functionality locally.

**Note:** The `simulate-date` parameter must match the exact `YYYY-MM-DD` format used in your configuration. If the simulated date matches a configured date in `urlsByDate`, the redirect will occur.

---

## Configuration Options

### Landing Page Script (`redirect-script.js`)

The script requires a configuration object `window.landingPageRedirectConfig` to be defined before the script loads:

**`urlsByDate`** - Object mapping dates to redirect URLs (required)

- Keys: Date strings in `"YYYY-MM-DD"` format (e.g., `"2025-12-03"`)
- Values: Full URLs to Engaging Networks pages (include tracking parameters as needed)

**`suppressionCookie`** - Cookie name for redirect suppression (optional, default: `"redirectSuppressed"`)

**`suppressionDurationDays`** - How long to suppress redirects in days (optional, default: `1` day)

**Example Configuration:**

```javascript
window.landingPageRedirectConfig = {
  urlsByDate: {
    "2025-12-03":
      "https://support.example.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
    "2025-12-31":
      "https://support.example.org/page/12345/donate/1?transaction.othamt1=TRACKINGCODE",
  },
  suppressionCookie: "redirectSuppressed",
  suppressionDurationDays: 1,
};
```

### Engaging Networks Page Script (`target-page-script.js`)

The script requires a configuration object `window.targetPageConfig` to be defined before the script loads:

**`returnLinkTextTemplate`** - Template for the return link text (optional, default: `"Click here to continue to {domain}"`)

- Must include `{domain}` placeholder which will be replaced with the actual domain
- The domain is automatically extracted from the referrer/originating URL

**`cookieExpirationSeconds`** - How long to store the originating URL in a cookie (optional, default: `1800` seconds / 30 minutes)

**`bannerStyle`** - CSS styles for the message bar banner (optional, has default styling)

**`linkStyle`** - CSS styles for the return link (optional, has default styling)

**Example Configuration:**

```javascript
window.targetPageConfig = {
  returnLinkTextTemplate: "Click here to continue to {domain}",
  cookieExpirationSeconds: 1800,
  bannerStyle:
    "position:fixed;top:0;width:100%;background-color:#000000;color:#fff;padding:15px 10px;text-align:center;z-index:9999;box-sizing:border-box;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;",
  linkStyle: "color:#ffffff;text-decoration:underline;",
};
```

---

## Developer Notes

- **URL Parameters Preserved**
  Redirects will include any URL arguments present on the landing page. All query parameters are carried over to the EN donation page.

- **Customizing Text**
  To change the return message bar text, edit the `returnLinkTextTemplate` property in your `window.targetPageConfig` object. The `{domain}` placeholder will be automatically replaced with the actual domain from the referrer. To change redirect dates and URLs, edit the `urlsByDate` object in your `window.landingPageRedirectConfig` configuration (see example HTML files for reference).

- **Date Format**
  Only `YYYY-MM-DD` format is supported. All dates must be in this format. This ensures clear, unambiguous date matching and follows ISO 8601 standards. No other date formats are supported.

- **Error Handling**
  The scripts include comprehensive error handling for URL construction, cookie operations, and DOM manipulation. Errors are logged to the console for debugging purposes.

- **Security**
  The code uses `textContent` instead of `innerHTML` to prevent XSS vulnerabilities. All user input is properly sanitized and validated.

- **Set It and Forget It**
  The script is meant to run during the campaign window and can be safely left in place until you're ready to remove it post-campaign.

---

## Technical Details

- **Cookie Suppression**: Uses proper cookie parsing to avoid false positives
- **Date Validation**: Validates both format and actual date validity (prevents invalid dates like "13-45" or "02-30")
- **URL Fallback**: Handles edge cases where referrer or originating URL may not be available
- **Cross-Browser Compatibility**: Works in all modern browsers that support ES6 features
