import { CONTACT_EMAIL } from "@/constants/socials";

const email = `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`;

export const privacyPolicyContent = {
  effective: "2026-10-28",
  htmlString: `
  <p>Happenings of Africa is operated by FOLA PR Ltd, Lagos, Nigeria. This policy explains what personal data we collect through happeningsofafrica.com, why, and the choices you have.</p>

  <h2 id="who-this-covers">1. Who this covers</h2>
  <p>This policy applies to visitors to the site and to anyone who submits a happening for listing. If you submit on behalf of an organiser, you confirm that you are authorised to share the organiser's and any contact person's details with us.</p>

  <h2 id="what-we-collect">2. What we collect</h2>
  <p>From visitors: the technical information your browser sends when you load a page, including IP address, browser and device type, pages visited and the time of your visit. We use this to keep the site running, secure and fast.</p>
  <p>From people who submit a happening:</p>
  <ul>
    <li>Your name, email address, phone or WhatsApp number, organisation, role and relationship to the event</li>
    <li>The organiser's name, website, Instagram handle and contact email</li>
    <li>Event details, including the venue and full address</li>
    <li>For private and invitation-only events, your choice of how much of the listing appears publicly</li>
  </ul>
  <p>We do not ask for, and ask you not to send, payment details, government ID numbers or any sensitive personal data.</p>

  <h2 id="why-we-use-it">3. Why we use it</h2>
  <ul>
    <li>To review and verify a submitted happening, using your contact details, the organiser's details and the venue address. Basis: performance of a contract (your request to list) and our legitimate interest in keeping the calendar accurate.</li>
    <li>To contact you about your submission. Basis: performance of a contract.</li>
    <li>To publish the listing, including any contact information you chose to display. Basis: your consent, given when you submit and choose what to show.</li>
    <li>To run, secure and improve the site, using technical and usage data. Basis: legitimate interest.</li>
    <li>To meet legal obligations. Basis: legal obligation.</li>
  </ul>
  <p>We do not sell personal data and do not use it for advertising.</p>

  <h2 id="what-appears-publicly">4. What appears publicly</h2>
  <p>Your own contact details never appear on the calendar unless you choose to display them as the public contact for an event. The organiser contact email and full venue address are used for verification only and are not shown. For private and invitation-only events, only the listing level you selected appears: full listing, limited listing or held date.</p>

  <h2 id="who-we-share-it-with">5. Who we share it with</h2>
  <ul>
    <li>Service providers that host the site, store submissions and send email on our behalf. They act on our instructions.</li>
    <li>Other companies in the FOLA group, for the purposes above.</li>
    <li>Authorities or professional advisers, where the law requires it or to protect our rights.</li>
  </ul>
  <p>Some providers store data outside Nigeria. Where they do, we rely on their contractual commitments to protect it to a standard equivalent to the Nigeria Data Protection Act, and on standard contractual clauses for UK and EU data.</p>

  <h2 id="how-long-we-keep-it">6. How long we keep it</h2>
  <ul>
    <li>Published listing and organiser details: for as long as the listing is live, then 12 months in the archive</li>
    <li>Submitter contact details: 12 months after the event date, then deleted</li>
    <li>Declined submissions: 90 days, then deleted</li>
    <li>Technical logs: up to 12 months</li>
  </ul>

  <h2 id="your-rights">7. Your rights</h2>
  <p>Under the Nigeria Data Protection Act 2023, and the UK and EU GDPR where they apply, you can ask us to tell you what personal data we hold about you and give you a copy; correct it; delete it; restrict or object to how we use it; withdraw consent for anything based on consent, such as a published contact email; or provide it in a portable format.</p>
  <p>Email ${email} and we will respond within 30 days. You can also complain to the Nigeria Data Protection Commission (<a href="https://ndpc.gov.ng">ndpc.gov.ng</a>) or, for UK and EU residents, to your local supervisory authority.</p>

  <h2 id="cookies">8. Cookies</h2>
  <p>The site uses only the strictly necessary cookies it needs to work. We will update this policy before adding any analytics or marketing cookies.</p>

  <h2 id="security">9. Security</h2>
  <p>Submissions are sent over an encrypted connection and stored with access limited to the Happenings team. No system is perfectly secure; if you believe your data has been compromised, email us immediately.</p>

  <h2 id="children">10. Children</h2>
  <p>The site is not directed at anyone under 18, and we do not knowingly collect personal data from children.</p>

  <h2 id="changes-and-contact">11. Changes and contact</h2>
  <p>We will post any changes here with a new effective date. Questions and requests: ${email}, or FOLA PR Ltd, Lagos, Nigeria.</p>
  `,
};
