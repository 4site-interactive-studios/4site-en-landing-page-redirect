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
   When a visitor lands on the EN donation page via the redirect, a notice bar appears at the top of the page with a customizable prompt (e.g. *"Click here to continue to yourwebsite.org"*). This message bar provides a **return link** that takes the user back to the original page they came from (the originating URL is stored and used for this link). This allows users to easily navigate back to the main site after seeing the donation form.

3. **Redirect Suppression**
   If the user clicks the return link (or if the system detects a `no-redirect` flag in the URL), the script will append a `no-redirect` parameter to the homepage URL and set a **suppression cookie**. This cookie lasts for 24 hours and tells the script not to redirect that user again. In other words, once a user returns to the site, they won't be immediately redirected again (even if they revisit the homepage on the same date), preventing any potential redirect loop or frustration.

---

## Setup Instructions

To implement this homepage takeover on your site, follow these steps:

1. **Configure the GTM Tag Script**
   Edit the `landing-page-gtm-tag.js` file and configure the `urlsByDate` object at the top of the file with your specific dates and corresponding Engaging Networks page URLs. Include any necessary URL arguments such as tracking codes. Copy this script into your Google Tag Manager tag.

2. **Configure the EN Page Code**
   Edit the `en-code-block.js` file and set the `returnLinkText` configuration variable at the top of the file with your desired return message text. On the Engaging Networks donation page (and its thank-you page) that users will be redirected to, include this script at the bottom of the page. This code is responsible for displaying the return message bar and handling the return link logic on the EN pages.

3. **Configure GTM Tag**
   In **Google Tag Manager**, create or edit a Custom HTML tag with the configured `landing-page-gtm-tag.js` script. Set the tag to fire on the appropriate pages (e.g., the site's homepage or site-wide) and on the correct dates.

4. **Publish / Testing GTM Changes**
   After configuring the tag, publish the updated GTM container so that the changes are saved and ready. Before pushing the GTM container live, you can preview the homepage takeover using **GTM's Preview Mode**. This lets you test the functionality on the real site without affecting all visitors. For example: ```https://yourwebsite.org?simulate-date=06-30``` Using this URL (with GTM Preview enabled for that container version) will simulate the redirect as if it were June 30. You should see the homepage redirect to the specified EN page and the message bar appear, just as it would during a live campaign.

5. **Verify Deployment**
   Once the container is pushed live, test the functionality on the live site around the specified date to ensure the redirect and return bar work as expected.

---

## Demo Pages and Simulating Different Dates

For testing purposes, the landing page script supports a `simulate-date` query parameter. You can append this to the URL to simulate how the redirect behaves on specific dates. This is useful for previewing the takeover logic without waiting for the actual dates. The date format is `MM-DD` (e.g., `12-03` for December 3rd).

Example usage:
* **Simulate 12/03** – *Redirects to configured EN page for that date* - 
  `https://yourwebsite.org?simulate-date=12-03`

* **Simulate 12/20** – *No redirect occurs (date not in redirect list)* - 
  `https://yourwebsite.org?simulate-date=12-20`

* **Simulate 12/30** – *Redirects to configured EN page for that date* - 
  `https://yourwebsite.org?simulate-date=12-30`

---

## Developer Notes

* **URL Parameters Preserved**
  Redirects will include any URL arguments present on the landing page. All query parameters are carried over to the EN donation page.

* **Customizing Text**
  To change the return message bar text, edit the `returnLinkText` configuration variable in `en-code-block.js`. To change redirect dates and URLs, edit the `urlsByDate` object in `landing-page-gtm-tag.js`.

* **Set It and Forget It**
  The script is meant to run during the campaign window and can be safely left in place until you're ready to remove it post-campaign.
