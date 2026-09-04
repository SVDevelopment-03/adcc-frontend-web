/**
 * Full bilingual Privacy Policy content, sourced verbatim from:
 *  - "ADCC Privacy Policy - English.docx"
 *  - "ADCC Privacy Policy - Arabic.docx"
 *
 * Kept as structured data (rather than i18n JSON strings) because this is a
 * long-form legal document, not short UI copy — it renders straight through
 * PrivacyPolicy.tsx based on the active locale.
 */

/** A paragraph (string), a bullet list (string[]), or a bolded sub-heading within a section. */
export type PrivacyBlock = string | string[] | { sub: string };

export interface PrivacySection {
  heading: string;
  blocks: PrivacyBlock[];
}

export interface PrivacyPolicyContent {
  title: string;
  lastUpdated: string;
  intro: PrivacyBlock[];
  sections: PrivacySection[];
}

export const PRIVACY_POLICY_EN: PrivacyPolicyContent = {
  title: "Privacy Policy",
  lastUpdated: "Last Updated: 3 September 2026",
  intro: [
    "Abu Dhabi Cycling Club (“ADCC”, “the Club”, “we”, “our” or “us”) respects the privacy of individuals who visit and interact with its website. This Privacy Policy explains, in clear terms, what information may be collected through the website, why it is used, how it may be shared and protected, and the choices available to you in relation to your personal information.",
    "This Policy applies to the ADCC website and to forms or digital services operated directly by ADCC through the website. Where the website directs you to a third-party platform, mobile application, event-registration service or other external service, the privacy terms of that service may also apply.",
    "ADCC operates within the Emirate of Abu Dhabi and forms part of Abu Dhabi’s sporting ecosystem. Personal information handled through the website is managed in accordance with the laws, regulations, government policies and information-security requirements applicable to ADCC in the United Arab Emirates and the Emirate of Abu Dhabi.",
  ],
  sections: [
    {
      heading: "1. Information We Collect",
      blocks: [
        "You can browse most areas of the website without identifying yourself. Personal information is generally collected only when you choose to provide it, or when limited technical information is generated through your use of the website.",
        { sub: "Information you provide to us" },
        "Depending on how you use the website, we may receive information such as:",
        [
          "your name;",
          "email address;",
          "telephone number;",
          "the contents of an enquiry, message or feedback submitted through the Contact Us form;",
          "correspondence exchanged with ADCC after you contact us;",
          "information you provide when enquiring about membership, cycling activities, events, training, community initiatives, challenges or other Club services; and",
          "any other information you choose to provide through an ADCC-operated form or communication channel.",
        ],
        "Please avoid including sensitive or confidential information in a general enquiry unless it is necessary for us to deal with your request.",
        "Where a particular event, programme or activity requires additional information — for example, information concerning eligibility, age, emergency contacts or participation requirements — the relevant registration process may explain separately what information is required and how it will be used.",
        { sub: "Information collected when you use the website" },
        "Certain technical information may be recorded automatically when you access the website. Depending on the technology in use, this may include:",
        [
          "Internet Protocol (IP) address;",
          "browser type and version;",
          "device and operating-system information;",
          "preferred language;",
          "date and time of access;",
          "pages viewed and links followed;",
          "referring website or source;",
          "files or materials accessed or downloaded;",
          "general location information derived from an IP address, such as country or region; and",
          "technical records necessary for website security, performance and troubleshooting.",
        ],
        "This information is principally used to operate the website, maintain security, understand general patterns of use and improve the digital experience offered to visitors.",
      ],
    },
    {
      heading: "2. How We Use Information",
      blocks: [
        "Information collected through the website may be used to:",
        [
          "respond to questions, requests, feedback or complaints;",
          "provide information about ADCC, its activities, events, training opportunities, community programmes, cycling tracks and challenges;",
          "administer requests or registrations submitted through ADCC-operated channels;",
          "support communication relating to an event, programme or service in which you have expressed an interest;",
          "maintain the functionality, security and integrity of the website;",
          "diagnose technical issues and prevent misuse, fraudulent activity or unauthorised access;",
          "assess how visitors use the website and improve its content, accessibility, navigation and performance;",
          "maintain appropriate administrative and operational records;",
          "fulfil ADCC’s official functions and responsibilities;",
          "coordinate with relevant government entities or service partners where this is necessary to deal with your request or provide a service; and",
          "meet applicable legal, regulatory, governmental, audit, security or records-management requirements.",
        ],
        "We do not use personal information submitted through the website for unrelated commercial purposes, and ADCC does not sell personal information.",
      ],
    },
    {
      heading: "3. Communications",
      blocks: [
        "If you contact ADCC, we may use the contact details you provide to respond to you and to continue correspondence concerning your enquiry.",
        "Where you specifically request updates about an ADCC event, activity, programme or service, we may also use your contact details to provide those updates. Communications of this kind will be limited to the purpose for which the details were provided, unless you have separately agreed to receive other information.",
        "You may ask us to stop optional communications at any time using the contact details set out below or any unsubscribe facility made available with the communication.",
      ],
    },
    {
      heading: "4. Cookies and Similar Technologies",
      blocks: [
        "The website may use cookies or similar technologies where required for its operation, functionality, security or measurement.",
        "Cookies are small data files stored by a browser or device when a website is visited. Depending on the configuration of the website, they may be used to:",
        [
          "maintain essential website functions;",
          "remember preferences such as language selection;",
          "support secure and reliable navigation;",
          "understand general website usage and performance; and",
          "detect and address technical or security issues.",
        ],
        "ADCC does not state through this Policy that advertising or behavioural-profiling cookies are used unless such technologies are specifically introduced on the website.",
        "You can control or delete cookies through your browser settings. Blocking certain cookies may affect the operation of some website features.",
        "Where applicable law or government policy requires a particular form of consent before a non-essential cookie or similar technology is activated, the relevant consent mechanism will be used.",
      ],
    },
    {
      heading: "5. Analytics and Website Performance",
      blocks: [
        "ADCC may use approved technical or analytical tools to obtain statistical information about website traffic and performance.",
        "Where such tools are used, information may include the number of visits to a page, general traffic sources, device or browser information and patterns of interaction with the website. Wherever reasonably practicable, ADCC seeks to use this information in aggregated or non-identifying form.",
        "Information obtained for website measurement is used to understand whether the website is functioning effectively and to identify opportunities to improve the services and information made available to the public.",
      ],
    },
    {
      heading: "6. When Information May Be Shared",
      blocks: [
        "ADCC may disclose information only where there is an appropriate operational, governmental, legal or security reason to do so.",
        "Recipients may include:",
        [
          "Abu Dhabi Sports Council and other relevant Abu Dhabi Government entities;",
          "federal or local government authorities where required or authorised;",
          "technology, hosting, website-maintenance, communications and information-security providers acting on ADCC’s behalf;",
          "partners involved in delivering an event, programme, community activity or other service requested by you, where sharing is necessary for that purpose;",
          "professional advisers, auditors or authorised contractors subject to appropriate confidentiality requirements; and",
          "competent authorities where disclosure is required by law, legal process, regulatory requirement, public-safety considerations or the protection of legal rights.",
        ],
        "Service providers are given access only to information reasonably required for the services they perform and are expected to handle that information in accordance with applicable confidentiality, security and governmental requirements.",
        "ADCC does not sell, rent or trade personal information.",
      ],
    },
    {
      heading: "7. External Websites and Services",
      blocks: [
        "The website may contain links to services that are not operated by ADCC, including app stores, map or navigation services, social-media platforms, event-registration platforms, partner websites and other third-party services.",
        "Once you follow an external link, the collection and use of information by the external service is governed by that service’s own terms and privacy practices. ADCC does not control the privacy or security practices of independent third parties.",
        "We encourage you to review the relevant privacy notice before submitting personal information to an external service.",
      ],
    },
    {
      heading: "8. ADCC Mobile Application",
      blocks: [
        "The website may provide links allowing visitors to download or access an ADCC mobile application.",
        "This Privacy Policy governs information collected through this website and ADCC-operated web forms. Data processed within a mobile application is subject to the privacy information made available for that application, unless the application expressly states that this Policy also governs its processing activities.",
        "The Apple App Store, Google Play and other distribution platforms may independently collect information when you visit or use their services. Their handling of that information is governed by their respective privacy policies.",
      ],
    },
    {
      heading: "9. Information Concerning Children and Young People",
      blocks: [
        "ADCC promotes cycling among different age groups, including junior and young riders. Some Club programmes or events may therefore be open to individuals under the age of majority.",
        "The general website does not require a child to provide personal information merely to browse publicly available content.",
        "Where a programme, competition, event or other activity requires information relating to a minor, ADCC may require the involvement or authorisation of a parent or legal guardian in accordance with the nature of the activity and applicable requirements.",
        "Parents and guardians should not provide more information about a child than is reasonably required for the relevant service or activity.",
        "If you believe that personal information concerning a minor has been submitted inappropriately through the website, please contact ADCC so that the matter can be reviewed.",
      ],
    },
    {
      heading: "10. Information Security",
      blocks: [
        "ADCC takes reasonable administrative, organisational and technical measures to safeguard information handled through the website against unauthorised access, loss, misuse, alteration, disclosure or destruction.",
        "These measures may include access controls, secure infrastructure, system monitoring, technical safeguards, restricted administrative privileges and appropriate controls over service providers.",
        "No website or electronic transmission can, however, be guaranteed to be completely secure. Users should therefore exercise appropriate care when sending information online and should not submit confidential information through an ordinary web form where a more secure channel has been provided.",
      ],
    },
    {
      heading: "11. Storage and Retention",
      blocks: [
        "Information is retained only for as long as it is reasonably required for the purpose for which it was collected and in accordance with any applicable government records-management, archival, legal, audit or operational requirements.",
        "Retention periods may therefore differ according to the nature of the information.",
        "For example, correspondence concerning a general enquiry may not need to be retained for the same period as a record connected with an official programme, transaction, complaint, event or government activity.",
        "When information is no longer required and there is no obligation to retain it, it may be securely deleted, anonymised or otherwise disposed of in accordance with applicable procedures.",
      ],
    },
    {
      heading: "12. Processing and Storage Outside the UAE",
      blocks: [
        "Some technology or service providers supporting digital services may operate infrastructure in more than one jurisdiction.",
        "Where information is processed, accessed or stored outside the United Arab Emirates, ADCC will address such arrangements in accordance with the government policies, security requirements and other legal or contractual safeguards applicable to the Club and to the information concerned.",
      ],
    },
    {
      heading: "13. Your Information and Your Requests",
      blocks: [
        "Subject to the nature of the record and the requirements applicable to ADCC, you may contact us to:",
        [
          "ask whether we hold personal information concerning you;",
          "request access to information you have provided;",
          "ask for inaccurate or incomplete information to be corrected;",
          "update your contact details;",
          "withdraw a consent that you previously provided, where the relevant processing depends upon that consent;",
          "object to or ask about a particular use of your information; or",
          "request deletion of information where deletion is permitted and the information is not required to be preserved as an official, governmental, legal, security or operational record.",
        ],
        "Certain requests may require reasonable verification of identity before information is disclosed or changed.",
        "A request may also be subject to limitations where information must be retained under applicable government records-management rules, legal requirements, public-interest considerations, security requirements or the rights of another person.",
      ],
    },
    {
      heading: "14. Accuracy of Information",
      blocks: [
        "Where you provide personal information to ADCC, you are encouraged to ensure that it is accurate and current.",
        "If information you have provided changes — particularly contact details required for an ongoing enquiry, registration or service — you may contact ADCC to have it updated where appropriate.",
      ],
    },
    {
      heading: "15. Changes to This Privacy Policy",
      blocks: [
        "ADCC may amend this Privacy Policy from time to time to reflect changes in the website, Club services, technology, government requirements or applicable law.",
        "The latest version will be published on this page together with the date of the most recent revision.",
        "Where a change materially affects how information previously provided by users is handled, ADCC may provide additional notice where appropriate.",
      ],
    },
    {
      heading: "16. Contact Us",
      blocks: [
        "Questions, concerns or requests concerning this Privacy Policy or the handling of information through the website may be directed to:",
        [
          "Abu Dhabi Cycling Club",
          "Abu Dhabi, United Arab Emirates",
          "Email: info@adcyclingclub.ae",
          "Telephone: +971 2 654 5645",
        ],
        "For matters that fall within the remit of another Abu Dhabi Government entity, ADCC may direct the enquiry to the appropriate authority.",
      ],
    },
    {
      heading: "17. Governing Framework and Language",
      blocks: [
        "This Privacy Policy is to be read in accordance with the laws of the United Arab Emirates, the laws and regulations applicable in the Emirate of Abu Dhabi, and the governmental policies and requirements applicable to ADCC.",
        "The Policy may be published in Arabic and English. If any inconsistency arises between the two versions in relation to interpretation or application, the Arabic version shall prevail to the extent permitted by applicable law.",
      ],
    },
  ],
};

export const PRIVACY_POLICY_AR: PrivacyPolicyContent = {
  title: "سياسة الخصوصية",
  lastUpdated: "آخر تحديث: 3 سبتمبر 2026",
  intro: [
    "يحترم نادي أبوظبي للدراجات خصوصية الأفراد الذين يزورون موقعه الإلكتروني أو يتفاعلون معه، وتوضح هذه السياسة طبيعة البيانات التي قد تُجمع من خلال الموقع، والأغراض التي تُستخدم من أجلها، والحالات التي يجوز فيها مشاركتها، والتدابير المتخذة لحمايتها، والخيارات المتاحة للأفراد بشأن بياناتهم الشخصية.",
    "تسري هذه السياسة على الموقع الإلكتروني لنادي أبوظبي للدراجات، وعلى النماذج والخدمات الرقمية التي يديرها النادي مباشرةً من خلاله. أما عند الانتقال من الموقع إلى منصة خارجية أو تطبيق للهاتف المحمول أو نظام مستقل للتسجيل في الفعاليات أو غير ذلك من الخدمات التي تديرها جهات أخرى، فقد تخضع معالجة البيانات أيضاً لسياسات الخصوصية والشروط الخاصة بتلك الجهات.",
    "يمارس نادي أبوظبي للدراجات نشاطه في إمارة أبوظبي ضمن المنظومة الرياضية في الإمارة. وتُدار البيانات المتداولة من خلال الموقع وفق التشريعات واللوائح والسياسات الحكومية ومتطلبات أمن المعلومات المطبقة على النادي في دولة الإمارات العربية المتحدة وإمارة أبوظبي.",
  ],
  sections: [
    {
      heading: "1. البيانات التي نجمعها",
      blocks: [
        "يمكن تصفح معظم محتوى الموقع دون الإفصاح عن الهوية. ولا تُطلب البيانات الشخصية من الزائر، في الأصل، إلا عندما يختار تقديمها، فضلاً عن بعض البيانات الفنية المحدودة التي قد تنشأ تلقائياً أثناء استخدام الموقع.",
        { sub: "البيانات التي تقدمها إلينا" },
        "بحسب طبيعة استخدامك للموقع، قد نتلقى بيانات تشمل:",
        [
          "الاسم؛",
          "عنوان البريد الإلكتروني؛",
          "رقم الهاتف؛",
          "محتوى الاستفسار أو الرسالة أو الملاحظة المرسلة عبر نموذج \"تواصل معنا\"؛",
          "المراسلات اللاحقة التي تجري مع النادي بشأن الطلب أو الاستفسار؛",
          "البيانات التي تقدمها عند الاستفسار عن العضوية أو أنشطة ركوب الدراجات أو الفعاليات أو التدريبات أو المبادرات المجتمعية أو التحديات أو غيرها من خدمات النادي؛",
          "وأي بيانات أخرى تختار تقديمها عبر نموذج أو قناة تواصل يديرها النادي.",
        ],
        "يرجى عدم تضمين البيانات الحساسة أو المعلومات السرية ضمن الاستفسارات العامة إلا بالقدر الذي تقتضيه طبيعة الطلب.",
        "وقد تتطلب بعض الفعاليات أو البرامج أو الأنشطة بيانات إضافية تتصل، على سبيل المثال، بشروط المشاركة أو العمر أو بيانات التواصل في حالات الطوارئ. وفي هذه الحالات يجوز توضيح البيانات المطلوبة والغرض من استخدامها بصورة مستقلة ضمن إجراءات التسجيل الخاصة بالنشاط المعني.",
        { sub: "البيانات التي تنشأ أثناء استخدام الموقع" },
        "قد تُسجَّل تلقائياً بعض البيانات الفنية عند الدخول إلى الموقع. وبحسب التقنيات المفعلة، قد تشمل هذه البيانات:",
        [
          "عنوان بروتوكول الإنترنت؛",
          "نوع المتصفح وإصداره؛",
          "نوع الجهاز ونظام التشغيل؛",
          "اللغة المفضلة؛",
          "تاريخ الدخول إلى الموقع ووقته؛",
          "الصفحات التي تمت زيارتها والروابط التي جرى الانتقال إليها؛",
          "الموقع الإلكتروني أو المصدر الذي أحال الزائر إلى الموقع؛",
          "الملفات أو المواد التي جرى الاطلاع عليها أو تنزيلها؛",
          "معلومات عامة عن الموقع الجغرافي مستمدة من عنوان بروتوكول الإنترنت، مثل الدولة أو المنطقة؛",
          "والسجلات الفنية اللازمة لأمن الموقع وأدائه ومعالجة الأعطال.",
        ],
        "وتُستخدم هذه البيانات أساساً لتشغيل الموقع والمحافظة على أمنه وفهم أنماط الاستخدام العامة وتحسين التجربة الرقمية المقدمة للزوار.",
      ],
    },
    {
      heading: "2. أغراض استخدام البيانات",
      blocks: [
        "يجوز استخدام البيانات التي تُجمع من خلال الموقع للأغراض الآتية:",
        [
          "الرد على الاستفسارات والطلبات والملاحظات والشكاوى؛",
          "تقديم المعلومات المتعلقة بالنادي وأنشطته وفعالياته وفرص التدريب وبرامجه المجتمعية ومسارات ركوب الدراجات والتحديات؛",
          "إدارة الطلبات أو التسجيلات المقدمة عبر القنوات التي يديرها النادي؛",
          "التواصل بشأن فعالية أو برنامج أو خدمة أبديت اهتمامك بها؛",
          "ضمان استمرارية عمل الموقع وأمنه وسلامة أنظمته؛",
          "تشخيص المشكلات الفنية والحد من إساءة الاستخدام أو محاولات الاحتيال أو الدخول غير المصرح به؛",
          "دراسة أنماط استخدام الموقع وتحسين محتواه وسهولة الوصول إليه وأدائه وطريقة تصفحه؛",
          "حفظ السجلات الإدارية والتشغيلية اللازمة؛",
          "أداء المهام والاختصاصات الرسمية للنادي؛",
          "التنسيق، عند الحاجة، مع الجهات الحكومية أو الشركاء المعنيين بتقديم الخدمة المطلوبة؛",
          "والوفاء بالمتطلبات القانونية أو التنظيمية أو الحكومية أو الرقابية أو الأمنية أو المتعلقة بإدارة السجلات.",
        ],
        "لا يستخدم النادي البيانات الشخصية المقدمة عبر الموقع في أغراض تجارية لا صلة لها بالغرض الذي جُمعت من أجله، ولا يبيع البيانات الشخصية.",
      ],
    },
    {
      heading: "3. التواصل معك",
      blocks: [
        "عند تواصلك مع النادي، يجوز استخدام بيانات الاتصال التي قدمتها للرد عليك ومتابعة المراسلات المرتبطة باستفسارك.",
        "وإذا طلبت صراحةً تلقي مستجدات بشأن فعالية أو نشاط أو برنامج أو خدمة يقدمها النادي، فيجوز استخدام بيانات التواصل لهذا الغرض. ولا يتجاوز هذا التواصل، في الأصل، النطاق الذي قُدمت البيانات من أجله ما لم توافق بصورة مستقلة على تلقي أنواع أخرى من المعلومات.",
        "ويمكنك طلب إيقاف المراسلات الاختيارية في أي وقت عبر بيانات التواصل الواردة في هذه السياسة أو من خلال وسيلة إلغاء الاشتراك التي قد تتضمنها الرسالة.",
      ],
    },
    {
      heading: "4. ملفات تعريف الارتباط والتقنيات المشابهة",
      blocks: [
        "قد يستخدم الموقع ملفات تعريف الارتباط أو تقنيات مشابهة متى كانت لازمة لتشغيله أو أداء وظائفه أو ضمان أمنه أو قياس أدائه.",
        "وملفات تعريف الارتباط هي ملفات بيانات صغيرة يحفظها المتصفح أو الجهاز عند زيارة الموقع. وبحسب إعدادات الموقع، قد تُستخدم من أجل:",
        [
          "تمكين الوظائف الأساسية للموقع؛",
          "حفظ بعض التفضيلات، مثل اختيار اللغة؛",
          "دعم التصفح الآمن والموثوق؛",
          "فهم الاستخدام العام للموقع ومستوى أدائه؛",
          "واكتشاف المشكلات الفنية أو الأمنية ومعالجتها.",
        ],
        "ولا تقر هذه السياسة باستخدام ملفات تعريف ارتباط لأغراض الإعلان الموجّه أو بناء الملفات السلوكية ما لم تُفعَّل مثل هذه التقنيات بصورة صريحة على الموقع.",
        "يمكن التحكم بملفات تعريف الارتباط أو حذفها من إعدادات المتصفح، إلا أن تعطيل بعضها قد يؤثر في عمل بعض خصائص الموقع.",
        "ومتى استلزم القانون أو السياسة الحكومية الحصول على موافقة قبل تشغيل أي تقنية غير ضرورية لعمل الموقع، تُستخدم آلية الموافقة المناسبة قبل تفعيلها.",
      ],
    },
    {
      heading: "5. قياس أداء الموقع",
      blocks: [
        "يجوز للنادي استخدام أدوات فنية أو تحليلية معتمدة للحصول على بيانات إحصائية عن حركة الزيارة وأداء الموقع.",
        "وقد تشمل تلك البيانات، عند استخدام هذه الأدوات، عدد الزيارات إلى الصفحات ومصادر الزيارات العامة وأنواع الأجهزة والمتصفحات وأنماط التفاعل مع الموقع. ويُحرص، كلما كان ذلك ممكناً عملياً، على الاستفادة من هذه البيانات في صورة إجمالية أو لا تكشف هوية المستخدم.",
        "ويقتصر الغرض من قياس أداء الموقع على التحقق من كفاءة عمله وفهم استخدامه وتحديد الجوانب التي يمكن تطويرها في المحتوى والخدمات والمعلومات المتاحة للجمهور.",
      ],
    },
    {
      heading: "6. مشاركة البيانات",
      blocks: [
        "لا تُشارك البيانات إلا عند وجود مقتضٍ تشغيلي أو حكومي أو قانوني أو أمني مناسب.",
        "وقد تشمل الجهات التي يجوز مشاركة البيانات معها، بحسب الحاجة:",
        [
          "مجلس أبوظبي الرياضي والجهات الحكومية المعنية في إمارة أبوظبي؛",
          "الجهات الحكومية الاتحادية أو المحلية متى كان الإفصاح مطلوباً أو مصرحاً به؛",
          "الجهات التي تقدم للنادي خدمات الاستضافة أو تطوير الموقع أو صيانته أو الاتصالات أو أمن المعلومات؛",
          "الشركاء المشاركون في تنظيم فعالية أو برنامج أو نشاط مجتمعي أو خدمة طلب المستخدم الاستفادة منها، بالقدر اللازم لتقديم تلك الخدمة؛",
          "المستشارين والمدققين والمتعاقدين المخولين، مع مراعاة متطلبات السرية الملائمة؛",
          "والسلطات المختصة متى اقتضى الإفصاح تشريع نافذ أو إجراء قانوني أو متطلب تنظيمي أو اعتبارات السلامة العامة أو حماية الحقوق القانونية.",
        ],
        "ولا يُمنح مزودو الخدمات سوى القدر من البيانات اللازم لأداء المهام المسندة إليهم، ويُتوقع منهم التعامل معها وفق متطلبات السرية والأمن والمتطلبات الحكومية المعمول بها.",
        "ولا يبيع نادي أبوظبي للدراجات البيانات الشخصية أو يؤجرها أو يتاجر بها.",
      ],
    },
    {
      heading: "7. المواقع والخدمات الخارجية",
      blocks: [
        "قد يتضمن الموقع روابط تؤدي إلى خدمات لا يديرها النادي، ومنها متاجر التطبيقات وخدمات الخرائط أو الملاحة ومنصات التواصل الاجتماعي ومنصات التسجيل في الفعاليات ومواقع الشركاء وغيرها من الخدمات الخارجية.",
        "وبمجرد الانتقال إلى خدمة خارجية، تصبح عملية جمع البيانات واستخدامها من جانب تلك الخدمة خاضعة لشروطها وسياسة الخصوصية المعتمدة لديها. ولا يتحكم النادي في ممارسات الخصوصية أو أمن المعلومات لدى الجهات المستقلة عنه.",
        "لذلك يُنصح بمراجعة سياسة الخصوصية الخاصة بأي خدمة خارجية قبل تقديم بيانات شخصية من خلالها.",
      ],
    },
    {
      heading: "8. تطبيق نادي أبوظبي للدراجات",
      blocks: [
        "قد يتيح الموقع روابط لتنزيل تطبيق نادي أبوظبي للدراجات أو الانتقال إليه.",
        "تسري هذه السياسة على البيانات التي تُجمع من خلال الموقع الإلكتروني والنماذج الإلكترونية التي يديرها النادي مباشرةً. أما البيانات التي تتم معالجتها داخل التطبيق، فتخضع لإشعار أو سياسة الخصوصية المنشورة لذلك التطبيق، ما لم ينص التطبيق صراحةً على سريان هذه السياسة عليه أيضاً.",
        "كما قد تجمع متاجر التطبيقات، ومنها متجر تطبيقات \"آبل\" ومتجر \"جوجل بلاي\"، بيانات بصورة مستقلة عند استخدام منصاتها، وتخضع تلك البيانات لسياسات الخصوصية الخاصة بها.",
      ],
    },
    {
      heading: "9. بيانات الأطفال والناشئين",
      blocks: [
        "يعمل نادي أبوظبي للدراجات على نشر رياضة ركوب الدراجات بين مختلف الفئات العمرية، بما فيها فئات الناشئين والشباب، ولذلك قد تكون بعض برامج النادي أو فعالياته متاحة لمن هم دون سن الرشد.",
        "ولا يتطلب مجرد تصفح المحتوى العام للموقع من الطفل تقديم بيانات شخصية.",
        "أما إذا تطلب برنامج أو مسابقة أو فعالية أو نشاط معين تقديم بيانات تخص قاصراً، فيجوز للنادي اشتراط مشاركة أحد الوالدين أو الولي القانوني أو الحصول على موافقته، وفق طبيعة النشاط والمتطلبات المطبقة عليه.",
        "وينبغي على الوالدين والأولياء عدم تقديم بيانات عن الطفل تتجاوز القدر اللازم للبرنامج أو النشاط المعني.",
        "وإذا تبين لك أن بيانات شخصية تخص قاصراً قد أُرسلت إلى الموقع على نحو غير مناسب، فيرجى التواصل مع النادي لمراجعة الأمر واتخاذ الإجراء الملائم.",
      ],
    },
    {
      heading: "10. أمن المعلومات",
      blocks: [
        "يتخذ النادي تدابير إدارية وتنظيمية وفنية معقولة لحماية البيانات المتداولة عبر الموقع من الدخول غير المصرح به أو الفقد أو إساءة الاستخدام أو التعديل أو الإفصاح أو الإتلاف.",
        "وقد تشمل هذه التدابير ضوابط الوصول إلى الأنظمة، والبنية التقنية الآمنة، ومراقبة الأنظمة، ووسائل الحماية الفنية، وتقييد الصلاحيات الإدارية، وفرض ضوابط مناسبة على مزودي الخدمات.",
        "ومع ذلك، لا توجد وسيلة إلكترونية أو موقع إلكتروني يمكن ضمان أمنه بصورة مطلقة. ولذلك ينبغي توخي العناية عند إرسال المعلومات عبر الإنترنت، وعدم تقديم معلومات سرية من خلال نموذج إلكتروني اعتيادي متى كانت هناك قناة أكثر أماناً مخصصة لهذا الغرض.",
      ],
    },
    {
      heading: "11. حفظ البيانات ومدد الاحتفاظ بها",
      blocks: [
        "لا تُحتفظ البيانات لمدة تتجاوز ما يلزم بصورة معقولة لتحقيق الغرض الذي جُمعت من أجله، مع مراعاة متطلبات إدارة السجلات الحكومية والأرشفة والتدقيق والالتزامات القانونية والتشغيلية المطبقة على النادي.",
        "ولهذا قد تختلف مدة الاحتفاظ بحسب طبيعة السجل.",
        "فالمراسلات المتعلقة باستفسار عام، على سبيل المثال، قد لا تستلزم مدة الاحتفاظ نفسها المقررة لسجل مرتبط ببرنامج رسمي أو معاملة أو شكوى أو فعالية أو نشاط حكومي.",
        "وعندما تنتفي الحاجة إلى البيانات ولا يوجد ما يوجب الاحتفاظ بها، يجوز حذفها بصورة آمنة أو إخفاء هوية أصحابها أو التخلص منها وفق الإجراءات المعتمدة.",
      ],
    },
    {
      heading: "12. معالجة البيانات أو حفظها خارج دولة الإمارات",
      blocks: [
        "قد يستخدم بعض مزودي الخدمات التقنية الداعمة للخدمات الرقمية بنية تحتية موزعة على أكثر من دولة.",
        "وإذا اقتضت الخدمة معالجة البيانات أو الوصول إليها أو حفظها خارج دولة الإمارات العربية المتحدة، فيتعامل النادي مع هذه الترتيبات وفق السياسات الحكومية ومتطلبات أمن المعلومات والضمانات القانونية أو التعاقدية المنطبقة على النادي وعلى طبيعة البيانات المعنية.",
      ],
    },
    {
      heading: "13. طلباتك المتعلقة ببياناتك",
      blocks: [
        "بحسب طبيعة السجل والمتطلبات المطبقة على النادي، يمكنك التواصل معنا من أجل:",
        [
          "الاستفسار عما إذا كانت لدينا بيانات شخصية تخصك؛",
          "طلب الاطلاع على البيانات التي سبق أن قدمتها؛",
          "طلب تصحيح البيانات غير الدقيقة أو استكمال البيانات الناقصة؛",
          "تحديث بيانات التواصل الخاصة بك؛",
          "سحب موافقة سبق أن منحتها، متى كانت المعالجة المعنية قائمة على تلك الموافقة؛",
          "الاستفسار عن استخدام معين لبياناتك أو الاعتراض عليه حيثما كان ذلك متاحاً؛",
          "أو طلب حذف البيانات عندما يكون الحذف جائزاً ولا تكون البيانات واجبة الحفظ بوصفها سجلاً رسمياً أو حكومياً أو قانونياً أو أمنياً أو تشغيلياً.",
        ],
        "وقد يتطلب تنفيذ بعض الطلبات التحقق من هوية مقدم الطلب بصورة معقولة قبل الإفصاح عن البيانات أو تعديلها.",
        "كما قد تخضع بعض الطلبات لقيود تفرضها قواعد حفظ السجلات الحكومية أو المتطلبات القانونية أو اعتبارات المصلحة العامة أو الأمن أو حقوق أشخاص آخرين.",
      ],
    },
    {
      heading: "14. دقة البيانات",
      blocks: [
        "عند تقديم بيانات شخصية إلى النادي، يُرجى الحرص على أن تكون صحيحة ومحدثة.",
        "وإذا طرأ تغيير على البيانات التي سبق تقديمها، ولا سيما بيانات التواصل اللازمة لمتابعة استفسار أو تسجيل أو خدمة قائمة، فيمكن التواصل مع النادي لطلب تحديثها متى كان ذلك مناسباً.",
      ],
    },
    {
      heading: "15. تعديل سياسة الخصوصية",
      blocks: [
        "يجوز لنادي أبوظبي للدراجات تحديث هذه السياسة من وقت إلى آخر بما يعكس أي تغيير في الموقع أو خدمات النادي أو التقنيات المستخدمة أو المتطلبات الحكومية أو التشريعات ذات الصلة.",
        "وتُنشر النسخة الأحدث من السياسة في هذه الصفحة، مع بيان تاريخ آخر تحديث.",
        "وإذا ترتب على أي تعديل جوهري تغيير في طريقة التعامل مع بيانات سبق أن قدمها المستخدمون، فيجوز للنادي تقديم إشعار إضافي متى كان ذلك مناسباً.",
      ],
    },
    {
      heading: "16. التواصل معنا",
      blocks: [
        "يمكن توجيه الاستفسارات أو الملاحظات أو الطلبات المتعلقة بهذه السياسة أو بطريقة التعامل مع البيانات عبر الموقع إلى:",
        [
          "نادي أبوظبي للدراجات",
          "أبوظبي، دولة الإمارات العربية المتحدة",
          "البريد الإلكتروني: info@adcyclingclub.ae",
          "الهاتف: ‎+971 2 654 5645",
        ],
        "وإذا كان الطلب يندرج ضمن اختصاص جهة حكومية أخرى في إمارة أبوظبي، فيجوز للنادي إحالة صاحبه إلى الجهة المختصة.",
      ],
    },
    {
      heading: "17. الإطار القانوني واللغة المعتمدة",
      blocks: [
        "تُقرأ هذه السياسة وتُفسر في ضوء التشريعات النافذة في دولة الإمارات العربية المتحدة، والتشريعات واللوائح السارية في إمارة أبوظبي، والسياسات والمتطلبات الحكومية المطبقة على نادي أبوظبي للدراجات.",
        "ويجوز نشر هذه السياسة باللغتين العربية والإنجليزية. وفي حال وجود أي اختلاف بين النسختين في التفسير أو التطبيق، تكون النسخة العربية هي المعتمدة، بالقدر الذي تجيزه التشريعات النافذة.",
      ],
    },
  ],
};
