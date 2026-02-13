// All bilingual content for Afya+ WhatsApp Bot
// WhatsApp limits: button title 20 chars, list row title 24 chars,
// row description 72 chars, body 1024 chars, list button text 20 chars

const CONTENT = {
  // ============ WELCOME ============
  welcome: {
    body: "Habari! Karibu *Afya+* \u2014 chaguo bora kwa afya yako.\n\nTunakusogeza karibu na matibabu kupata suluhisho bora kwa afya yako.\n\n_Welcome to *Afya+* \u2014 your best health choice._\n\nChagua lugha / Choose language:",
    buttons: [
      { id: "lang_sw", title: "Kiswahili" },
      { id: "lang_en", title: "English" },
    ],
  },

  // ============ MAIN MENU ============
  mainMenu: {
    sw: {
      body: "Afya+ inakupatia huduma zifuatazo. Chagua huduma unayohitaji:",
      buttonText: "Chagua Huduma",
      sections: [
        {
          title: "Huduma Zetu",
          rows: [
            { id: "sw_gp", title: "Daktari Jumla (GP)", description: "Ushauri na matibabu ya kawaida kwa simu" },
            { id: "sw_specialist", title: "Daktari Bingwa", description: "Wasiliana na daktari wa fani maalum" },
            { id: "sw_home", title: "Daktari Nyumbani", description: "Huduma za daktari hadi mlangoni pako" },
            { id: "sw_corporate", title: "Afya Kazini", description: "Suluhisho la afya kwa mashirika" },
            { id: "sw_pharmacy", title: "Dawa na Vifaa", description: "Ushauri wa dawa na vifaa tiba" },
          ],
        },
      ],
    },
    en: {
      body: "Afya+ offers the following services. Choose the service you need:",
      buttonText: "Choose Service",
      sections: [
        {
          title: "Our Services",
          rows: [
            { id: "en_gp", title: "General Doctor (GP)", description: "Consultation and treatment via phone" },
            { id: "en_specialist", title: "Specialist Doctor", description: "Connect with a specialist doctor" },
            { id: "en_home", title: "Home Doctor", description: "Medical care at your doorstep" },
            { id: "en_corporate", title: "Corporate Health", description: "Health solutions for organizations" },
            { id: "en_pharmacy", title: "Pharmacy & Supplies", description: "Medicine advice and health products" },
          ],
        },
      ],
    },
  },

  // ============ GP ============
  gp: {
    sw: {
      body: "Afya+ inakuunganisha na daktari kwa ushauri na matibabu papo hapo kupitia simu.\n\nTibu magonjwa kama: Mafua, Homa, Kisukari, Pumu, Shinikizo la Damu, UTI, Maumivu ya Mgongo na mengine.\n\nChagua njia ya kuwasiliana:",
      buttons: [
        { id: "sw_gp_chat", title: "Chat - TZS 3,000" },
        { id: "sw_gp_video", title: "Video - TZS 5,000" },
        { id: "sw_menu", title: "Rudi Menyu" },
      ],
    },
    en: {
      body: "Afya+ connects you with a doctor for instant consultation via phone.\n\nTreat conditions like: Cold, Flu, Diabetes, Asthma, Hypertension, UTI, Back Pain and more.\n\nChoose how to connect:",
      buttons: [
        { id: "en_gp_chat", title: "Chat - TZS 3,000" },
        { id: "en_gp_video", title: "Video - TZS 5,000" },
        { id: "en_menu", title: "Back to Menu" },
      ],
    },
  },

  // ============ SPECIALIST ============
  specialist: {
    sw: {
      body: "Wasiliana na daktari bingwa kwa dalili endelevu au magonjwa ya muda mrefu.\n\nFani: Ngozi, Uzazi, Watoto, Moyo, Mifupa, Mmeng'enyo na nyingine.\n\nChagua njia ya kuwasiliana:",
      buttons: [
        { id: "sw_sp_chat", title: "Chat - TZS 25,000" },
        { id: "sw_sp_video", title: "Video - TZS 30,000" },
        { id: "sw_menu", title: "Rudi Menyu" },
      ],
    },
    en: {
      body: "Connect with a specialist for persistent symptoms or chronic conditions.\n\nFields: Dermatology, OB/GYN, Pediatrics, Cardiology, Orthopedics, GI and more.\n\nChoose how to connect:",
      buttons: [
        { id: "en_sp_chat", title: "Chat - TZS 25,000" },
        { id: "en_sp_video", title: "Video - TZS 30,000" },
        { id: "en_menu", title: "Back to Menu" },
      ],
    },
  },

  // ============ HOME DOCTOR ============
  home: {
    sw: {
      body: "Afya+ inaleta daktari nyumbani kwako. Epuka foleni za kliniki \u2014 sisi tunakuja kwako.\n\nChagua huduma:",
      buttonText: "Chagua Huduma",
      sections: [
        {
          title: "Huduma za Nyumbani",
          rows: [
            { id: "sw_home_urgent", title: "Matibabu ya Haraka", description: "Magonjwa ya kawaida nyumbani - TZS 30,000" },
            { id: "sw_home_procedure", title: "Taratibu Tiba", description: "IV, vidonda, vipimo nyumbani - TZS 30,000" },
            { id: "sw_home_amd", title: "Mwongozo AMD", description: "Maamuzi ya matibabu ya siku za usoni - TZS 50,000" },
            { id: "sw_home_sda", title: "Tathmini SDA", description: "Tathmini ya ulemavu nyumbani - TZS 30,000" },
          ],
        },
      ],
    },
    en: {
      body: "Afya+ brings a doctor to your home. Skip clinic queues \u2014 we come to you.\n\nChoose a service:",
      buttonText: "Choose Service",
      sections: [
        {
          title: "Home Services",
          rows: [
            { id: "en_home_urgent", title: "Urgent Care", description: "Common illness treatment at home - TZS 30,000" },
            { id: "en_home_procedure", title: "Medical Procedure", description: "IV, wound care, sample collection - TZS 30,000" },
            { id: "en_home_amd", title: "Advanced Directives", description: "Medical directive consultation - TZS 50,000" },
            { id: "en_home_sda", title: "Disability Assessment", description: "Professional assessment at home - TZS 30,000" },
          ],
        },
      ],
    },
  },

  // ============ HOME SUB-SERVICES DETAILS ============
  homeDetails: {
    sw: {
      home_urgent: {
        body: "*Matibabu ya Haraka* \u2014 TZS 30,000\n\nPata huduma ya matibabu nyumbani kwa magonjwa ya kawaida kama mafua, maambukizi madogo na dalili nyinginezo.",
      },
      home_procedure: {
        body: "*Taratibu Tiba* \u2014 TZS 30,000\n\nHuduma za kitabibu nyumbani: usimamizi wa dawa, dripu (IV), kusafisha vidonda, huduma ya kwanza, na uchukuaji wa sampuli.",
      },
      home_amd: {
        body: "*Mwongozo wa AMD* \u2014 TZS 50,000\n\nAMD ni waraka wa kisheria wa maamuzi yako ya matibabu ya siku za usoni. Daktari atakusaidia kufanya maamuzi sahihi.",
      },
      home_sda: {
        body: "*Tathmini ya SDA* \u2014 TZS 30,000\n\nTathmini ya kitaalamu nyumbani kuangalia uwezo wa shughuli za kila siku: kuoga, kuvaa, kula, na kutembea.",
      },
    },
    en: {
      home_urgent: {
        body: "*Urgent Care* \u2014 TZS 30,000\n\nGet in-person medical care at home for common illnesses like cold, minor infections and other non-emergency symptoms.",
      },
      home_procedure: {
        body: "*Medical Procedure* \u2014 TZS 30,000\n\nProfessional medical services at home: medication management, IV drips, wound cleaning, first aid, and sample collection.",
      },
      home_amd: {
        body: "*Advanced Medical Directives* \u2014 TZS 50,000\n\nAMD is a legal document for your future medical decisions. A doctor will guide you through the process.",
      },
      home_sda: {
        body: "*Disability Assessment* \u2014 TZS 30,000\n\nProfessional assessment at home to evaluate daily activity capabilities: bathing, dressing, eating, and mobility.",
      },
    },
  },

  // ============ CORPORATE ============
  corporate: {
    sw: {
      body: "Huduma za afya kwa mashirika kutoka Afya+. Kwa kampuni kubwa, SME, au kampuni changa.\n\nChagua huduma:",
      buttonText: "Chagua Huduma",
      sections: [
        {
          title: "Huduma za Mashirika",
          rows: [
            { id: "sw_corp_pre", title: "Vipimo vya Ajira", description: "Uchunguzi wa afya kabla ya kuanza kazi - TZS 10,000" },
            { id: "sw_corp_screen", title: "Uchunguzi na Chanjo", description: "Chanjo na screening kwa wafanyakazi - TZS 10,000" },
            { id: "sw_corp_wellness", title: "Semina za Afya", description: "Warsha na mihadhara ya afya kazini - TZS 10,000" },
          ],
        },
      ],
    },
    en: {
      body: "Corporate health services from Afya+. For large companies, SMEs, or startups.\n\nChoose a service:",
      buttonText: "Choose Service",
      sections: [
        {
          title: "Corporate Services",
          rows: [
            { id: "en_corp_pre", title: "Pre-Employment Check", description: "Health screening before employment - TZS 10,000" },
            { id: "en_corp_screen", title: "Screening & Vaccines", description: "Employee screening and vaccination - TZS 10,000" },
            { id: "en_corp_wellness", title: "Wellness Programs", description: "Health workshops and seminars - TZS 10,000" },
          ],
        },
      ],
    },
  },

  // ============ CORPORATE SUB-SERVICE DETAILS ============
  corpDetails: {
    sw: {
      corp_pre: {
        body: "*Vipimo vya Ajira* \u2014 TZS 10,000\n\nUchunguzi wa afya mapema huwezesha usaidizi wa kitabibu kwa wakati kabla ya kuanza kazi.",
      },
      corp_screen: {
        body: "*Uchunguzi na Chanjo* \u2014 TZS 10,000\n\nHuduma za chanjo hupunguza kuenea kwa magonjwa mahali pa kazi na kuwalinda wafanyakazi.",
      },
      corp_wellness: {
        body: "*Semina za Afya* \u2014 TZS 10,000\n\nMihadhara na warsha za afya ya akili, umakinifu, usingizi bora, na ufikiaji wa malengo. Tunakuja kwako.",
      },
    },
    en: {
      corp_pre: {
        body: "*Pre-Employment Check* \u2014 TZS 10,000\n\nEarly health screening enables timely medical support before starting work.",
      },
      corp_screen: {
        body: "*Screening & Vaccines* \u2014 TZS 10,000\n\nVaccination services reduce workplace disease spread and protect at-risk employees.",
      },
      corp_wellness: {
        body: "*Wellness Programs* \u2014 TZS 10,000\n\nExpert-led health talks and workshops on mental health, mindfulness, sleep, and goal setting. We come to you.",
      },
    },
  },

  // ============ PHARMACY ============
  pharmacy: {
    sw: {
      body: "*Dawa na Vifaa Tiba* \u2014 TZS 4,000\n\nNunua bidhaa za afya kwa ushauri wa kitaalamu kutoka kwa madaktari, pamoja na maelekezo sahihi ya matumizi ya dawa.",
    },
    en: {
      body: "*Pharmacy & Supplies* \u2014 TZS 4,000\n\nBuy health products with professional guidance from doctors, including proper medication directions.",
    },
  },

  // ============ BOOKING FLOW ============
  booking: {
    sw: {
      askName: "Tafadhali andika *jina lako kamili*:",
      askPhone: "Asante! Sasa andika *namba yako ya simu*:\n\n(Mfano: 0712345678)",
      invalidPhone: "Namba ya simu si sahihi. Tafadhali andika namba sahihi:\n\n(Mfano: 0712345678)",
      confirm: (name, phone, service, price) =>
        `*Thibitisha Miadi Yako*\n\nJina: ${name}\nSimu: ${phone}\nHuduma: ${service}\nBei: ${price}\n\nThibitisha ili kuendelea:`,
      success: (name) =>
        `Asante ${name}! Miadi yako imepokewa.\n\nTimu yetu itawasiliana nawe hivi karibuni.\n\n_Malipo yatafanywa baadaye kupitia Pesapal._`,
      cancelled: "Miadi imeghairiwa. Unaweza kuanza upya wakati wowote.",
      confirmBtn: "Thibitisha",
      cancelBtn: "Ghairi",
      menuBtn: "Menyu Kuu",
    },
    en: {
      askName: "Please type your *full name*:",
      askPhone: "Thank you! Now type your *phone number*:\n\n(Example: 0712345678)",
      invalidPhone: "Invalid phone number. Please enter a valid number:\n\n(Example: 0712345678)",
      confirm: (name, phone, service, price) =>
        `*Confirm Your Booking*\n\nName: ${name}\nPhone: ${phone}\nService: ${service}\nPrice: ${price}\n\nConfirm to proceed:`,
      success: (name) =>
        `Thank you ${name}! Your booking has been received.\n\nOur team will contact you shortly.\n\n_Payment will be processed via Pesapal._`,
      cancelled: "Booking cancelled. You can start again anytime.",
      confirmBtn: "Confirm",
      cancelBtn: "Cancel",
      menuBtn: "Main Menu",
    },
  },

  // ============ SERVICE LABELS (for confirmation) ============
  serviceLabels: {
    sw: {
      gp_chat: { name: "Daktari Jumla (Chat)", price: "TZS 3,000" },
      gp_video: { name: "Daktari Jumla (Video)", price: "TZS 5,000" },
      sp_chat: { name: "Daktari Bingwa (Chat)", price: "TZS 25,000" },
      sp_video: { name: "Daktari Bingwa (Video)", price: "TZS 30,000" },
      home_urgent: { name: "Matibabu ya Haraka", price: "TZS 30,000" },
      home_procedure: { name: "Taratibu Tiba", price: "TZS 30,000" },
      home_amd: { name: "Mwongozo AMD", price: "TZS 50,000" },
      home_sda: { name: "Tathmini SDA", price: "TZS 30,000" },
      corp_pre: { name: "Vipimo vya Ajira", price: "TZS 10,000" },
      corp_screen: { name: "Uchunguzi na Chanjo", price: "TZS 10,000" },
      corp_wellness: { name: "Semina za Afya", price: "TZS 10,000" },
      pharmacy: { name: "Dawa na Vifaa", price: "TZS 4,000" },
    },
    en: {
      gp_chat: { name: "General Doctor (Chat)", price: "TZS 3,000" },
      gp_video: { name: "General Doctor (Video)", price: "TZS 5,000" },
      sp_chat: { name: "Specialist Doctor (Chat)", price: "TZS 25,000" },
      sp_video: { name: "Specialist Doctor (Video)", price: "TZS 30,000" },
      home_urgent: { name: "Urgent Care", price: "TZS 30,000" },
      home_procedure: { name: "Medical Procedure", price: "TZS 30,000" },
      home_amd: { name: "Advanced Directives", price: "TZS 50,000" },
      home_sda: { name: "Disability Assessment", price: "TZS 30,000" },
      corp_pre: { name: "Pre-Employment Check", price: "TZS 10,000" },
      corp_screen: { name: "Screening & Vaccines", price: "TZS 10,000" },
      corp_wellness: { name: "Wellness Programs", price: "TZS 10,000" },
      pharmacy: { name: "Pharmacy & Supplies", price: "TZS 4,000" },
    },
  },

  // ============ BOOK / BACK BUTTONS ============
  bookBackButtons: {
    sw: {
      book: "Weka Miadi",
      back: "Rudi",
      menu: "Menyu Kuu",
    },
    en: {
      book: "Book Now",
      back: "Go Back",
      menu: "Main Menu",
    },
  },

  // ============ HELP ============
  help: {
    sw: "Unahitaji msaada? Bonyeza chaguo lolote kwenye menyu au andika *menu* kuona huduma zetu.\n\nKwa msaada zaidi piga simu: +255...",
    en: "Need help? Tap any option on the menu or type *menu* to see our services.\n\nFor more help call: +255...",
  },
};

module.exports = CONTENT;
