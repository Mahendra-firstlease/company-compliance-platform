import { Service } from "@/types";

export const services: Service[] = [
  {
    id: "svc-pan-services",
    slug: "pan-card-services",
    title: "PAN Card Services",
    shortDescription:
      "Apply for a new PAN card, correction, or reprint through NSDL (Protean eGov) / UTIITSL.",
    description:
      "PAN (Permanent Account Number) is a 10-character alphanumeric identifier issued by the Income Tax Department of India through its authorised agencies, Protean eGov (formerly NSDL) and UTIITSL. It is required for filing income tax returns, opening bank accounts, and most financial transactions above prescribed thresholds. We handle new PAN applications (Form 49A for residents, Form 49AA for foreign applicants), corrections, and reprints on your behalf, so you avoid errors that commonly cause rejection.",
    image: "/images/services/pan-card-services.jpg",
    price: 500,
    originalPrice: 699,
    governmentFee: 107,
    professionalFee: 393,
    duration: "7-15 working days (Instant e-PAN via Aadhaar: same day)",
    featured: true,
    popular: true,
    details: {
      benefits: [
        "Mandatory identity proof for all financial and tax transactions in India",
        "Required to open a bank account, get a loan, or invest in mutual funds/stocks",
        "Prevents higher TDS deduction that applies to transactions without a PAN",
        "Instant e-PAN option available in minutes if you already have a linked Aadhaar",
        "One-time document; no renewal required for lifetime validity",
      ],
      eligibility: [
        "Indian citizens, NRIs, foreign nationals, and all types of entities (company, LLP, trust, etc.) may apply",
        "Aadhaar is mandatory for new individual applications",
        "Minors can apply through a parent or guardian",
        "An applicant, and each entity, may hold only one PAN — holding multiple PANs is an offence",
      ],
      requiredDocuments: [
        "Aadhaar card (serves as identity, address, and date-of-birth proof)",
        "Passport-size photograph",
        "PAN allotment letter or existing PAN copy (for correction/reprint requests)",
        "Certificate of Incorporation / Partnership Deed (for company, LLP, or firm applicants)",
        "Passport and OCI/PIO card (for foreign nationals and NRIs)",
      ],
      faqs: [
        {
          question: "How much does it cost to apply for a PAN card?",
          answer:
            "The government processing fee is about ₹107 for a physical PAN card delivered within India. Charges are higher for delivery outside India or for paperless/e-PAN-only options.",
        },
        {
          question: "Can I get an e-PAN for free?",
          answer:
            "Yes, if you apply through the Income Tax Department's e-filing portal using Aadhaar-based instant e-PAN, there is no government charge and you receive it as a PDF by email.",
        },
        {
          question: "How long does it take to receive a physical PAN card?",
          answer:
            "Typically 15-30 days for physical dispatch after successful verification; instant e-PAN through Aadhaar can be issued within minutes.",
        },
        {
          question: "What happens if I already have two PAN cards?",
          answer:
            "Holding more than one PAN is illegal and attracts a penalty; you should surrender the duplicate to the Income Tax Department immediately.",
        },
      ],
    },
  },
  {
    id: "svc-income-tax-efiling",
    slug: "income-tax-e-filing",
    title: "Income Tax E-Filing (ITR)",
    shortDescription:
      "File your Income Tax Return (ITR-1 to ITR-7) on the official Income Tax e-Filing portal.",
    description:
      "The Income Tax Department's e-Filing portal (incometax.gov.in) is the official platform for submitting Income Tax Returns, paying self-assessment tax, and tracking refunds. Our team prepares and files your return end-to-end — matching Form 26AS/AIS data, selecting the correct ITR form, computing tax liability under the old or new regime, and e-verifying the submission — so you file correctly and avoid notices.",
    image: "/images/services/income-tax-e-filing.jpg",
    price: 2000,
    originalPrice: 2999,
    governmentFee: 0,
    professionalFee: 2000,
    duration: "3-7 working days",
    featured: true,
    popular: true,
    details: {
      benefits: [
        "Filing is free of government charge on the official portal — you only pay for professional preparation",
        "Ensures accurate tax computation and comparison between old and new tax regimes",
        "Helps claim eligible deductions, exemptions, and refunds correctly",
        "Reduces risk of scrutiny notices caused by mismatched income or TDS data",
        "E-verification and acknowledgment handled for you",
      ],
      eligibility: [
        "Any individual, HUF, firm, or company with taxable income or required to file under law",
        "Individuals seeking to claim a tax refund even if income is below the taxable limit",
        "Applicable ITR form (1 through 7) depends on income sources and entity type",
      ],
      requiredDocuments: [
        "PAN and Aadhaar",
        "Form 16 (for salaried individuals) or business/profession income details",
        "Form 26AS / AIS / TIS statements",
        "Bank account statements and pre-validated bank account for refund",
        "Investment proofs and deduction documents (80C, 80D, home loan interest, etc.)",
        "Capital gains statements, if applicable",
      ],
      faqs: [
        {
          question: "Is there a government fee to file an ITR?",
          answer:
            "No, filing your return on the official e-filing portal is free. Any amount you pay covers professional assistance, not a government charge.",
        },
        {
          question: "What is the due date for filing ITR?",
          answer:
            "The standard due date for most individual taxpayers is 31 July of the assessment year, though this can be extended by the department in some years — always confirm the current year's deadline.",
        },
        {
          question: "Can I revise my return after filing?",
          answer:
            "Yes, a revised return can be filed before the end of the relevant assessment year. Filing a revised return after 31 December may attract an additional fee under Section 234F depending on your income level.",
        },
        {
          question: "What if I miss the ITR deadline?",
          answer:
            "You can still file a belated return before the year-end deadline, subject to a late fee, or use the ITR-U facility to file updated returns for past years within the permitted window.",
        },
      ],
    },
  },
  {
    id: "svc-traces-tds",
    slug: "traces-tds-portal",
    title: "TRACES TDS Portal Services",
    shortDescription:
      "Registration, Form 26AS/16/16A downloads, and TDS reconciliation support on TRACES.",
    description:
      "TRACES (TDS Reconciliation Analysis and Correction Enabling System) is the Income Tax Department's portal for managing Tax Deducted at Source (TDS) and Tax Collected at Source (TCS). We help you register as a taxpayer or deductor, download Form 26AS, Form 16/16A/16B, reconcile TDS credit mismatches, and file correction statements — all at no government cost.",
    image: "/images/services/traces-tds-portal.jpg",
    price: 0,
    originalPrice: undefined,
    governmentFee: 0,
    professionalFee: 0,
    duration: "Same day (instant online access after registration)",
    featured: false,
    popular: false,
    details: {
      benefits: [
        "Registration and all standard TRACES services are completely free of government charge",
        "View and download Form 26AS, Form 16, Form 16A, and Form 16B",
        "Reconcile TDS credited by employers, banks, or property buyers against your records",
        "Deductors can file correction statements and generate justification reports",
        "Available 24x7 online, no physical visit required",
      ],
      eligibility: [
        "Taxpayers wanting to view/verify their TDS credit",
        "Deductors (employers, banks, businesses) holding a valid TAN",
        "Pay and Accounts Offices (PAO) managing government disbursements",
      ],
      requiredDocuments: [
        "PAN (for taxpayer registration)",
        "TAN (for deductor registration)",
        "Date of birth/incorporation and registered mobile/email for OTP verification",
        "Challan/statement details for reconciliation requests",
      ],
      faqs: [
        {
          question: "Does TRACES charge any registration fee?",
          answer:
            "No. TRACES never charges a fee for registration or for standard electronic services such as viewing or downloading TDS certificates.",
        },
        {
          question: "What is Form 26AS used for?",
          answer:
            "Form 26AS is a consolidated tax credit statement showing TDS, TCS, advance tax, and self-assessment tax linked to your PAN — it's used to verify your tax credits before filing an ITR.",
        },
        {
          question: "Who can register as a deductor on TRACES?",
          answer:
            "Any entity holding a TAN that deducts tax at source, such as employers or businesses making specified payments, can register as a deductor to file and correct TDS/TCS statements.",
        },
      ],
    },
  },
  {
    id: "svc-gst-registration",
    slug: "gst-registration",
    title: "GST Registration",
    shortDescription:
      "Register for GST and obtain your GSTIN on the official GST Portal.",
    description:
      "GST registration is done through the official GST Portal (gst.gov.in) under Section 25 of the CGST Act. The Central Board of Indirect Taxes & Customs does not charge any government fee for new registration — the cost you pay covers document preparation, application filing, and follow-up with GST officers. We assist proprietors, partnerships, LLPs, and companies with GSTIN registration and post-registration compliance setup.",
    image: "/images/services/gst-registration.jpg",
    price: 3000,
    originalPrice: 4000,
    governmentFee: 0,
    professionalFee: 3000,
    duration:
      "3-7 working days (up to 30 days if physical verification is triggered)",
    featured: true,
    popular: true,
    details: {
      benefits: [
        "No government fee for registration on the official GST Portal",
        "Enables legal collection of GST and issuance of tax invoices",
        "Allows claiming Input Tax Credit (ITC) on eligible purchases",
        "Mandatory for e-commerce sellers and businesses crossing the turnover threshold",
        "Builds credibility with vendors, banks, and B2B customers",
      ],
      eligibility: [
        "Businesses with aggregate turnover exceeding the prescribed threshold (varies by state and goods/services)",
        "E-commerce sellers and operators, regardless of turnover",
        "Businesses making inter-state taxable supplies",
        "Voluntary registration is available even below the threshold",
      ],
      requiredDocuments: [
        "PAN of the business or proprietor",
        "Aadhaar of proprietor/partners/directors",
        "Proof of business constitution (Partnership Deed, Certificate of Incorporation, etc.)",
        "Proof of principal place of business (electricity bill, rent agreement, or NOC)",
        "Bank account proof (cancelled cheque or statement)",
        "Digital Signature Certificate (mandatory for companies and LLPs)",
      ],
      faqs: [
        {
          question: "Is there a government fee for GST registration?",
          answer:
            "No. GST registration on the official portal carries no government fee. Any professional charges cover documentation and filing assistance.",
        },
        {
          question: "How long does GST registration take?",
          answer:
            "Typically 3-7 working days with successful Aadhaar e-KYC; it can extend up to 30 days if the department triggers physical verification of the premises.",
        },
        {
          question: "Do I need separate GST registration for each state?",
          answer:
            "Yes, a separate GST registration is required for each state or union territory from which you make taxable supplies.",
        },
      ],
    },
  },
  {
    id: "svc-mca-company-llp",
    slug: "mca-company-llp-registration",
    title: "MCA Company / LLP Registration",
    shortDescription:
      "Incorporate a Private Limited Company or LLP through the MCA SPICe+ portal.",
    description:
      "Company and LLP incorporation is processed on the Ministry of Corporate Affairs (MCA) V3 portal via the integrated SPICe+ web form, which bundles name reservation, incorporation, DIN allotment, PAN, TAN, GSTIN, EPFO, and ESIC registration into one filing. We handle name approval, drafting of MoA/AoA, DSC coordination, and end-to-end SPICe+ filing so your company or LLP gets incorporated correctly the first time.",
    image: "/images/services/mca-company-llp-registration.jpg",
    price: 10000,
    originalPrice: 14000,
    governmentFee: 2000,
    professionalFee: 8000,
    duration: "10-15 working days",
    featured: true,
    popular: true,
    details: {
      benefits: [
        "Zero MCA filing fee for companies with authorised capital up to ₹15 lakh",
        "Single integrated SPICe+ form covers incorporation, PAN, TAN, and statutory registrations",
        "Grants your business a distinct legal identity with limited liability",
        "Improves credibility with banks, investors, and government tenders",
        "Includes Certificate of Incorporation, PAN, and TAN typically within 7-10 working days of a clean filing",
      ],
      eligibility: [
        "Minimum 2 directors/shareholders for a Private Limited Company (1 for OPC), minimum 2 partners for an LLP",
        "At least one director must be a resident of India",
        "Proposed name must be unique and comply with MCA naming guidelines",
        "Registered office address in India required at the time of incorporation",
      ],
      requiredDocuments: [
        "PAN and Aadhaar of all directors/partners",
        "Passport-size photographs",
        "Proof of registered office (utility bill and NOC from owner, or rent agreement)",
        "Digital Signature Certificate (DSC) for all directors/partners",
        "Director Identification Number (DIN) details, or application for a new DIN",
        "Draft MoA and AoA (for companies) or LLP Agreement (for LLPs)",
      ],
      faqs: [
        {
          question: "What is the government fee for company incorporation?",
          answer:
            "MCA charges no incorporation fee for companies with authorised capital up to ₹15 lakh under SPICe+. Costs you will still incur include ₹1,000 for name reservation, state stamp duty, and DSC charges.",
        },
        {
          question: "How is stamp duty calculated?",
          answer:
            "Stamp duty on the MoA and AoA varies by state and authorised capital — for example, MoA stamp duty is often around ₹200 and AoA duty ranges from ₹300-₹600 in many states, though this differs by jurisdiction.",
        },
        {
          question: "Do I get GST and EPFO/ESIC registration automatically?",
          answer:
            "SPICe+ lets you opt in to GSTIN, EPFO, and ESIC registration as part of the same incorporation filing, so these are set up alongside your Certificate of Incorporation.",
        },
      ],
    },
  },
  {
    id: "svc-trademark-ip-india",
    slug: "trademark-registration",
    title: "Trademark Registration (IP India)",
    shortDescription:
      "Register your brand name, logo, or slogan on the IP India Trademark e-Filing Portal.",
    description:
      "Trademark registration is filed on Form TM-A through the IP India Trademark e-Filing Portal (ipindiaonline.gov.in), under the Trade Marks Rules, 2017. Government fees are prescribed per class and vary by applicant type, with a concession for individuals, DPIIT-recognised startups, and Udyam-registered MSMEs. We conduct a trademark search, prepare and file your application, and track it through examination and publication.",
    image: "/images/services/trademark-registration.jpg",
    price: 7500,
    originalPrice: 9999,
    governmentFee: 4500,
    professionalFee: 3000,
    duration:
      "12-18 months to registration certificate (TM can be used immediately after filing)",
    featured: false,
    popular: true,
    details: {
      benefits: [
        "Grants exclusive legal rights to use your brand name/logo under the Trade Marks Act, 1999",
        "50% government fee concession for individuals, DPIIT startups, and Udyam-registered MSMEs",
        "Lets you use the ™ symbol immediately after filing, and ® after registration",
        "Protects your brand against infringement and unauthorised use",
        "Registration is valid for 10 years and renewable indefinitely",
      ],
      eligibility: [
        "Any individual, startup, MSME, partnership, LLP, or company can apply",
        "The mark must be distinctive and not identical/deceptively similar to an existing registered mark",
        "MSME/startup concession requires a valid Udyam certificate or DPIIT recognition certificate at filing",
      ],
      requiredDocuments: [
        "Applicant's PAN and identity/address proof",
        "Logo or wordmark to be registered (in the required image format, if applicable)",
        "Udyam Registration Certificate or DPIIT Startup recognition (to claim the fee concession)",
        "Business registration proof (Certificate of Incorporation, Partnership Deed, etc.)",
        "Power of Attorney (Form TM-48) authorising the filing agent",
      ],
      faqs: [
        {
          question: "What is the government fee for trademark registration?",
          answer:
            "The government e-filing fee is ₹4,500 per class for individuals, DPIIT-recognised startups, and Udyam-registered MSMEs, and ₹9,000 per class for companies, LLPs, and other entities.",
        },
        {
          question: "Is the fee per application or per class?",
          answer:
            "The fee is charged per class, per mark — filing in three classes costs three times the per-class rate.",
        },
        {
          question:
            "Is the government fee refundable if my application is rejected?",
          answer:
            "No, government trademark fees are non-refundable once paid to the Registry, regardless of the application outcome.",
        },
        {
          question: "How long is a registered trademark valid?",
          answer:
            "A trademark registration is valid for 10 years from the filing date and can be renewed indefinitely for further 10-year periods on payment of the renewal fee.",
        },
      ],
    },
  },
  {
    id: "svc-iso-certification",
    slug: "iso-certification-advisory",
    title: "ISO Certification Advisory",
    shortDescription:
      "Guidance on ISO 9001, 14001, 27001, and other standards through NABCB-accredited certification bodies.",
    description:
      "ISO certification is issued by independent, accredited certification bodies rather than by a government department directly. In India, the National Accreditation Board for Certification Bodies (NABCB), a constituent board of the Quality Council of India, accredits the certification bodies that audit and certify organisations against ISO standards. We advise you on selecting an appropriate NABCB or IAF-accredited certifying body, prepare your documentation, and guide you through gap analysis and the Stage 1/Stage 2 audit process.",
    image: "/images/services/iso-certification-advisory.jpg",
    price: 2500,
    originalPrice: 3500,
    governmentFee: 0,
    professionalFee: 2500,
    duration:
      "3-6 months for full certification (varies by standard and organisation size)",
    featured: false,
    popular: false,
    details: {
      benefits: [
        "NABCB-accredited certificates are recognised internationally and accepted for government tenders and GeM registration",
        "Improves process quality, customer trust, and operational efficiency",
        "MSMEs may be eligible for central/state subsidy schemes that offset certification costs",
        "Helps qualify for larger B2B and export contracts that require ISO compliance",
        "Covers common standards: ISO 9001 (Quality), ISO 14001 (Environment), ISO 27001 (Information Security), ISO 45001 (Occupational Safety)",
      ],
      eligibility: [
        "Any business, regardless of size or sector, can pursue ISO certification",
        "MSMEs registered on the Udyam portal may qualify for government subsidy schemes toward certification costs",
        "Organisation must be able to demonstrate a working management system aligned to the chosen standard",
      ],
      requiredDocuments: [
        "Business registration proof (Udyam/GST/Incorporation certificate)",
        "Process/quality manual and standard operating procedures",
        "Organisational chart and site details for audit scheduling",
        "Existing compliance certificates, if any (for renewal or upgrade)",
      ],
      faqs: [
        {
          question: "Does the government charge a fee for ISO certification?",
          answer:
            "No — NABCB, the government-linked accreditation body, does not charge applicants directly. Certification fees are paid to the accredited certification body that conducts your audit, and typically range from about ₹15,000 for a small single-standard certification to several lakh rupees for larger or more complex standards like ISO 27001.",
        },
        {
          question:
            "What is the difference between NABCB and a certification body?",
          answer:
            "NABCB accredits and oversees certification bodies to ensure they meet international standards; the certification body itself is the organisation that audits your company and issues the ISO certificate.",
        },
        {
          question: "How long does ISO certification take?",
          answer:
            "For a mid-sized organisation with no existing management system, the process commonly takes 3-6 months from gap analysis through the Stage 2 audit and certificate issuance.",
        },
      ],
    },
  },
  {
    id: "svc-msme-udyam",
    slug: "msme-udyam-registration",
    title: "MSME / Udyam Registration",
    shortDescription:
      "Register your business as a Micro, Small, or Medium Enterprise on the Udyam Registration portal.",
    description:
      "Udyam Registration (udyamregistration.gov.in) is the Ministry of MSME's official, single-page, self-declaration portal for registering Micro, Small, and Medium Enterprises. It is completely free on the government portal and requires no document uploads — verification happens against PAN, GSTIN, and Aadhaar records. We help you classify your enterprise correctly and complete the registration to unlock MSME benefits.",
    image: "/images/services/msme-udyam-registration.jpg",
    price: 1500,
    originalPrice: 2000,
    governmentFee: 0,
    professionalFee: 1500,
    duration: "Same day to 2 working days (instant certificate generation)",
    featured: true,
    popular: true,
    details: {
      benefits: [
        "Zero government fee — registration is completely free on the official portal",
        "Access to collateral-free loans under Credit Guarantee schemes (CGTMSE)",
        "Protection against delayed payments under the MSME Development Act",
        "Priority sector lending and lower interest rates from banks",
        "Fee concessions on trademark and patent applications",
        "Eligibility for government tenders and GeM procurement preference",
      ],
      eligibility: [
        "Micro enterprises: investment up to ₹1 crore and turnover up to ₹5 crore",
        "Small enterprises: investment up to ₹10 crore and turnover up to ₹50 crore",
        "Medium enterprises: investment up to ₹50 crore and turnover up to ₹250 crore",
        "Aadhaar of the proprietor/partner/director is mandatory",
      ],
      requiredDocuments: [
        "Aadhaar card of the proprietor, managing partner, or karta",
        "PAN card of the business/individual",
        "GSTIN (where applicable)",
        "Business bank account details",
        "Basic business activity details (NIC code)",
      ],
      faqs: [
        {
          question: "Is Udyam Registration really free?",
          answer:
            "Yes. The Ministry of MSME charges no government fee for Udyam Registration. Any amount paid to a service provider is for assistance and filing convenience only.",
        },
        {
          question: "Do I need to upload documents?",
          answer:
            "No. Udyam Registration is a self-declaration-based process; identity and business details are verified electronically against PAN, GSTIN, and Aadhaar records.",
        },
        {
          question: "Is MSME registration mandatory?",
          answer:
            "No, it is not legally mandatory, but unregistered businesses miss out on MSME-specific government benefits, subsidies, and payment protections.",
        },
      ],
    },
  },
  {
    id: "svc-epfo-pf",
    slug: "epfo-pf-registration",
    title: "EPFO PF Registration",
    shortDescription:
      "Register your establishment with the Employees' Provident Fund Organisation.",
    description:
      "EPFO registration is mandatory for establishments with 20 or more employees under the EPF & MP Act, 1952, and is processed free of charge through the Shram Suvidha portal (or automatically via MCA SPICe+ for new companies). We manage the registration, UAN generation for employees, and ongoing monthly ECR filing compliance.",
    image: "/images/services/epfo-pf-registration.jpg",
    price: 3000,
    originalPrice: 4000,
    governmentFee: 0,
    professionalFee: 3000,
    duration: "5-10 working days",
    featured: false,
    popular: false,
    details: {
      benefits: [
        "No government registration fee — the process is free on the Shram Suvidha portal",
        "Provides employees with retirement savings, pension, and insurance benefits",
        "Automatically allotted for new companies incorporated via MCA SPICe+",
        "Demonstrates compliance maturity to investors and enterprise clients",
        "Enables employees to build a Universal Account Number (UAN) with portable PF balance",
      ],
      eligibility: [
        "Mandatory for establishments with 20 or more employees",
        "Voluntary registration permitted for establishments with fewer than 20 employees",
        "Applies to factories, companies, LLPs, partnerships, and other registered entities employing staff",
      ],
      requiredDocuments: [
        "Certificate of Incorporation / Registration of the establishment",
        "PAN of the establishment",
        "Address proof of the registered office",
        "Digital Signature Certificate of the authorised signatory",
        "List of employees with salary and joining details",
        "Bank account details of the establishment",
      ],
      faqs: [
        {
          question: "Is there a fee to register with EPFO?",
          answer:
            "No. Registration on the Shram Suvidha portal is completely free; the only incidental cost is procuring a Digital Signature Certificate.",
        },
        {
          question: "When does PF registration become mandatory?",
          answer:
            "It becomes mandatory once an establishment's employee count reaches 20; the obligation continues even if headcount later falls below that threshold.",
        },
        {
          question:
            "What are the ongoing compliance requirements after registration?",
          answer:
            "Employers must file the Electronic Challan cum Return (ECR) by the 15th of every month and generate a UAN for each new employee within 25 days of joining.",
        },
      ],
    },
  },
  {
    id: "svc-esic",
    slug: "esic-registration",
    title: "ESIC Registration",
    shortDescription:
      "Register your establishment with the Employees' State Insurance Corporation.",
    description:
      "ESIC registration provides employees earning up to the notified wage ceiling with medical, sickness, and maternity benefits. Registration is mandatory for eligible establishments in ESIC-notified areas and is processed free of government charge through the Shram Suvidha portal. We handle end-to-end registration and monthly contribution filing setup.",
    image: "/images/services/esic-registration.jpg",
    price: 3000,
    originalPrice: 4000,
    governmentFee: 0,
    professionalFee: 3000,
    duration: "5-10 working days",
    featured: false,
    popular: false,
    details: {
      benefits: [
        "No government registration fee",
        "Provides employees with medical care, sickness benefit, and maternity coverage",
        "Covers employees at any ESIC-empanelled hospital or dispensary, including for remote employees",
        "Reduces employer liability for workplace injury compensation through the ESI scheme",
        "Auto-registration available for new companies via MCA SPICe+",
      ],
      eligibility: [
        "Mandatory for factories/establishments with 10 or more employees in ESIC-notified areas (20+ in some states)",
        "Applies to employees earning gross wages up to the notified ceiling (₹21,000/month; ₹25,000 for persons with disability)",
        "Applicable only in areas notified by ESIC",
      ],
      requiredDocuments: [
        "Certificate of Incorporation / Registration of the establishment",
        "PAN of the establishment",
        "Address proof of the business premises",
        "List of employees with wage details",
        "Bank account details",
        "Digital Signature Certificate of the authorised signatory",
      ],
      faqs: [
        {
          question: "Is ESIC registration free?",
          answer:
            "Yes, there is no government fee for ESIC employer registration; it is processed at no cost through the Shram Suvidha portal.",
        },
        {
          question: "Who is covered under ESIC?",
          answer:
            "Employees earning up to the notified wage ceiling working at establishments in ESIC-notified areas are covered, receiving medical, sickness, and maternity benefits.",
        },
        {
          question: "What are the contribution rates?",
          answer:
            "As of the current rates, the employer contributes 3.25% and the employee contributes 0.75% of wages, for a combined contribution of about 4%.",
        },
      ],
    },
  },
  {
    id: "svc-shops-establishment",
    slug: "shops-establishment-registration",
    title: "Shops & Establishment / Labour Registration",
    shortDescription:
      "Register your business under the state Shops & Establishment Act via the Shram Suvidha portal.",
    description:
      "Shops & Establishment registration (often called a 'Gumasta' license in some states) is a state-level requirement for commercial establishments, administered through state labour department portals and linked to the central Shram Suvidha Portal for Labour Identification Number (LIN) allotment. Fees, forms, and portals differ by state — we identify the correct state process and handle end-to-end filing and renewal tracking.",
    image: "/images/services/shops-establishment-registration.jpg",
    price: 5000,
    originalPrice: 6500,
    governmentFee: 1000,
    professionalFee: 4000,
    duration: "7-15 working days (varies by state)",
    featured: false,
    popular: false,
    details: {
      benefits: [
        "Legal recognition to operate a commercial establishment in your state",
        "Required for opening a current bank account in the business's name in many states",
        "Grants a Labour Identification Number (LIN) linking all your labour-law registrations",
        "Helps establish eligibility for local trade licenses and other approvals",
        "Demonstrates compliance with working hours, wages, and employee welfare regulations",
      ],
      eligibility: [
        "Applicable to shops, commercial establishments, and businesses employing workers",
        "Required within the timeframe specified by the respective state's Shops & Establishment Act",
        "Applies regardless of business size, though renewal cycles and fees vary by state",
      ],
      requiredDocuments: [
        "PAN and address proof of the establishment",
        "Proof of business premises (rent agreement or ownership document)",
        "Identity proof of the proprietor/partners/directors",
        "Details of employees, if any",
        "Passport-size photograph of the proprietor/authorised signatory",
      ],
      faqs: [
        {
          question: "Is the fee the same in every state?",
          answer:
            "No. Each state administers its own Shops & Establishment Act with its own portal (e.g., Aaple Sarkar in Maharashtra, eKarmika in Karnataka) and its own fee structure, so charges vary by location.",
        },
        {
          question: "Do I need to renew this registration?",
          answer:
            "Most states require periodic renewal, typically every 1-5 years, though a few states now offer longer or lifetime validity — check your specific state's rules.",
        },
        {
          question: "Is this the same as GST or Udyam registration?",
          answer:
            "No, Shops & Establishment registration is a separate state labour-law requirement and does not substitute for GST or MSME/Udyam registration.",
        },
      ],
    },
  },
  {
    id: "svc-iec-dgft",
    slug: "import-export-code",
    title: "Import Export Code (IEC)",
    shortDescription:
      "Obtain your Import Export Code from the DGFT for international trade.",
    description:
      "The Import Export Code (IEC) is a 10-digit code issued by the Directorate General of Foreign Trade (DGFT), mandatory for anyone importing or exporting goods or services from India. Since the code is now the same as your PAN, the DGFT charges a flat, one-time government fee for registration via Form ANF-2A. We handle document preparation, e-sign coordination, and DGFT portal filing.",
    image: "/images/services/import-export-code.jpg",
    price: 2000,
    originalPrice: 2999,
    governmentFee: 500,
    professionalFee: 1500,
    duration: "1-3 working days",
    featured: false,
    popular: true,
    details: {
      benefits: [
        "Mandatory single registration for all import/export activity from India",
        "Valid for the lifetime of the business — no renewal fee, only an annual confirmation",
        "Required for availing export incentive schemes such as RoDTEP",
        "Fast turnaround — typically issued within 1-3 working days",
        "Sole proprietors can apply using personal PAN; no separate legal entity required",
      ],
      eligibility: [
        "Any individual, proprietorship, partnership, LLP, or company engaged in cross-border trade",
        "Valid PAN and bank account in the applicant's/entity's name required",
        "Service exporters (e.g., IT/consulting) may also apply to access trade benefits like RoDTEP",
      ],
      requiredDocuments: [
        "PAN of the applicant/business",
        "Aadhaar (for e-Sign) or Digital Signature Certificate (for companies/LLPs)",
        "Bank account details and a cancelled cheque",
        "Proof of business address",
        "Certificate of Incorporation/Partnership Deed, if applicable",
      ],
      faqs: [
        {
          question: "What is the government fee for IEC registration?",
          answer:
            "The DGFT charges a one-time government fee of ₹500 for a new IEC application, payable online via net banking, card, or UPI.",
        },
        {
          question: "Does the IEC need to be renewed?",
          answer:
            "No, the IEC has lifetime validity, but DGFT requires a mandatory annual update/confirmation between April 1 and June 30 each year; failing to update can lead to deactivation.",
        },
        {
          question: "Is GST registration required before applying for IEC?",
          answer:
            "No, GST registration is not a precondition for IEC issuance, though a GSTIN is later needed for customs clearance since it is cross-checked on shipping documents.",
        },
      ],
    },
  },
  {
    id: "svc-fssai-license",
    slug: "fssai-food-license",
    title: "FSSAI Food License",
    shortDescription:
      "Obtain your FSSAI Basic Registration or State License via the FoSCoS portal.",
    description:
      "The Food Safety and Standards Authority of India (FSSAI) regulates food businesses through the FoSCoS portal (foscos.fssai.gov.in). License category — Basic Registration, State License, or Central License — depends on annual turnover and business type. We identify the correct category for your business, prepare the required food safety documentation, and file your application.",
    image: "/images/services/fssai-food-license.jpg",
    price: 1500,
    originalPrice: 2000,
    governmentFee: 100,
    professionalFee: 1400,
    duration:
      "7-30 days (Basic: as fast as 7 days via Tatkal; State/Central: 30-60 days)",
    featured: false,
    popular: true,
    details: {
      benefits: [
        "Legal requirement to sell, manufacture, store, or distribute food in India",
        "Builds consumer trust through the FSSAI logo and license number on packaging",
        "Basic Registration government fee is only ₹100 per year, among the lowest compliance costs for any business",
        "Newer licenses (post April 2026) carry perpetual validity without repeated annual renewal filings",
        "Mandatory for cloud kitchens and e-commerce food sellers regardless of turnover",
      ],
      eligibility: [
        "Basic Registration: food business operators with annual turnover up to ₹1.5 crore",
        "State License: turnover between ₹1.5 crore and ₹50 crore, operating within one state",
        "Central License: turnover above ₹50 crore, or businesses with import/export/multi-state operations",
        "Cloud kitchens and online food aggregator sellers require a State License regardless of turnover",
      ],
      requiredDocuments: [
        "Identity and address proof of the proprietor/partners/directors",
        "Proof of business premises (rent agreement, utility bill, or NOC)",
        "Food safety management system (FSMS) plan/declaration",
        "List of food products/categories to be manufactured or sold",
        "Passport-size photograph of the applicant",
      ],
      faqs: [
        {
          question: "How much does an FSSAI Basic Registration cost?",
          answer:
            "The government fee for Basic Registration is ₹100 per year, while a State License ranges from about ₹2,000 to ₹5,000 per year depending on the category and production capacity.",
        },
        {
          question: "Which license category applies to my business?",
          answer:
            "It depends primarily on your annual turnover — up to ₹1.5 crore typically needs Basic Registration, ₹1.5 crore to ₹50 crore needs a State License, and above ₹50 crore needs a Central License.",
        },
        {
          question: "Is renewal required every year?",
          answer:
            "Licenses applied for after the recent FSSAI amendments carry perpetual validity with the government fee paid once, though an annual return (Form D) must still be filed by 31 May each year.",
        },
      ],
    },
  },
  {
    id: "svc-gem-portal",
    slug: "gem-government-tender-registration",
    title: "GeM Government Tender Portal Registration",
    shortDescription:
      "Register as a seller on the Government e-Marketplace to sell to government departments.",
    description:
      "The Government e-Marketplace (GeM) is the official online procurement platform where central and state government departments, ministries, and PSUs buy goods and services directly from registered sellers. Basic seller registration carries no government fee; certain seller categories additionally require a vendor assessment before full catalogue access. We handle profile creation, document validation, category mapping, and MSME/startup preference setup.",
    image: "/images/services/gem-government-tender-registration.jpg",
    price: 5000,
    originalPrice: 6500,
    governmentFee: 0,
    professionalFee: 5000,
    duration: "3-7 working days",
    featured: false,
    popular: false,
    details: {
      benefits: [
        "Direct access to government departments and PSUs as buyers — no middlemen",
        "No caution money/security deposit is required for new sellers under current rules",
        "Preference given to DPIIT-recognised startups and Udyam-registered MSMEs in bidding",
        "Transparent, adaptive pricing and real-time order tracking",
        "Opens access to India's largest institutional procurement market",
      ],
      eligibility: [
        "Original Equipment Manufacturers (OEMs) and authorised resellers",
        "Proprietors, partnerships, LLPs, and companies with valid PAN and GST",
        "MSMEs registered on Udyam and DPIIT-recognised startups (eligible for special provisions)",
      ],
      requiredDocuments: [
        "PAN of the business/individual",
        "GSTIN and Udyam Registration Number, where applicable",
        "Certificate of Incorporation/business registration proof",
        "Bank account details",
        "DPIIT Startup recognition certificate, if claiming startup benefits",
        "Income Tax Returns of recent years (for certain seller categories)",
      ],
      faqs: [
        {
          question: "Is there a fee to register as a seller on GeM?",
          answer:
            "No government fee applies for basic seller registration or product listing. Some seller categories (such as OEM/bidder assessment) may separately require a paid, government-mandated vendor assessment.",
        },
        {
          question: "Do I need a security deposit to sell on GeM?",
          answer:
            "No, the earlier caution money/security deposit requirement has been removed to support the Ease of Doing Business initiative; new sellers no longer need to block capital to register.",
        },
        {
          question: "Do MSMEs get any advantage on GeM?",
          answer:
            "Yes, MSMEs and DPIIT-recognised startups receive preference in specific procurement categories and are exempt from Earnest Money Deposit (EMD) in eligible bids.",
        },
      ],
    },
  },
  {
    id: "svc-startup-india",
    slug: "startup-india-registration",
    title: "Startup India Registration (DPIIT Recognition)",
    shortDescription:
      "Get your startup DPIIT-recognised under the Startup India initiative for tax and compliance benefits.",
    description:
      "Startup India registration means securing recognition from the Department for Promotion of Industry and Internal Trade (DPIIT) via the Startup India portal. DPIIT recognition itself is free; it is granted to eligible Private Limited Companies, LLPs, and Registered Partnership Firms, unlocking tax holidays, angel tax exemption, self-certification, and easier access to government schemes. We prepare your application, pitch documentation, and supporting write-up to maximise approval chances.",
    image: "/images/services/startup-india-registration.jpg",
    price: 5000,
    originalPrice: 6999,
    governmentFee: 0,
    professionalFee: 5000,
    duration: "7-10 working days for DPIIT recognition",
    featured: true,
    popular: true,
    details: {
      benefits: [
        "DPIIT recognition carries no government fee",
        "Up to 3 consecutive years of 100% income tax exemption under Section 80-IAC (within the first 10 years)",
        "Angel tax exemption under Section 56(2)(viib)",
        "Self-certification for select labour and environmental law compliances",
        "Access to the Seed Fund Scheme, Credit Guarantee cover, and Fund of Funds",
        "Preference and EMD exemption in GeM government procurement bids",
      ],
      eligibility: [
        "Private Limited Company, LLP, Registered Partnership Firm, or eligible Cooperative Society",
        "Entity must be working toward innovation, development, or improvement of products/services with scalable business potential",
        "Turnover must not exceed the prescribed cap (₹200 crore for standard startups; higher for the Deep Tech category)",
        "Not formed by splitting up or reconstructing an existing business",
      ],
      requiredDocuments: [
        "Certificate of Incorporation/Registration",
        "PAN of the entity",
        "Details of directors/partners",
        "Brief write-up on innovation and scalability of the business",
        "Website/pitch deck link or product details, if available",
        "GST registration certificate, where applicable",
      ],
      faqs: [
        {
          question: "Does DPIIT recognition cost anything?",
          answer:
            "No, the Department for Promotion of Industry and Internal Trade does not charge any government fee to apply for or receive Startup India recognition.",
        },
        {
          question: "What are the main tax benefits of DPIIT recognition?",
          answer:
            "Recognised startups can claim a 3-year income tax holiday under Section 80-IAC (subject to Inter-Ministerial Board approval) and exemption from angel tax under Section 56(2)(viib).",
        },
        {
          question: "Is there a special category for deep-tech startups?",
          answer:
            "Yes, under the 2026 DPIIT framework, Deep Tech startups (AI, biotech, quantum computing, advanced materials, robotics, and space technology) get a longer 20-year recognition window and a higher ₹300 crore turnover cap.",
        },
      ],
    },
  },
];
