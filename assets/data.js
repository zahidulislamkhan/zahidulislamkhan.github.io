/* ─────────────────────────────────────────────────────────────────────────
   SITE CONTENT — edit this file, not the HTML.

   Every page reads from this object. Add a publication, a talk, a job or a
   link here and the relevant page picks it up on next load.
   ──────────────────────────────────────────────────────────────────────── */

var SITE = {
  "profile": {
    "name": "Zahidul Islam Khan",
    "user": "zahidul",
    "host": "oulu",
    "role": "Statistician & data scientist",
    "tagline": "Sometimes the model is the argument",
    "blurb": "I study population health through the lens of statistics and machine learning, from maternal outcomes in Bangladesh to hypertension across South Asia. Currently pursuing my MHSc at the University of Oulu, Finland.",
    "photo": "assets/photo.jpg",
    "location": "Oulu, Finland",
    "stats": {
      "publications": 7,
      "citations": 97,
      "hindex": 5,
      "i10": 5
    }
  },
  "current": [
    {
      "title": "Environmental inequality & mental health",
      "note": "Geospatial analysis, Northern Finland Birth Cohort 1966"
    },
    {
      "title": "Hypertension across South Asia",
      "note": "DHS data, urban communities"
    }
  ],
  "education": [
    {
      "degree": "MHSc in Epidemiology and Biomedical Data Science",
      "org": "University of Oulu",
      "years": "2024 – 2026"
    },
    {
      "degree": "BSc in Statistics",
      "org": "Khulna University",
      "years": "2016 – 2020"
    }
  ],
  "links": [
    {
      "label": "Email",
      "url": "mailto:zkhan24@student.oulu.fi",
      "hint": "zkhan24@student.oulu.fi"
    },
    {
      "label": "Google Scholar",
      "url": "https://scholar.google.com/citations?user=i-5w_I4AAAAJ",
      "hint": "97 citations · h-index 5"
    },
    {
      "label": "LinkedIn",
      "url": "https://www.linkedin.com/in/zahidulislamkhan/",
      "hint": "zahidulislamkhan"
    },
    {
      "label": "ResearchGate",
      "url": "https://www.researchgate.net/profile/Zahidul-Islam-Khan",
      "hint": "Zahidul-Islam-Khan"
    },
    {
      "label": "CV",
      "url": "assets/cv.pdf",
      "hint": "pdf"
    }
  ],
  "about": [
    "I'm a statistician and data scientist (almost!) with a background in applied public health research across South and South-East Asia. Before coming to Finland, I worked as a Data Management Officer at icddr,b, one of the world's leading international health research institutes, where I managed data for the Programme for HIV and AIDS under the Health Systems and Population Studies Division.",
    "My research sits at the intersection of biostatistics, epidemiology, and machine learning. I'm particularly drawn to questions about maternal and child health, infectious disease, and health inequalities — and to the statistical methodologies that can illuminate them.",
    "I completed my undergraduate in Statistics from Khulna University, Bangladesh (2020) and am currently pursuing a master's in Epidemiology and Biomedical Data Science at the University of Oulu, Finland."
  ],
  "skills": [
    {
      "group": "Tools",
      "items": [
        "R",
        "Python",
        "SPSS",
        "Stata",
        "QGIS"
      ]
    },
    {
      "group": "Methods",
      "items": [
        "Quantile regression",
        "Decomposition analysis",
        "Machine learning"
      ]
    },
    {
      "group": "Domain",
      "items": [
        "Maternal health",
        "Infectious disease",
        "Health inequalities"
      ]
    },
    {
      "group": "Data",
      "items": [
        "Longitudinal data",
        "DHS",
        "Survey data"
      ]
    }
  ],
  "interests": [
    "Biostatistics",
    "Longitudinal data",
    "Public health",
    "Maternal & child health",
    "Machine learning",
    "Health informatics",
    "Infectious disease",
    "DHS data"
  ],
  "citationsByYear": {
    "2021": 1,
    "2022": 1,
    "2023": 9,
    "2024": 21,
    "2025": 34,
    "2026": 31
  },
  "publications": [
    {
      "title": "Prevalence and determinants of hypertension in South-Asian urban communities: findings from DHS data",
      "year": 2024,
      "journal": "Journal of Human Hypertension",
      "tags": [
        "Hypertension",
        "South Asia"
      ],
      "cited": 20,
      "url": "https://doi.org/10.1038/s41371-023-00879-x"
    },
    {
      "title": "A comparative study of ML algorithms for predicting domestic violence vulnerability in Liberian women",
      "year": 2023,
      "journal": "BMC Women's Health",
      "tags": [
        "Machine learning",
        "GBV"
      ],
      "cited": 32,
      "url": "https://doi.org/10.1186/s12905-023-02701-9"
    },
    {
      "title": "Implementation of jute-based nose holder in surgical masks to reduce plastic contamination",
      "year": 2023,
      "journal": "Heliyon",
      "tags": [
        "Sustainability"
      ],
      "cited": 2,
      "url": "https://doi.org/10.1016/j.heliyon.2023.e16434"
    },
    {
      "title": "Risk factors associated with anemia among women of reproductive age (15–49) in Albania: a quantile regression analysis",
      "year": 2022,
      "journal": "Clinical Epidemiology and Global Health",
      "tags": [
        "Anemia",
        "Quantile regression"
      ],
      "cited": 14,
      "url": "https://doi.org/10.1016/j.cegh.2021.100948"
    },
    {
      "title": "Trends and patterns of inequalities in using facility delivery among reproductive-age women in Bangladesh: a decomposition analysis of 2007–2017 Demographic and Health Survey data",
      "year": 2022,
      "journal": "BMJ Open",
      "tags": [
        "Maternal health",
        "Bangladesh"
      ],
      "cited": 14,
      "url": "https://doi.org/10.1136/bmjopen-2022-065674"
    },
    {
      "title": "Factors affecting depression and stress among tertiary level students during the COVID-19 pandemic: a cross-sectional study in Bangladesh",
      "year": 2022,
      "journal": "Khulna University Studies",
      "tags": [
        "Mental health",
        "COVID-19"
      ],
      "cited": 0,
      "url": "https://ku.ac.bd/journal/kustudies/issue/view/18"
    },
    {
      "title": "Factors associated with age of mother at first birth in Albania: application of quantile regression model",
      "year": 2021,
      "journal": "Heliyon",
      "tags": [
        "Reproductive health",
        "Albania"
      ],
      "cited": 15,
      "url": "https://doi.org/10.1016/j.heliyon.2021.e06547"
    }
  ],
  "conferences": [
    {
      "date": "10–12 June 2026",
      "title": "Environmental Inequality and Mental Health: A Geospatial Analysis in the Northern Finland Birth Cohort 1966",
      "venue": "6th Paula Rantakallio Symposium on Birth Cohorts and Longitudinal Studies · Oulu, Finland",
      "badges": [
        "Author",
        "Poster"
      ],
      "poster": "assets/conf-rantakallio2026.jpg",
      "url": null
    },
    {
      "date": "22–26 July 2024",
      "title": "Discrepancies among self-reported symptoms vs laboratory-based diagnosis of STIs among female sex workers in Jashore, Bangladesh",
      "venue": "25th International AIDS Conference · Munich, Germany",
      "badges": [
        "Co-author",
        "Poster"
      ],
      "poster": "assets/conf-aids2024.jpg",
      "url": "https://programme.aids2024.org/Abstract/Abstract/?abstractid=8398"
    },
    {
      "date": "01–04 July 2022",
      "title": "Factors affecting depression and stress among tertiary level students during the COVID-19 pandemic",
      "venue": "International Conference on STEM & the 4th Industrial Revolution · Khulna University",
      "badges": [
        "Co-author",
        "Oral"
      ],
      "poster": null,
      "url": null
    }
  ],
  "experience": [
    {
      "date": "2024 – 2026",
      "role": "MHSc in Epidemiology and Biomedical Data Science",
      "org": "University of Oulu · Oulu, Finland",
      "kind": "edu",
      "badge": "Education",
      "desc": "Specialising in biostatistics, longitudinal data analysis, and epidemiological methods. Research focus on population health and health data science."
    },
    {
      "date": "2023 – 2024",
      "role": "Data Management Officer",
      "org": "icddr,b · Dhaka, Bangladesh",
      "kind": "work",
      "badge": "Work",
      "desc": "Managed data infrastructure for HIV and AIDS research programmes under the Health Systems and Population Studies Division. Worked on data quality, cleaning, and analysis pipelines for large-scale health surveys."
    },
    {
      "date": "2021 – 2023",
      "role": "Data Analyst",
      "org": "TwinBit Limited · Dhaka, Bangladesh",
      "kind": "work",
      "badge": "Work",
      "desc": "Data analysis and reporting for an iOS software development company. Built dashboards and analytical reports to support product decisions."
    },
    {
      "date": "2016 – 2020",
      "role": "BSc in Statistics",
      "org": "Khulna University · Khulna, Bangladesh",
      "kind": "edu",
      "badge": "Education",
      "desc": "Undergraduate research in biostatistics and applied statistics. Thesis work on maternal and child health using DHS data."
    },
    {
      "date": "2012 – 2014",
      "role": "HSC in Science",
      "org": "Notre Dame College · Dhaka, Bangladesh",
      "kind": "edu",
      "badge": "Education",
      "desc": "Higher Secondary Certificate."
    },
    {
      "date": "2004 – 2012",
      "role": "SSC in Science",
      "org": "Dhaka Residential Model College · Dhaka, Bangladesh",
      "kind": "edu",
      "badge": "Education",
      "desc": "Secondary School Cerificate."
    }
  ],
  "volunteering": [
    {
      "date": "01/2026 – present",
      "role": "Executive Member",
      "org": "Oulun Arctic Tigers Ry · Oulu, Finland",
      "kind": "vol",
      "badge": "Community",
      "desc": "Serving as an executive member of a local association in Oulu, contributing to community organisation and events."
    },
    {
      "date": "01/2026",
      "role": "Organizer — Pitha Utshob",
      "org": "Bangladeshi Cultural Festival · Oulu, Finland",
      "kind": "vol",
      "badge": "Culture",
      "desc": "Organised the Pitha Utshob, a Bangladeshi cultural festival celebrating traditional food and heritage within the Oulu community."
    },
    {
      "date": "06/2025",
      "role": "Volunteer",
      "org": "Colorful Restaurant · Multicultural Centre Villa Victor, Oulu",
      "kind": "vol",
      "badge": "Community",
      "desc": "Volunteered at a multicultural community restaurant, supporting intercultural exchange and community integration in Oulu."
    },
    {
      "date": "11/2025",
      "role": "Volunteer",
      "org": "European Public Health Conference · Helsinki, Finland",
      "kind": "conf",
      "badge": "Conference",
      "desc": "Volunteered at the European Public Health Conference in Helsinki, supporting the organisation of one of Europe's leading public health events."
    },
    {
      "date": "02/2025 – present",
      "role": "Volunteer",
      "org": "Oulu Cultural Capital 2026 · Oulu, Finland",
      "kind": "vol",
      "badge": "Culture",
      "desc": "Contributing to Oulu's year as European Capital of Culture 2026, supporting cultural programming and events across the city."
    }
  ]
};
