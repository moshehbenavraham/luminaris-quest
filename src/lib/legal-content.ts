export const legalContent = {
  lastUpdated: 'June 2025',

  termsOfService: {
    title: 'Terms of Service',
    sections: [
      {
        title: '1. Open Source Licenses',
        content: [
          "Luminari's Quest is an open-source project. The codebase and game mechanics are licensed under:",
          {
            list: [
              '**MIT License** for all original code',
              '**Open Game License (OGL) v1.0a / Open RPG Creative License (ORC)** for Pathfinder-derived game mechanics and content',
            ],
          },
          'See LICENSE and licenses/ directory for full license texts and attributions.',
          {
            title: 'Key points:',
            content: [
              'You may use, modify, and distribute the code as long as you follow the terms of the included licenses',
              'Any third-party code, libraries, or RPG systems are credited and included according to their respective licenses',
            ],
          },
        ],
      },
      {
        title: '2. Attribution and Compliance',
        content: [
          {
            list: [
              'Pathfinder 2e mechanics are used under the ORC License. All proprietary Paizo/Pathfinder Product Identity is excluded',
              '\"Built with Bolt.new\" — all core logic and UI were developed in Bolt.new',
              'See OGL/ORC compliance notice for detailed breakdown',
            ],
          },
        ],
      },
      {
        title: '3. Use of Online Services',
        content: [
          'By using the live demo or web app:',
          {
            list: [
              'You agree that the software is provided **as-is, without any warranty**',
              'We do not guarantee service uptime, data availability, or account recovery',
              'If you create an account or save progress (via Supabase), you must use accurate information and keep your credentials private',
              'No personally identifiable information (PII) is collected for any commercial purpose',
            ],
          },
        ],
      },
      {
        title: '4. User Conduct',
        content: [
          {
            list: [
              "You must not use Luminari's Quest for any illegal, harmful, or abusive activities",
              'Do not attempt to disrupt, reverse-engineer, or misuse the application, its APIs, or any third-party integrations',
              'Respect the spirit of the open-source and therapeutic gaming community',
            ],
          },
        ],
      },
      {
        title: '5. Disclaimer and Limitation of Liability',
        content: [
          {
            list: [
              '**No Warranty:** The app and all associated services are provided AS IS, with no guarantees of reliability, accuracy, or fitness for any purpose',
              '**Limitation:** Under no circumstances will the developers, maintainers, or contributors be liable for any damages arising from the use or inability to use this software or its services',
              'Game outcomes, narratives, and any AI-generated content are for entertainment and educational purposes only—they are not a substitute for professional mental health support',
            ],
          },
        ],
      },
    ],
  },

  privacyPolicy: {
    title: 'Privacy Policy',
    sections: [
      {
        title: '6. Information We Collect',
        content: [
          'We may collect the following types of information:',
          {
            list: [
              '**Account Data:** If you sign up or save progress, we collect your email address and login information via our authentication provider (Supabase)',
              '**Usage Data:** We may collect data on how you use the app (pages visited, choices made, device/browser type, approximate location by IP)',
              '**Cookies & Local Storage:** We use cookies/local storage for session management and performance, not for tracking or advertising',
              '**No Sensitive Data:** We do not knowingly collect sensitive personal information (e.g., health, racial, or biometric data)',
            ],
          },
        ],
      },
      {
        title: '7. How We Use Your Information',
        content: [
          'We use collected data to:',
          {
            list: [
              "Operate and improve Luminari's Quest and its features",
              'Provide save/load functionality and personalize your experience',
              'Maintain the security, reliability, and integrity of our app',
              'Comply with legal requirements',
            ],
          },
          '**We do not sell, rent, or share your personal information with third parties for marketing purposes.** Some data (e.g., saved progress) is stored on third-party services (e.g., Supabase, Netlify) as required for basic functionality.',
        ],
      },
      {
        title: '8. Data Security',
        content: [
          'We use reasonable technical and organizational measures to protect your data, including:',
          {
            list: [
              'Encrypted connections (HTTPS)',
              'Secure authentication and access controls',
              'Regular review of third-party services and dependencies',
            ],
          },
          'However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.',
        ],
      },
      {
        title: '9. User Rights',
        content: [
          'Depending on your location, you may have the right to:',
          {
            list: [
              'Access, correct, or delete your personal data',
              'Withdraw consent or object to processing',
              'Request a copy of your data (data portability)',
              'Lodge a complaint with a data protection authority',
            ],
          },
          'To exercise your rights, email us at [your-contact@example.com](mailto:your-contact@example.com).',
        ],
      },
      {
        title: '10. Third-Party Services',
        content: [
          'We rely on third-party providers (e.g., Supabase for auth, Netlify for hosting). These providers have their own privacy practices; we recommend reviewing their policies.',
        ],
      },
      {
        title: "11. Children's Privacy",
        content: [
          "Luminari's Quest is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, contact us immediately for removal.",
        ],
      },
    ],
  },

  cookiePolicy: {
    title: 'Cookie Policy',
    sections: [
      {
        title: '17. What Are Cookies',
        content: [
          'Cookies are small text files that are placed on your computer or mobile device when you visit our website. These files help us provide you with a better user experience by remembering your preferences and enabling certain functionality.',
        ],
      },
      {
        title: '18. Types of Cookies We Use',
        content: [
          '#### **Essential Cookies**',
          'These cookies are necessary for the website to function properly and cannot be disabled:',
          {
            list: [
              '**Session cookies:** Enable you to navigate through the site and use basic features',
              '**Authentication cookies:** Remember your login status when you create an account',
              '**Security cookies:** Help protect against fraud and maintain site security',
            ],
          },
          '#### **Functional Cookies**',
          'These cookies enhance your experience but are not essential:',
          {
            list: [
              '**Preference cookies:** Remember your settings and choices (language, theme, etc.)',
              '**Progress cookies:** Save your game progress and character data locally',
            ],
          },
          '#### **Analytics Cookies**',
          'We may use analytics cookies to understand how visitors interact with our website:',
          {
            list: [
              '**Usage statistics:** Help us improve the site by understanding which features are most popular',
              '**Performance monitoring:** Identify and fix technical issues',
            ],
          },
        ],
      },
      {
        title: '19. Third-Party Cookies',
        content: [
          'Some cookies may be set by third-party services we use:',
          {
            list: [
              '**Supabase:** For authentication and data storage',
              '**Netlify:** For website hosting and performance',
              '**Open-source analytics tools:** If implemented for basic usage statistics',
            ],
          },
        ],
      },
      {
        title: '20. Managing Your Cookie Preferences',
        content: [
          'You can control cookies through your browser settings:',
          {
            list: [
              '**Accept all cookies:** Allow all cookies for the best user experience',
              '**Block all cookies:** Note that this may limit website functionality',
              '**Selective blocking:** Choose which types of cookies to allow',
            ],
          },
          'Most browsers allow you to:',
          {
            list: [
              'View cookies that have been set',
              'Delete cookies individually or all at once',
              'Block cookies from specific sites',
              'Block third-party cookies',
              'Clear all cookies when you close the browser',
            ],
          },
        ],
      },
    ],
  },

  contact: {
    title: 'Contact Information',
    sections: [
      {
        title: '23. Get in Touch',
        content: [
          'For any questions, concerns, or requests regarding these Terms of Service, Privacy Policy, or Cookie Policy, please contact us through our website:',
          '**Contact Form:** [https://aiwithapex.com/#contact](https://aiwithapex.com/#contact)',
          'We aim to respond to all inquiries within 48 hours during business days.',
        ],
      },
    ],
  },
};
