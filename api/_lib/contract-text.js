// The Unda Media Server licence agreement's wording and boxes, in one place
// for the three things built from it: the PDF buyers download
// (tools/contract/make-contract.mjs → public/unda-licence-agreement.pdf), the
// online order page (OrderForm.vue) and the order function (api/order.js).
// Change the wording here, raise VERSION, and rebuild the PDF.
//
// Files under api/ whose names start with "_" are not turned into functions.

export const VERSION = "1.0";
export const DATE = "October 2026";
export const EMAIL = "support@undamedia.com";
// The party to the agreement must be a legal person: UndaMedia is a brand of
// LocalCode Technology, not a registered company or business name.
export const VENDOR = "LocalCode Technology, trading as UndaMedia";
// LocalCode Technology's registered details, printed under our signature
// block once filled in. Left empty, the lines are not printed.
export const VENDOR_ADDRESS = "";
export const VENDOR_REG_NO = "";

export const INTRO =
  `This agreement is between **${VENDOR}**, of Ghana (“we”, “us”), and the ` +
  "organisation named in Part A (“you”). It has three parts: **Part A**, what you " +
  "are buying; **Part B**, the terms; and **Part C**, the signatures.";

export const STEPS = [
  ["1", "**Ask for a price first** at undamedia.com/contact. Our quote gives you the package, the fees and a quote number."],
  ["2", "**Fill in Part A and sign Part C.** On a computer you can type into the boxes in Adobe Acrobat Reader, Preview on a Mac, or a web browser. Save the file when you are done."],
  ["3", `**Email the saved file** to ${EMAIL}.`],
  ["4", "**We check it, sign it and send it back** with your invoice. Your licence file follows once the first invoice is paid."],
];
export const PAPER =
  "On a phone? Fill it in online at undamedia.com/order instead, or use the free Adobe Acrobat Reader app. " +
  "Prefer paper? Print it, fill it in by hand, sign it, and email us a scan.";

export const PACKAGES = [
  { value: "Starter", desc: "5 live streams at the same time, 5 team members" },
  { value: "Professional", desc: "15 live streams at the same time, 15 team members" },
  { value: "Broadcast", desc: "50 live streams at the same time, 50 team members" },
  { value: "Custom", desc: "the limits and tools below" },
];

export const HOSTING = [
  { value: "Self-hosted", desc: "you install and run Unda on your own server" },
  { value: "Managed", desc: "we run the server for you (Part B, section 5)" },
];

// The order page's country list: the ISO 3166 countries and Kosovo, in plain
// English (names from the Unicode CLDR via Intl.DisplayNames, "&" written out
// and "St." spelled Saint). The order function accepts only these.
export const COUNTRIES = [
  "Afghanistan", "Åland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola",
  "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium",
  "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Bouvet Island", "Brazil", "British Indian Ocean Territory", "British Virgin Islands", "Brunei",
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
  "Caribbean Netherlands", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China",
  "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Cook Islands",
  "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Curaçao", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Falkland Islands", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana",
  "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany",
  "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala",
  "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard Island and McDonald Islands",
  "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Isle of Man", "Israel", "Italy", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya",
  "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius",
  "Mayotte", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Caledonia",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea",
  "North Macedonia", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestine",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn Islands", "Poland",
  "Portugal", "Puerto Rico", "Qatar", "Republic of the Congo", "Réunion", "Romania", "Russia",
  "Rwanda", "Saint Barthélemy", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Martin", "Saint Pierre and Miquelon", "Saint Vincent and the Grenadines", "Samoa",
  "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Sint Maarten", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Georgia and South Sandwich Islands", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Svalbard and Jan Mayen", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Türkiye", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
  "United States Minor Outlying Islands", "United States Virgin Islands", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Wallis and Futuna", "Western Sahara", "Yemen",
  "Zambia", "Zimbabwe",
];
// Shown first in the list, above all countries.
export const COMMON_COUNTRIES = ["Ghana"];

// Part A's boxes, by the name each has in the PDF. max is what the order
// function accepts; required applies online (a PDF can't insist).
export const FIELDS = {
  customer_name: { label: "Organisation’s full legal name", max: 150, required: true },
  customer_reg_no: { label: "Registration number, if any", max: 60 },
  customer_country: { label: "Country", max: 60, required: true },
  customer_address: { label: "Registered address", max: 250, required: true, multiline: true },
  contact_name: { label: "Contact person", max: 100, required: true },
  contact_title: { label: "Job title", max: 100 },
  contact_email: { label: "Email (we send notices here)", max: 200, required: true, email: true },
  contact_phone: { label: "Phone", max: 40 },
  billing_email: { label: "Email for invoices, if different", max: 200, email: true },
  custom_streams: { label: "Custom only: live streams at the same time", max: 20 },
  custom_members: { label: "Custom only: team members besides owners", max: 20 },
  custom_tools: { label: "Custom only: tools included", max: 200 },
  domains: { label: "Domain names to lock the licence to (optional), e.g. tv.example.com", max: 250 },
  quote_number: { label: "Quote number", max: 40 },
  start_date: { label: "Start date", max: 40 },
  licence_term: { label: "Licence term, e.g. 12 months", max: 40 },
  licence_fee: { label: "Licence fee", max: 40 },
  currency: { label: "Currency, e.g. GHS or USD", max: 20 },
  billing_period: { label: "Billed, e.g. yearly", max: 40 },
  hosting_fee: { label: "Managed hosting fee (Managed only)", max: 40 },
  payment_days: { label: "Pay invoices within (days; 14 if left blank)", max: 10 },
  special_terms: {
    label: "For example support response times, more than one installation, or a discount",
    max: 800, multiline: true,
  },
};

export const TERMS = [
  ["1", "The software and your licence", [
    ["1.1", "**Unda** means Unda Media Server: its compiled programs, the updates we release and its documentation at undamedia.com. LocalCode Technology owns Unda and all rights in it. Nothing in this agreement transfers that ownership to you."],
    ["1.2", "While this agreement lasts, we give you a licence to install and use Unda for your organisation’s work, including streaming for your own clients and viewers, within the package in Part A. The licence is not exclusive, and you may not transfer it without our written consent."],
    ["1.3", "Your licence file sets your package’s limits: how many streams can be live at the same time, how many team members can sign in besides owners, which tools are switched on, and the end date. The licence puts no limit on viewers."],
    ["1.4", "The licence covers one installation of Unda (one running server), unless Part A says otherwise. Without a licence file, Unda runs in its free evaluation mode, which you may use for testing at any time."],
    ["1.5", "You may not: (a) copy, modify, translate or build other works on Unda, beyond installing and running it; (b) sell, rent, lend or sublicense Unda, or share your licence file with another organisation; (c) reverse engineer, decompile or disassemble Unda, except where the law allows it despite this term; (d) remove or get around Unda’s licence checks or our copyright notices."],
    ["1.6", "You own your content and your data. Unda includes open-source components that stay under their own licences, which this agreement does not change. FFmpeg is not part of Unda; it is installed separately under its own licence."],
  ]],
  ["2", "Term, renewal and the end of a licence", [
    ["2.1", "This agreement starts when both of us have signed it. Your licence runs from the start date in Part A for the licence term in Part A."],
    ["2.2", "Nothing renews by itself. To continue after the term, accept our renewal quote or pay our renewal invoice, and we send you a new licence file. This agreement then continues for the new term."],
    ["2.3", "The dashboard warns 30 days before your licence ends. After the end date there are 14 days of grace in which everything keeps working. After that, new streams can’t start, but streams already live carry on until they stop, so a licence never cuts off a broadcast in the middle."],
    ["2.4", "You can change package during the term. We send you a new licence file, and we agree any change in fees with you in writing first."],
  ]],
  ["3", "Fees and payment", [
    ["3.1", "You pay the fees in Part A. We invoice at the start of each billing period, unless Part A says otherwise."],
    ["3.2", "Pay each invoice within the number of days in Part A, or within 14 days if Part A gives none."],
    ["3.3", "Fees do not include taxes unless Part A says so; you pay the taxes that apply to them. If the law requires you to withhold tax from a payment, you may do so and send us the withholding certificate."],
    ["3.4", "We send your licence file once the first invoice is paid. If a later invoice is still unpaid 30 days after it was due, we may hold back renewals and package changes until it is paid. Unda gives us no way to switch off a server you run yourself, and we never try to."],
    ["3.5", "Fees paid are not refundable, except where this agreement or the law says otherwise. You can try Unda free in evaluation mode before you buy."],
  ]],
  ["4", "Updates and support", [
    ["4.1", "While your licence is valid you may install every new version of Unda we release. The dashboard tells administrators when a new version is available."],
    ["4.2", `We give support by email at ${EMAIL}. Part A may add response times or other support.`],
    ["4.3", "If Unda does not work as its documentation describes and you show us the problem, we will, within a reasonable time, fix it, give you a way around it, or give you a version that works."],
    ["4.4", "We can sign in to your server only when its owner gives us support access from the License page. That access lasts at most 14 days, ends by itself at the time the owner chose, can be removed at any time, and everything we do appears in your audit log. Unda gives us no other way into your server."],
  ]],
  ["5", "Managed hosting (only if you chose Managed in Part A)", [
    ["5.1", "We run the server on your behalf: we set it up, install updates, look after its security and certificates, and keep backups. The server’s capacity (upload, storage and processing) is as described in our quote."],
    ["5.2", "Our account is the server’s owner. We invite your administrators, and you manage your team, channels and streams from the dashboard."],
    ["5.3", "We access your data only to run, maintain and support the server. We don’t use it for anything else or share it, except where the law requires."],
    ["5.4", "When this agreement ends, if you ask within 30 days, we will give you a copy of your recordings, media files and server data, and then delete them. After those 30 days we may delete them."],
  ]],
  ["6", "Your content and your responsibilities", [
    ["6.1", "You decide what is streamed, recorded and distributed with Unda, and you are responsible for it. You must hold the rights to your content and any broadcasting licence or permit it needs, for example from your country’s broadcasting regulator."],
    ["6.2", "We don’t see or review your streams. If anyone makes a claim against us because of your content, you will pay our reasonable costs of dealing with it and any amount we have to pay because of it."],
    ["6.3", "If you run Unda yourself, you are responsible for your server, its network and security, keeping Unda and FFmpeg up to date, your team’s accounts, and backups of your data."],
    ["6.4", "Unda keeps statistics about your viewers on your server. You decide what is collected and how long it is kept, and you are responsible for it towards your viewers and under data protection law."],
    ["6.5", "Keep your licence file, stream keys, API keys and passwords confidential."],
  ]],
  ["7", "Privacy", [
    ["7.1", "If you run Unda yourself, your streams, recordings, viewers and accounts stay on your server and never pass through us. The licence is checked on your server: there is no activation call and no usage reporting. Twice a day Unda asks GitHub, where our releases are published, whether a newer version exists; you can switch this off."],
    ["7.2", "Our privacy policy at undamedia.com/privacy explains what we keep about you as a customer and how to ask us to change or delete it."],
  ]],
  ["8", "Confidentiality", [
    ["8.1", "Each of us will keep confidential what the other shares in connection with this agreement that is marked confidential or obviously so (such as prices, licence files, server access details and business plans), use it only for this agreement, and protect it as it protects its own. This does not cover information that is public through no fault of the receiver, or that the law requires to be disclosed. This duty lasts until three years after the agreement ends."],
  ]],
  ["9", "Promises and liability", [
    ["9.1", "Each of us confirms that it has the right to enter into this agreement."],
    ["9.2", "Apart from section 4.3, and as far as the law allows, Unda is provided as it is, with no other promise, including any promise that it is free of faults or suits a particular purpose. You can test it free before buying."],
    ["9.3", "Neither of us is liable to the other for loss of profit, revenue, audience, data or goodwill, or for any indirect or consequential loss."],
    ["9.4", "Each of us is liable to the other under this agreement for no more, in total, than the fees you paid in the 12 months before the event that caused the claim."],
    ["9.5", "Sections 9.3 and 9.4 do not limit your duties under sections 1.5 and 6.2, fees you owe, or any liability the law does not allow to be limited."],
  ]],
  ["10", "Ending the agreement early", [
    ["10.1", "Either of us may end this agreement by written notice if the other seriously breaks it and does not put it right within 30 days of being told, or if the other becomes insolvent, goes into liquidation or stops trading."],
    ["10.2", "We may end it at once by written notice if you break section 1.5."],
    ["10.3", "If you end it under section 10.1 because of our breach, we refund the fees you paid for the time after it ends."],
    ["10.4", "When this agreement ends, your licence ends as section 2.3 describes, and you may then use Unda only in its evaluation mode. Fees already owed stay due. Sections 1.5, 1.6, 3, 5.4, 6, 8, 9 and 11 continue to apply."],
  ]],
  ["11", "General", [
    ["11.1", "Parts A, B and C are the whole agreement between us about Unda and replace earlier discussions about it. Our quote applies only where Part A refers to it. If they differ, Part A comes first, then Part B, then the quote."],
    ["11.2", "Changes to this agreement must be in writing and signed by both of us. A signed document exchanged by email counts."],
    ["11.3", `Notices go by email: to us at ${EMAIL}, to you at the email in Part A. A notice counts as received on the next working day after it is sent.`],
    ["11.4", "We may transfer this agreement to a company that takes over Unda; we will tell you if we do."],
    ["11.5", "Neither of us is liable for a delay or failure caused by events outside its reasonable control, such as power cuts, outages of networks or services it doesn’t run, natural disasters or government action. This does not excuse payment."],
    ["11.6", "If a part of this agreement is found invalid, the rest still applies."],
    ["11.7", "The laws of the Republic of Ghana govern this agreement. If we have a dispute, we will first try to settle it in good faith for 30 days; after that, the courts of Ghana have jurisdiction."],
    ["11.8", "This agreement may be signed electronically, including by typing a name in Part C, and signed copies may be exchanged by email. Each signed copy counts as an original."],
  ]],
];

export const SIGN_INTRO =
  "By signing, each of us confirms that it has read and agrees to Parts A, B and C, " +
  "and that the person signing is allowed to sign for their organisation.";

// md splits **bold** spans into parts: [{ t, bold }].
export function md(text) {
  return text.split("**").map((t, i) => ({ t, bold: i % 2 === 1 })).filter((p) => p.t !== "");
}
