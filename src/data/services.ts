import { Service } from "@/types";

export const services: Service[] = [
  {
    id: "svc-pan-services",
    slug: "pan-card-services",
    title: "PAN Card Services",
    shortDescription:
      "Quick and hassle-free assistance for PAN application, updates, and corrections.",
    description:
      "A Permanent Account Number (PAN) is an essential identification number used for income tax and various financial and business transactions in India. Compliance Portal India provides assistance with new PAN applications, PAN corrections, updates, and related documentation requirements. Our streamlined process helps individuals and businesses complete PAN-related requirements with greater convenience and accuracy. ",
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
        "Provides a unique identification number for income tax-related purposes",
        "PAN is required for various specified financial and banking transactions",
        "Supports businesses in completing applicable registrations and statutory requirements",
        "Get assistance in updating or correcting PAN details",
        "Professional guidance helps ensure the application contains the required information and documents",
      ],
      eligibility: [
        "Individuals, companies, LLPs, firms, trusts, and other eligible entities can apply for PAN",
        "Applicants must provide valid identity and supporting documentation as prescribed by the relevant authority",
      ],
      requiredDocuments: [
        "Identity Proof",
        "Address Proof",
        "Date of Birth / Incorporation Proof",
        "Aadhaar Card, where applicable",
        "Business registration documents, where applicable",
        "Photograph and signature, wherever required",
      ],
      faqs: [
        {
          question: "Who needs a PAN card?",
          answer:
            "Individuals and entities requiring PAN for taxation, financial transactions, business registrations, or other prescribed purposes may apply.",
        },
        {
          question: "Can I apply for a PAN card online?",
          answer:
            "Yes. PAN applications and correction requests can be submitted through authorised online channels.",
        },
        {
          question: "Can PAN details be corrected?",
          answer:
            "Yes. Corrections or updates can be requested for eligible PAN details such as name, date of birth, address, or other information. ",
        },
      ],
      packageDeliverables: [
          "PAN Application / Correction Assistance",
          "Documentation Verification",
          "Online Application Submission",
          "Application Status Tracking",
          "PAN Card / e-PAN Assistance",
],
    },
  },
  {
    id: "svc-income-tax-efiling",
    slug: "income-tax-e-filing",
    title: "Income Tax E-Filing (ITR)",
    shortDescription:
      "File your income tax returns accurately and stay compliant with tax regulations. ",
    description:
      "Income Tax Return (ITR) e-filing is the process of electronically reporting your income, deductions, taxes paid, and other relevant financial details to the Income Tax Department. Compliance Portal India assists individuals, professionals, businesses, and eligible entities with ITR preparation and online filing based on their applicable income and tax requirements. From ITR filing and tax computation to documentation and e-verification, we help simplify the tax filing process and keep you on track with applicable deadlines. ",
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
        "File your return within the applicable deadline and fulfil your income tax reporting obligations",
        "Ensure applicable deductions, exemptions, and tax benefits are considered while preparing your return",
        "Get assistance in calculating taxable income, applicable deductions, and tax liability",
        "A filed ITR can serve as useful income documentation for loans, visas, financial applications, and other purposes where applicable",
        "Complete your ITR filing online without the need for extensive paperwork or unnecessary visits",
      ],
      eligibility: [
        "Individuals, HUFs, firms, companies, and other taxpayers may be required to file an ITR depending on their income, financial activities, and applicable provisions",
        "The applicable ITR form depends on the taxpayer's income sources, residential status, business/professional activities, and other relevant factors",
        "Taxpayers may also file returns voluntarily where permitted under applicable provisions",
        "ITR filing requirements can also arise in certain cases irrespective of the basic income threshold, depending on specified conditions under the Income Tax Act",
      ],
      requiredDocuments: [
          "PAN Card & Aadhaar Card",
          "Bank Account Statements",
          "Interest Income / TDS Certificates",
          "Investment & Tax-Saving Proofs",
          "Capital Gains Statements, where applicable",
          "Details of Other Income & Deductions",
          "Previous ITR / Tax Documents, where applicable",
          "Form 16, where applicable",
      ],
      faqs: [
        {
          question: "Who needs to file an Income Tax Return? ",
          answer:
            "ITR filing may be mandatory for taxpayers meeting prescribed income thresholds or other specified conditions under the Income Tax Act. The requirement depends on the taxpayer's circumstances and applicable rules. ",
        },
        {
          question: "Can I file my ITR online?",
          answer:
            "Yes. Income Tax Returns can be filed electronically through the Income Tax Department's e-filing portal. Professional assistance can help with preparation, filing, and e-verification.",
        },
        {
          question: "What happens if I miss the ITR filing deadline? ",
          answer:
            "A return filed after the applicable due date may be treated as a belated return and may attract applicable interest, late filing fees, or other consequences depending on the circumstances.",
        },
        {
          question: "What if I miss the ITR deadline?",
          answer:
            "You can still file a belated return before the year-end deadline, subject to a late fee, or use the ITR-U facility to file updated returns for past years within the permitted window.",
        },
      ],
      packageDeliverables: [
        "ITR Preparation & Tax Computation",
        "Applicable Deduction & Tax Benefit Review",
        "Online Income Tax Return Filing",
        "E-Verification & Filing Confirmation Assistance",
        "Income & Tax Details Assessment",
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
      "TRACES (TDS Reconciliation Analysis and Correction Enabling System) is an online platform of the Income Tax Department used for various TDS-related activities. Businesses and deductors can use TRACES for TDS statement-related services, Form 16/16A, certificates, defaults, corrections, and other applicable compliance activities. Compliance Portal India provides assistance with TRACES registration, TDS-related documentation, statement support, corrections, and compliance requirements. ",
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
        "Manage applicable TDS-related requirements through the TRACES platform",
        "Get assistance with applicable statement-related processes and corrections",
        "Support for accessing and managing applicable TDS certificates",
        "Assistance in understanding and addressing applicable TDS defaults or mismatches",
        "Maintain organized TDS records and stay aligned with applicable requirements",
      ],
      eligibility: [
      "TDS deductors and collectors who are required to comply with applicable TDS/TCS provisions may need access to TRACES",
      "A valid TAN is generally required for entities responsible for deducting or collecting tax at source",
      "Specific services on TRACES may have additional authentication and eligibility requirements",
      ],
      requiredDocuments: [
          "TAN of the deductor",
          "PAN details",
          "Authorised signatory details",
          "Digital Signature Certificate, where applicable",
          "TDS statement details",
          "Relevant challan/payment information",
          "Supporting documentation for corrections, where applicable",
      ],
      faqs: [
        {
          question: "What is TAN and why is it required?",
          answer:
            "TAN is the Tax Deduction and Collection Account Number generally required by persons/entities responsible for deducting or collecting tax at source.",
        },
        {
          question: "Can TDS returns be corrected through TRACES?",
          answer:
            "TRACES provides various services related to TDS statements, defaults, and corrections, subject to the applicable process.",
        },
        {
          question: "Can I download Form 16 or Form 16A from TRACES?",
          answer:
            "Eligible deductors can use TRACES for applicable TDS certificate-related services, including generation/download processes. ",
        },
      ],
      packageDeliverables: [
          "TRACES Registration / Login Assistance",
          "TDS Statement & Documentation Support",
          "Form 16 / 16A Assistance",
          "TDS Default / Mismatch Support",
          "Correction & Compliance Assistance",
      ],
    },
  },
  {
    id: "svc-gst-registration",
    slug: "gst-registration",
    title: "GST Registration",
    shortDescription:
      "Register your business under GST and meet your tax compliance requirements.",
    description:
      "GST Registration is the process through which eligible businesses obtain a Goods and Services Tax Identification Number (GSTIN) and become registered under India's GST framework. It enables businesses to collect GST, issue compliant tax invoices, claim eligible Input Tax Credit (ITC), and meet applicable GST filing requirements. Compliance Portal India provides end-to-end assistance with GST registration, documentation, application submission, and status tracking, making the process simpler and more efficient. ",
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
        "Helps eligible businesses meet their applicable GST registration and tax obligations",
        "Allows registered businesses to issue tax invoices with the required GST details",
        "Enables eligible registered businesses to claim applicable Input Tax Credit on business purchases",
        "Supports businesses in undertaking transactions and operations requiring GST registration, subject to applicable provisions",
        "A valid GSTIN can strengthen credibility when working with customers, vendors, and business partners",
      ],
      eligibility: [
        "Businesses crossing the applicable GST registration threshold based on aggregate turnover may be required to register",
        "Registration requirements can vary based on business type, state/UT, turnover, supply type, and nature of operations",
        "Certain businesses may require mandatory GST registration irrespective of turnover, depending on the nature of their activities and applicable provisions",
        "Businesses may also opt for voluntary GST registration even when registration is not otherwise mandatory, subject to applicable provisions",
      ],
      requiredDocuments: [
          "PAN Card of the business/entity",
          "Incorporation Certificate, Partnership Deed, LLP Agreement, etc.",
          "Aadhaar & PAN of the proprietor, partners, directors, or authorised signatory",
          "Bank Account Details",
          "Business Address Proof",
          "Digital Signature Certificate (DSC), where applicable",
          "Photograph of the proprietor/partners/directors/authorised signatory",
      ],
      faqs: [
        {
          question: "Who needs GST registration in India?",
          answer:
            "Businesses that meet the applicable turnover threshold or fall under categories requiring mandatory registration under GST law need to obtain GST registration. ",
        },
        {
          question: "What is a GSTIN?",
          answer:
            "GSTIN stands for Goods and Services Tax Identification Number. It is the unique 15-digit identification number issued to a registered taxpayer under the GST system",
        },
        {
          question: "Can I voluntarily register for GST even if my turnover is below the threshold?",
          answer:
            "Yes. Businesses can generally opt for voluntary GST registration even when they are not otherwise required to register, subject to applicable GST provisions.",
        },
      ],
      packageDeliverables: [
        "Documentation & KYC Verification Assistance",
        "GST Registration Application Preparation",
        "GST Application Status Tracking & Follow-up Support",
        "Online GST Portal Application & Submission",
        "GSTIN / Registration Certificate Assistance",
      ],
    },
  },
  {
    id: "svc-mca-company-llp",
    slug: "mca-company-llp-registration",
    title: "MCA Company / LLP Registration",
    shortDescription:
      "Set up your company or LLP with the right documentation and regulatory support.",
    description:
      "MCA Company / LLP Registration enables entrepreneurs and businesses to establish a legally recognized business entity in India through the Ministry of Corporate Affairs (MCA). Whether you are setting up a Private Limited Company, One Person Company (OPC), or Limited Liability Partnership (LLP), choosing the right structure is an important step towards building a compliant business. Compliance Portal India assists with entity selection, documentation, name application, incorporation filing, and post-registration requirements, making the incorporation process simpler and more structured.",
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
        "Establish your business as a formally registered legal entity under the applicable MCA framework",
        "Provides applicable limited liability protection to shareholders or partners, subject to the chosen structure and law",
        "A registered entity can strengthen credibility with clients, vendors, investors, and financial institutions",
        "A formal business structure can support expansion, partnerships, and access to applicable funding opportunities",
        "Establish a defined legal and operational framework for managing ownership, responsibilities, and business activities",
      ],
      eligibility: [
        "Generally requires at least 2 directors and 2 members, subject to applicable provisions",
        "Can be incorporated with 1 member and 1 director, subject to applicable eligibility requirements",
        "Requires at least 2 designated partners, with at least one designated partner meeting the applicable Indian residency requirement",
        "Proposed directors/partners must satisfy the applicable legal, identification, and documentation requirements under the Companies Act, 2013 and LLP Act, 2008",
      ],
      requiredDocuments: [
        "PAN & Aadhaar of proposed directors/partners",
        "Address Proof & Recent Photograph of directors/partners",
        "Registered Office Address Proof",
        "Rent Agreement / Lease Deed & NOC, where applicable",
        "Digital Signature Certificate (DSC)",
        "Business Name & Main Objects / Nature of Business",
        "MOA & AOA / LLP Agreement, as applicable",
      ],
      faqs: [
        {
          question: "What is the difference between a Private Limited Company and an LLP?",
          answer:
            "A Private Limited Company is generally suitable for businesses seeking a corporate structure with shareholders and potential equity investment, while an LLP combines limited liability with a partnership-based management structure. The appropriate choice depends on your business objectives and requirements.",
        },
        {
          question: "How many people are required to register a Private Limited Company?",
          answer:
            "A Private Limited Company generally requires a minimum of 2 members and 2 directors. Specific statutory requirements and eligibility conditions apply.",
        },
        {
          question: "What do I receive after successful registration?",
          answer:
            "Upon successful incorporation, the relevant government authority issues incorporation documentation, including the Certificate of Incorporation for a company or LLP, along with applicable identification details.",
        },
      ],
      packageDeliverables: [
          "Business Structure & Entity Selection Guidance",
          "Digital Signature & DIN Application Assistance, where applicable",
          "Company/LLP Name Application & Documentation Support",
          "MCA Incorporation Application & Filing Assistance",
          "Certificate of Incorporation / LLP Incorporation Documentation",
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
      "Trademark Registration provides legal protection for eligible brand identifiers such as names, logos, symbols, words, and other marks used to distinguish goods or services. Registering a trademark with the Trade Marks Registry under IP India can help establish exclusive rights over the registered mark for the relevant goods or services, subject to the law. Compliance Portal India assists with trademark search, application preparation, filing, documentation, and application tracking. ",
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
        "Protect your registered mark against unauthorised use, subject to applicable law",
        "Registration provides statutory rights in relation to the registered mark and specified goods/services",
        "A registered trademark can become an important intangible asset for your business",
        "Registration strengthens your position when taking action against infringement",
        "A protected brand identity can strengthen customer and business confidence",
      ],
      eligibility: [
        "Individuals, startups, companies, LLPs, partnerships, trusts, and other eligible applicants can apply for trademark registration",
        "The proposed mark should meet the requirements of the Trade Marks Act and Rules",
        "The mark should not fall within prohibited or non-registrable categories under applicable law",
        "A trademark application must specify the relevant goods/services and class(es)",
      ],
      requiredDocuments: [
        "Applicant's PAN & identity/address proof",
        "Business registration/incorporation documents, where applicable",
        "Trademark name/logo/device",
        "Details of goods/services and relevant trademark class",
        "User affidavit/proof of prior use, where applicable",
        "Power of Attorney, where required",
        "Logo/device representation, if applicable",
      ],
      faqs: [
        {
          question: "How long does trademark registration take?",
          answer:
            "The timeline can vary significantly depending on examination, objections, oppositions, hearings, and other procedural requirements.",
        },
        {
          question: "Is trademark registration mandatory?",
          answer:
            "No, trademark registration is generally not mandatory to use a brand. However, registration provides important statutory protection and strengthens the owner's legal rights.",
        },
        {
          question:
            "How long is a registered trademark valid?",
          answer:
            "A registered trademark is generally valid for 10 years from the date of application and can be renewed indefinitely for successive 10-year periods, subject to applicable requirements. ",
        },
      ],
      packageDeliverables: [
        "Trademark Search & Preliminary Assessment",
        "Trademark Class Identification",
        "Application & Documentation Preparation",
        "IP India Online Filing Assistance",
        "Application Status Tracking & Process Support",
      ],
    },
  },
  {
    id: "svc-iso-certification",
    slug: "iso-certification-advisory",
    title: "ISO Certification",
    shortDescription:
      "Guidance on ISO 9001, 14001, 27001, and other standards through NABCB-accredited certification bodies.",
    description:
      "ISO Certification demonstrates an organization's commitment to internationally recognized standards for quality, efficiency, security, safety, and other business processes. Compliance Portal India provides ISO certification advisory and implementation support, helping businesses understand the applicable standard, prepare documentation, and navigate the certification process. From ISO 9001 and ISO 14001 to ISO 45001 and ISO 27001, we help organizations identify relevant standards and work towards certification with a structured approach.",
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
        "Demonstrate your commitment to recognized quality and management standards",
        "Establish structured processes that can improve consistency, accountability, and operational efficiency",
        "Strengthen your position when responding to client, vendor, tender, or business partnership requirements",
        "Identify and address relevant operational, quality, security, or environmental risks through structured systems",
        "ISO certification may help meet certification requirements specified by certain customers, tenders, and business partners",
      ],

      eligibility: [
        "Businesses of various sizes and sectors can pursue ISO certification, including startups, MSMEs, manufacturers, service providers, and established organizations",
        "The organization should have clearly defined business activities and processes relevant to the selected ISO standard",
        "Certification requirements vary depending on the ISO standard, scope, industry, and organization size",
        "The organization must be prepared to implement and maintain the applicable management system requirements before certification",
      ],
      requiredDocuments: [
        "Business Registration / Incorporation Documents",
        "Organization PAN & GST Certificate, where applicable",
        "Business Address Proof",
        "Organization Structure & Employee Details",
        "Existing Policies, Procedures & Process Documents, if available",
        "Scope of Business / Certification",
        "Relevant Licences, Records & Supporting Documents, depending on the ISO standard",
      ],
      faqs: [
        {
          question: "Which ISO certification is best for my business?",
          answer:
            "The appropriate certification depends on your industry, business objectives, processes, and customer requirements. ISO 9001 is widely used for quality management, while standards such as ISO 14001, ISO 45001, and ISO 27001 address environmental management, occupational health and safety, and information security respectively.",
        },
        {
          question:
            "Is ISO certification mandatory for businesses?",
          answer:
            "ISO certification is not universally mandatory. However, it may be required or preferred for certain contracts, tenders, industries, customers, or regulatory/business requirements. ",
        },
        {
          question: " How long does ISO certification take? ",
          answer:
            "The timeline varies depending on the chosen standard, organization size, scope, existing processes, documentation, and implementation readiness. ",
        },
      ],
      packageDeliverables: [
          "ISO Standard & Certification Requirement Assessment",
          "Documentation & Management System Support",
          "Implementation & Compliance Guidance",
          "Internal Audit / Gap Assessment Support, where applicable",
          "Certification Audit Coordination Assistance",
      ],
    },
  },
  {
    id: "svc-msme-udyam",
    slug: "msme-udyam-registration",
    title: "MSME / Udyam Registration",
    shortDescription:
      "Get Udyam-registered and access eligible benefits, schemes, and business opportunities.",
    description:
      "Udyam Registration is the official government registration for eligible Micro, Small and Medium Enterprises (MSMEs) in India. It provides businesses with a recognised MSME identity and can help them access applicable government schemes, benefits, subsidies, and business opportunities. Compliance Portal India assists with Udyam Registration, documentation, application submission, and registration support through a simple and streamlined process. ",
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
        "Obtain government recognition as an eligible Micro, Small or Medium Enterprise",
        "Become eligible to access applicable MSME schemes, incentives, and support programmes",
        "Strengthen your business profile with formal MSME recognition",
        "Access applicable MSME-focused lending and financial support initiatives",
        "MSME registration can support participation in applicable government procurement programmes",
      ],
      eligibility: [
        "Eligible proprietorships, partnerships, companies, LLPs, trusts, societies, and other entities engaged in eligible business activities can apply",
        "Classification as Micro, Small, or Medium depends on the applicable investment and turnover criteria",
        "The enterprise must provide valid identification and business information as required for Udyam registration",
      ],
      requiredDocuments: [
        "PAN Card of the business/proprietor",
        "Aadhaar Card of proprietor/partners/directors",
        "Business and contact details",
        "Bank account details",
        "GSTIN, where applicable",
        "Details of business activity and investment/turnover",
      ],
      faqs: [
        {
          question: "Is Udyam Registration free",
          answer:
            "The official Udyam registration process is provided by the Government. If professional assistance is used, service charges may apply.",
        },
        {
          question: "Can a startup apply for Udyam Registration?",
          answer:
            "Yes, an eligible startup can obtain Udyam Registration if it meets the applicable MSME classification criteria.",
        },
        {
          question: "Does Udyam Registration need renewal",
          answer:
            "Udyam Registration does not generally require periodic renewal, but businesses must keep their information updated as required. ",
        },
      ],
      packageDeliverables: [
          "Udyam Registration Application Preparation",
          "Online Udyam Portal Submission",
          "Documentation & KYC Assistance",
          "Application Processing Support",
          "Udyam Registration Certificate Assistance",
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
      "EPFO PF Registration enables eligible establishments to register with the Employees’ Provident Fund Organisation and meet their Provident Fund (PF) compliance requirements. Get professional assistance with EPF registration, employer registration, PF account setup, and UAN-related compliance for a smoother process. Simplify your online PF registration with Compliance Portal India and ensure your business is better prepared to manage its employee provident fund obligations. ",
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
        "Provides employees with financial security through provident fund benefits and savings. ",
        "Helps employees build a structured long-term savings corpus for retirement.  ",
        "Helps eligible establishments meet their applicable EPF and statutory compliance obligations.  ",
        "Supports access to applicable EPFO-linked benefits and social security provisions.",
        "Demonstrates a commitment to employee welfare and responsible employment practices. ",
      ],
      eligibility: [
        "Generally mandatory for establishments employing 20 or more employees ",
        "Voluntary coverage is available for establishments employing fewer than 20 employees, subject to the applicable EPFO provisions and employer/employee consent requirements.",
        "Covers eligible factories and establishments including companies, LLPs, partnerships, and other entities falling within the scope of the EPF & MP Act. ",
      ],
      requiredDocuments: [
        "PAN Card of the Establishment/Company ",
        "Certificate of Incorporation / Registration ",
        "Address Proof of the Establishment ",
        "Digital Signature Certificate (DSC) ",
        "Authorized Signatory Details & KYC ",
        "Employee Details ",
      ],
      faqs: [
        {
          question: "Is EPFO PF registration mandatory for all businesses?",
          answer:
            "EPFO registration is generally mandatory for establishments covered under the EPF & MP Act, including eligible establishments meeting the applicable employee threshold. Certain establishments may also be covered based on the nature of their activities or government notifications.",
        },
        {
          question: "Can a company with fewer than 20 employees register for PF?",
          answer:
            "Yes. Establishments with fewer than 20 employees may opt for voluntary EPF coverage, subject to the applicable EPFO provisions and prescribed requirements.",
        },
        {
          question:
            "What documents are required for EPFO PF registration?",
          answer:
            "Common requirements include the establishment’s PAN, incorporation/registration documents, address proof, authorised signatory details and KYC, DSC, and relevant employee information. Additional documents may apply depending on the entity type. ",
        },
      ],
      packageDeliverables: [
        "Statutory Documentation & Drafting for EPFO PF Registration",
        "Government Portal Fee Payment & Receipt",
        "CA/CS Verification & Registration Assistance",
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
      "ESIC Registration helps eligible establishments register under the Employees’ State Insurance (ESI) scheme and meet applicable employee social security requirements. Get professional assistance with ESIC registration, employer registration, employee coverage, and ESI compliance for your organization. Compliance Portal India simplifies the online ESIC registration process with documentation support and guidance from application to completion.",
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
        "Provides eligible employees and their dependants access to medical benefits under the ESI scheme",
        "Offers applicable benefits during sickness, maternity, disablement, and other covered circumstances. ",
        "Helps eligible establishments fulfil their applicable ESI registration and contribution obligations. ",
        "Strengthens employee welfare by providing access to a government-backed social security framework.  ",
        "Demonstrates a commitment to employee welfare and responsible employment practices.",
      ],
      eligibility: [
        "Generally applicable to establishments employing 10 or more persons ",
        "Coverage may vary by establishment type, location, and applicable wage ceiling prescribed under the ESI scheme.  ",
        "Factories and notified establishments such as shops, hotels, restaurants, educational institutions, and other establishments may fall under ESIC coverage, depending on applicable rules.",
        "Employees whose wages fall within the prescribed ESI wage ceiling may be covered under the scheme, subject to applicable provisions. ",
      ],
      requiredDocuments: [
        "PAN Card of the Establishment/Company ",
        "Certificate of Incorporation / Registration",
        "Address Proof of the Establishment ",
        "Bank Account Details",
        "Details of Directors / Partners / Proprietor",
        "Employee Details ",
      ],
      faqs: [
        {
          question: "Is ESIC registration mandatory for my business?",
          answer:
            "ESIC registration is generally mandatory for establishments covered under the ESI Act and applicable notifications, subject to factors such as the establishment type, employee strength, location, and prescribed wage ceiling. ",
        },
        {
          question: "What is the ESIC salary limit for employees?",
          answer:
            "Employees earning wages within the applicable ESI wage ceiling may be covered under the scheme. The prescribed ceiling and applicable rules should be checked for the relevant period.",
        },
        {
          question: "What benefits does ESIC provide to employees?",
          answer:
            "Eligible insured employees and their dependants can receive applicable medical and social-security benefits, including benefits relating to sickness, maternity, employment injury, disablement, and other circumstances covered under the ESI scheme.",
        },
      ],
      packageDeliverables: [
        "Statutory Documentation & Application Preparation for ESIC Registration",
        "Online ESIC Portal Registration & Submission Assistance",
        "Government Portal Fee Payment & Receipt, wherever applicable",
        "CA/CS Verification & Compliance Assistance",
        "Registration Status & Process Support until completion",
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
      "Shops & Establishment Registration is a state-specific compliance requirement applicable to eligible commercial establishments, shops, offices, and other establishments, depending on the relevant state law. It helps businesses comply with applicable requirements relating to working conditions, employment records, working hours, leave, wages, and other labour-related matters. Compliance Portal India provides assistance with registration, documentation, application submission, and applicable labour compliance requirements. ",
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
          "Helps eligible establishments meet applicable state labour requirements",
          "Provides formal recognition under the applicable Shops & Establishments framework",
          "Supports adherence to applicable employment-related requirements",
          "Helps establish a structured compliance record for the business",
          "Reduces the administrative complexity associated with labour-related registrations",
      ],
      eligibility: [
        "Applicability depends on the state/UT and nature of the establishment",
        "Eligible shops, commercial establishments, offices, and other covered establishments may need registration under the relevant state law",
        "Specific requirements vary based on the establishment type and applicable local regulations",

      ],
      requiredDocuments: [
        "PAN Card of business/entity",
        "Business registration/incorporation documents",
        "Address proof of establishment",
        "Rent agreement/ownership proof, where applicable",
        "Employer/proprietor/director details",
        "Employee details, where applicable",
        "Photograph and other state-specific documents",

      ],
      faqs: [
        {
          question: "Is Shops & Establishment Registration mandatory?",
          answer:
            " It may be mandatory for establishments covered under the applicable state Shops & Establishments law. Requirements vary by state and establishment type.",
        },
        {
          question: "Who needs Shops & Establishment Registration?",
          answer:
            "Eligible shops, offices, commercial establishments, and other covered businesses may need registration under the relevant state legislation. ",
        },
        {
          question: " Is Shops & Establishment Registration the same across India?",
          answer:
            " No. The applicable law, registration process, documents, fees, and requirements can differ between states and UTs.",
        },
      ],
      packageDeliverables: [
          "Registration Requirement Assessment",
          "Documentation & Application Preparation",
          "Online Application Submission",
          "Government Fee Payment & Receipt, where applicable",
          "Registration Certificate / Approval Assistance",
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
      "Import Export Code (IEC) is a unique 10-digit identification number issued by the Directorate General of Foreign Trade (DGFT) and is generally required for businesses undertaking import or export activities in India. It serves as an essential business identification for international trade, customs clearance, and cross-border transactions, subject to applicable exemptions. Compliance Portal India provides professional assistance with IEC application, documentation, online submission, and application tracking, helping businesses simplify their international trade onboarding. ",
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
        "Helps eligible businesses undertake import and export transactions from India",
        "Enables businesses to explore and participate in international markets",
        "Supports the customs documentation and clearance process for applicable import and export shipments",
        "Apply for IEC through the DGFT platform with professional assistance throughout the process",
        "Provides important business identification for applicable foreign trade and related transactions",
      ],
      eligibility: [
        "Businesses and individuals undertaking import or export activities can apply for an IEC, subject to applicable DGFT regulations",
        "The applicant must provide the required banking and address information for the IEC application",
        "The applicant should have a valid PAN and business/individual identity details as required by DGFT",
        "Certain categories of transactions or persons may be exempt from IEC requirements under applicable foreign trade regulations",
      ],
      requiredDocuments: [
        "PAN Card of the business/entity",
        "Business Registration / Incorporation Documents",
        "PAN & KYC Details of the proprietor, partners, directors, or authorised signatory",
        "Bank Account Details / Cancelled Cheque",
        "Digital Signature / Aadhaar-based Authentication, as applicable",
        "Address Proof of the business",
        "Photograph of the Proprietor / Authorised Person, wherever applicable",
      ],
      faqs: [
        {
          question: "Is IEC mandatory for import and export?",
          answer:
            "IEC is generally required for import or export activities, subject to exemptions specified under applicable foreign trade regulations.",
        },
        {
          question: "Who can apply for an IEC?",
          answer:
            "Proprietorships, companies, LLPs, partnerships, trusts, societies, and other eligible entities or individuals can apply, subject to DGFT requirements.",
        },
        {
          question: "Is IEC registration a one-time process?",
          answer:
            "IEC is generally issued as a permanent identification, but the holder must ensure that the details remain updated and comply with applicable DGFT requirements, including any prescribed annual updates.",
        },
      ],
      packageDeliverables: [
        "DGFT Portal Application & Submission Assistance",
        "IEC Application Preparation & Documentation",
        "Application Status Tracking & Process Assistance",
        "IEC Certificate / e-IEC Download Assistance",
        "KYC & Bank Detail Verification Support",
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
      "FSSAI Registration/License is a mandatory food safety compliance requirement for eligible Food Business Operators (FBOs) in India. Whether you operate a restaurant, cloud kitchen, food manufacturing unit, catering business, retailer, or food delivery business, the appropriate FSSAI registration or licence depends on your business activity and scale. Compliance Portal India provides assistance with FSSAI registration, FSSAI licence application, documentation, and renewal, helping simplify the process for food businesses. ",
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
      "Helps your food business meet applicable food safety and regulatory requirements",
      "An FSSAI registration/licence demonstrates your commitment to food safety and regulatory standards",
      "Strengthens your brand's credibility when dealing with customers, vendors, marketplaces, and business partners",
      "Helps establish the required regulatory foundation as your food business grows",
      "Provides your eligible food business with official registration/licensing under the FSSAI framework",
      ],
      eligibility: [
        "Basic FSSAI Registration is generally applicable to small food businesses that fall within the prescribed eligibility criteria",
        "State FSSAI Licence may apply to food businesses operating at a larger scale within the applicable state",
        "Central FSSAI Licence is required for food businesses falling under categories prescribed for central licensing, including certain businesses operating across states or in specified food sectors",
        "The applicable registration or licence depends on factors such as business activity, scale of operations, turnover, food products, and location",
      ],
      requiredDocuments: [
        "PAN Card / Identity Proof",
        "Business Address Proof",
        "Photograph of the applicant/authorised person",
        "Business Constitution Documents",
        "Proof of Possession of Premises",
        "Food Business Details",
      ],
      faqs: [
          {
      question: "Is FSSAI registration mandatory for a food business?",
      answer:
        "Yes. Food Business Operators are required to obtain the appropriate FSSAI registration or licence as applicable to their business under the food safety regulations.",
      },
      {
        question: "What is the difference between FSSAI Registration and FSSAI Licence?",
        answer:
          "FSSAI Registration is generally intended for eligible small food businesses, while State or Central FSSAI Licences apply to businesses falling within the respective licensing criteria.",
      },
      {
        question: "Do cloud kitchens and home-based food businesses need FSSAI registration?",
        answer:
          "Yes, eligible home-based food businesses and cloud kitchens may need FSSAI registration or licensing depending on their nature and scale of operations.",
      },
      ],
      packageDeliverables: [
        "FSSAI Application Preparation & Documentation",
        "Online FSSAI Portal Application & Submission Assistance",
        "Government Fee Payment & Receipt, wherever applicable",
        "Application Tracking & Status Support",
        "FSSAI Registration/License Documentation",
      ],
    },
  },
  {
    id: "svc-gem-portal",
    slug: "gem-government-tender-registration",
    title: "GeM Registration ",
    shortDescription:
      "Register as a seller on the Government e-Marketplace to sell to government departments.",
    description:
      "Government e-Marketplace (GeM) Registration enables eligible sellers and service providers to participate in India’s government procurement ecosystem. Businesses can use GeM to list products and services, respond to government procurement opportunities, and participate in applicable bids and tenders. Compliance Portal India provides assistance with GeM seller registration, profile setup, documentation, and portal onboarding, helping businesses get started with greater ease.",
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
        "Get your products and services listed on a centralized government procurement marketplace",
        "Explore applicable bids, tenders, and procurement opportunities listed by government organizations",
        "Showcase your offerings to government departments, PSUs, and other eligible public-sector buyers",
        "Manage applicable registrations, product listings, bids, and transactions through an online platform",
        "Establish a presence within India’s government procurement ecosystem and expand your institutional customer base",
      ],
      eligibility: [
        "Businesses, manufacturers, sellers, and service providers that meet the applicable GeM requirements can register as sellers/service providers",
        "The applicant should have a valid business identity and required KYC/documentation",
        "GST registration and other tax/business registrations may be required depending on the nature of the business and products/services offered",
        "Additional eligibility, certifications, experience, turnover, or technical requirements may apply for specific bids and tenders",
      ],
      requiredDocuments: [
          "PAN Card of the business/entity",
          "Aadhaar / PAN & KYC Details of the authorised person",
          "Business Registration / Incorporation Documents",
          "GST Registration Certificate, wherever applicable",
          "Bank Account Details & Cancelled Cheque",
          "Digital Signature Certificate (DSC), where required",
          "Product / Service Details for catalogue creation",
          "Additional licences or certifications, wherever applicable to the products/services",
      ],
      faqs: [
        {
          question: "Who can register on the GeM portal?",
          answer:
            "Eligible manufacturers, sellers, service providers, and other permitted business entities can register on GeM, subject to the platform's applicable requirements.",
        },
        {
          question: "Can a startup or MSME register on GeM?",
          answer:
            "Yes. Eligible startups and MSMEs can register on GeM and participate in applicable government procurement opportunities, subject to the requirements of individual bids.",
        },
        {
          question: "Can GeM registration guarantee government tenders or orders?",
          answer:
            "No. Registration provides access to the government procurement ecosystem, but winning a bid or receiving an order depends on the eligibility criteria, procurement process, competition, and requirements of the specific opportunity.",
        },
      ],
      packageDeliverables: [
          "GeM Seller Registration & Application Assistance",
          "Business Profile Creation & KYC Documentation Support",
          "Product / Service Catalogue Listing Assistance",
          "Government Portal Registration & Verification Support",
          "GeM Registration Status & Process Assistance",
      ],
    },
  },
  {
    id: "svc-startup-india",
    slug: "startup-india-registration",
    title: "Startup India Registration (DPIIT Recognition)",
    shortDescription:
      "Get recognised as a startup and unlock eligible government benefits and support.",
    description:
      "DPIIT Startup Recognition is an official recognition provided to eligible startups under the Startup India initiative. Recognized startups may become eligible for various government benefits, exemptions, intellectual property support, procurement-related benefits, and other initiatives, subject to applicable conditions. Compliance Portal India assists startups with DPIIT recognition applications, documentation, eligibility assessment, and online submission. ",
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
          "Obtain official recognition as an eligible startup under the Startup India framework",
          "Access applicable schemes, incentives, and benefits available to recognized startups",
          "Eligible recognized startups may receive support under applicable intellectual property initiatives",
          "Access applicable benefits in government procurement, subject to tender-specific conditions",
          "Strengthen your presence within India's recognised startup ecosystem",
      ],
      eligibility: [
        "The entity must satisfy the applicable DPIIT definition and recognition criteria",
        "The business should meet prescribed conditions relating to entity type, incorporation period, turnover, and innovation/scalability, as applicable",
        "The startup must not be formed by splitting up or reconstructing an existing business, subject to applicable provisions",
      ],
      requiredDocuments: [
        "Certificate of Incorporation / Registration",
        "PAN Card",
        "Business details and registered address",
        "Details of directors/partners",
        "Business activity and innovation description",
        "Website/pitch deck or supporting business information, where applicable",
      ],
      faqs: [
        {
          question: "Who is eligible for Startup India recognition?",
          answer:
            "Eligible entities that meet the applicable DPIIT criteria relating to incorporation, turnover, innovation, and other prescribed conditions may apply",
        },
        {
          question: " Is DPIIT recognition the same as company registration?",
          answer:
            "No. Company/LLP registration creates the legal entity, while DPIIT recognition provides eligible startups with recognition under the Startup India framework. ",
        },
        {
          question: "Can an LLP get DPIIT recognition?",
          answer:
            "Yes, an eligible LLP can apply for DPIIT recognition if it meets the applicable Startup India criteria.",
        },
      ],
      packageDeliverables: [
          "DPIIT Eligibility Assessment",
          "Application & Documentation Preparation",
          "Startup India Portal Application",
          "DPIIT Recognition Process Assistance",
          "Recognition Certificate / Status Assistance",
      ],
    },
  },
];
