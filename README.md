# Engaging Networks Homepage Takeover Redirect

This repository contains example code and resources for a **homepage takeover** campaign flow for any client using Engaging Networks (EN) and Google Tag Manager (GTM). In a "Homepage Takeover," all homepage visitors are temporarily redirected to a dedicated Engaging Networks donation page on specific dates. The GTM tag (running on both the live site and staging environment) triggers these site-wide redirects on the designated dates. These demo pages and scripts simulate various campaign scenarios, including date-based redirects and a custom message bar to guide users.

**DEMO Recording**: [Demo Recording](https://cln.sh/gWLHqRry)

**Landing Page Code**: [`landing-page-gtm-tag.js`](https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/landing-page-gtm-tag.js)

**Engaging Networks Page Code**: [`en-code-block.js`](https://github.com/4site-interactive-studios/4site-en-landing-page-redirect/blob/main/en-code-block.js)

---

## How It Works

1. **Automatic Redirects on Key Dates**
   On a specified takeover date (or a simulated date for testing), the GTM tag script checks the current date. If it matches a target date, the user is **automatically redirected** from the landing page (e.g. the homepage) to the corresponding EN donation page. All URL query parameters from the original page are preserved and passed along to the donation page during the redirect.

2. **Message Bar & Return Link**
   When a visitor lands on the EN donation page via the redirect, a notice bar appears at the top of the page with a customizable prompt. The return link text automatically extracts the domain from the referrer URL (e.g. *"Click here to continue to yourwebsite.org"*). This message bar provides a **return link** that takes the user back to the original page they came from (the originating URL is stored and used for this link). This allows users to easily navigate back to the main site after seeing the donation form.

3. **Redirect Suppression**
   If the user clicks the return link (or if the system detects a `no-redirect` flag in the URL), the script will append a `no-redirect` parameter to the homepage URL and set a **suppression cookie**. This cookie lasts for 24 hours and tells the script not to redirect that user again. In other words, once a user returns to the site, they won't be immediately redirected again (even if they revisit the homepage on the same date), preventing any potential redirect loop or frustration.

---

## Setup Instructions

To implement this homepage takeover on your site, follow these steps:

1. **Configure the GTM Tag Script**
   Edit the `landing-page-gtm-tag.js` file and configure the `urlsByDate` object at the top of the file with your specific dates and corresponding Engaging Networks page URLs. 
   
   **Date Format Options:**
   - `"MM-DD"` format (e.g., `"12-03"`) - Matches the date every year (year-agnostic)
   - `"MM-DD-YYYY"` format (e.g., `"12-03-2024"`) - Matches the date only in the specified year (year-specific)
   
   Year-specific dates take precedence over year-agnostic dates when both are configured for the same month and day. Include any necessary URL arguments such as tracking codes in the URLs. Copy this script into your Google Tag Manager tag.

2. **Configure the EN Page Code**
   Edit the `en-code-block.js` file and set the `returnLinkTextTemplate` configuration variable at the top of the file with your desired return message text template. The template should include `{domain}` as a placeholder, which will be automatically replaced with the actual domain from the referrer URL. On the Engaging Networks donation page (and its thank-you page) that users will be redirected to, include this script at the bottom of the page. This code is responsible for displaying the return message bar and handling the return link logic on the EN pages.

3. **Configure GTM Tag**
   In **Google Tag Manager**, create or edit a Custom HTML tag with the configured `landing-page-gtm-tag.js` script. Set the tag to fire on the appropriate pages (e.g., the site's homepage or site-wide) and on the correct dates.

4. **Publish / Testing GTM Changes**
   After configuring the tag, publish the updated GTM container so that the changes are saved and ready. Before pushing the GTM container live, you can preview the homepage takeover using **GTM's Preview Mode**. This lets you test the functionality on the real site without affecting all visitors. 
   
   **Testing with Simulated Dates:**
   - Year-agnostic: `https://yourwebsite.org?simulate-date=12-03` (simulates December 3rd)
   - Year-specific: `https://yourwebsite.org?simulate-date=12-03-2024` (simulates December 3rd, 2024)
   
   Using these URLs (with GTM Preview enabled for that container version) will simulate the redirect as if it were the specified date. You should see the homepage redirect to the specified EN page and the message bar appear, just as it would during a live campaign.

5. **Verify Deployment**
   Once the container is pushed live, test the functionality on the live site around the specified date to ensure the redirect and return bar work as expected.

---

## Date Configuration

The script supports two date formats for maximum flexibility:

### Year-Agnostic Dates (`MM-DD`)
Use this format when you want a redirect to occur on the same date every year. For example:
```javascript
const urlsByDate = {
  "12-03": "https://support.example.org/page/12345/donate/1",
  "12-31": "https://support.example.org/page/12345/donate/1"
};
```
This configuration will redirect users on December 3rd and December 31st every year.

### Year-Specific Dates (`MM-DD-YYYY`)
Use this format when you want a redirect to occur only in a specific year. For example:
```javascript
const urlsByDate = {
  "12-03-2024": "https://support.example.org/page/12345/donate/1",
  "12-31-2024": "https://support.example.org/page/12345/donate/1"
};
```
This configuration will redirect users on December 3rd and December 31st only in 2024.

### Mixed Configuration
You can mix both formats in the same configuration. Year-specific dates take precedence:
```javascript
const urlsByDate = {
  "12-03": "https://support.example.org/page/default/donate/1",  // Every year
  "12-03-2024": "https://support.example.org/page/special/donate/1"  // Only 2024
};
```
In this example, December 3rd, 2024 will use the special URL, while December 3rd in other years will use the default URL.

---

## Demo Pages and Simulating Different Dates

For testing purposes, the landing page script supports a `simulate-date` query parameter. You can append this to the URL to simulate how the redirect behaves on specific dates. This is useful for previewing the takeover logic without waiting for the actual dates.

**Supported Date Formats:**
- `MM-DD` format: `?simulate-date=12-03`
- `MM-DD-YYYY` format: `?simulate-date=12-03-2024`

Example usage:
* **Simulate 12/03 (any year)** – *Redirects to configured EN page for that date* - 
  `https://yourwebsite.org?simulate-date=12-03`

* **Simulate 12/03/2024 (specific year)** – *Redirects to configured EN page for that specific date* - 
  `https://yourwebsite.org?simulate-date=12-03-2024`

* **Simulate 12/20** – *No redirect occurs (date not in redirect list)* - 
  `https://yourwebsite.org?simulate-date=12-20`

* **Simulate 12/30** – *Redirects to configured EN page for that date* - 
  `https://yourwebsite.org?simulate-date=12-30`

---

## Configuration Options

### Landing Page Script (`landing-page-gtm-tag.js`)

**`urlsByDate`** - Object mapping dates to redirect URLs
- Keys: Date strings in `"MM-DD"` or `"MM-DD-YYYY"` format
- Values: Full URLs to Engaging Networks pages (include tracking parameters as needed)

**`suppressionCookie`** - Cookie name for redirect suppression (default: `"redirectSuppressed"`)

**`SUPPRESSION_DURATION_DAYS`** - How long to suppress redirects (default: `1` day)

### Engaging Networks Page Script (`en-code-block.js`)

**`returnLinkTextTemplate`** - Template for the return link text
- Must include `{domain}` placeholder which will be replaced with the actual domain
- Example: `"Click here to continue to {domain}"`
- The domain is automatically extracted from the referrer/originating URL

**`COOKIE_EXPIRATION_SECONDS`** - How long to store the originating URL in a cookie (default: `1800` seconds / 30 minutes)

**`BANNER_STYLE`** - CSS styles for the message bar banner

**`LINK_STYLE`** - CSS styles for the return link

---

## Developer Notes

* **URL Parameters Preserved**
  Redirects will include any URL arguments present on the landing page. All query parameters are carried over to the EN donation page.

* **Customizing Text**
  To change the return message bar text, edit the `returnLinkTextTemplate` configuration variable in `en-code-block.js`. The `{domain}` placeholder will be automatically replaced with the actual domain from the referrer. To change redirect dates and URLs, edit the `urlsByDate` object in `landing-page-gtm-tag.js`.

* **Date Matching Priority**
  When both year-agnostic (`MM-DD`) and year-specific (`MM-DD-YYYY`) dates are configured for the same month and day, the year-specific date takes precedence for that year.

* **Error Handling**
  The scripts include comprehensive error handling for URL construction, cookie operations, and DOM manipulation. Errors are logged to the console for debugging purposes.

* **Security**
  The code uses `textContent` instead of `innerHTML` to prevent XSS vulnerabilities. All user input is properly sanitized and validated.

* **Set It and Forget It**
  The script is meant to run during the campaign window and can be safely left in place until you're ready to remove it post-campaign.

---

## Technical Details

* **Cookie Suppression**: Uses proper cookie parsing to avoid false positives
* **Date Validation**: Validates both format and actual date validity (prevents invalid dates like "13-45" or "02-30")
* **URL Fallback**: Handles edge cases where referrer or originating URL may not be available
* **Cross-Browser Compatibility**: Works in all modern browsers that support ES6 features
