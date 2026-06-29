<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
  <defs>
    <!-- Gold Gradient for the main elements -->
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F3E5AB" />
      <stop offset="20%" stop-color="#D4AF37" />
      <stop offset="50%" stop-color="#AA7C11" />
      <stop offset="80%" stop-color="#D4AF37" />
      <stop offset="100%" stop-color="#F3E5AB" />
    </linearGradient>
    
    <!-- Darker Gold for shadows/depth -->
    <linearGradient id="goldDark" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#8A6308" />
      <stop offset="50%" stop-color="#B8860B" />
      <stop offset="100%" stop-color="#DAA520" />
    </linearGradient>

    <!-- Drop shadow for 3D effect -->
    <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
    
    <!-- Inner shadow for the S ribbon -->
    <filter id="inner-shadow">
      <feOffset dx="0" dy="0"/>
      <feGaussianBlur stdDeviation="3" result="offset-blur"/>
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse"/>
      <feFlood flood-color="black" flood-opacity="0.5" result="color"/>
      <feComposite operator="in" in="color" in2="inverse" result="shadow"/>
      <feComposite operator="over" in="shadow" in2="SourceGraphic"/>
    </filter>
  </defs>

  <!-- Background (removed for transparency) -->
  <!-- <rect width="500" height="500" fill="#111B2D" /> -->
  
  <!-- Texture overlay for background -->
  <!-- <rect width="500" height="500" fill="url(#pattern)" opacity="0.05" /> -->
  <defs>
    <pattern id="pattern" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="2" height="2" fill="#ffffff" />
    </pattern>
  </defs>

  <g transform="translate(20, 20)" filter="url(#drop-shadow)">
    <!-- Compass Points -->
    <!-- N -->
    <polygon points="200,10 215,50 185,50" fill="url(#gold)" />
    <!-- S -->
    <polygon points="200,390 215,350 185,350" fill="url(#gold)" />
    <!-- E -->
    <polygon points="390,200 350,185 350,215" fill="url(#gold)" />
    <!-- W -->
    <polygon points="10,200 50,185 50,215" fill="url(#gold)" />
    <!-- NE -->
    <polygon points="334,66 314,100 294,80" fill="url(#gold)" />
    <!-- NW -->
    <polygon points="66,66 86,100 106,80" fill="url(#gold)" />
    <!-- SE -->
    <polygon points="334,334 314,300 294,320" fill="url(#gold)" />
    <!-- SW -->
    <polygon points="66,334 86,300 106,320" fill="url(#gold)" />

    <!-- Globe Base Circle -->
    <circle cx="200" cy="200" r="140" fill="none" stroke="url(#gold)" stroke-width="12" />
    
    <!-- Globe Grid Lines (Latitude/Longitude) -->
    <path d="M 200 60 A 70 140 0 0 0 200 340 A 70 140 0 0 0 200 60" fill="none" stroke="url(#gold)" stroke-width="8" />
    <path d="M 60 200 A 140 70 0 0 0 340 200 A 140 70 0 0 0 60 200" fill="none" stroke="url(#gold)" stroke-width="8" />
    <line x1="200" y1="60" x2="200" y2="340" stroke="url(#gold)" stroke-width="8" />
    <line x1="60" y1="200" x2="340" y2="200" stroke="url(#gold)" stroke-width="8" />

    <!-- Bar Chart (Bottom Right) -->
    <rect x="280" y="360" width="25" height="40" fill="url(#gold)" rx="2" />
    <rect x="320" y="320" width="25" height="80" fill="url(#gold)" rx="2" />
    <rect x="360" y="270" width="25" height="130" fill="url(#gold)" rx="2" />
    <rect x="400" y="210" width="25" height="190" fill="url(#gold)" rx="2" />

    <!-- Rising Arrow Line -->
    <path d="M 250 350 L 300 300 L 340 330 L 420 200" fill="none" stroke="url(#gold)" stroke-width="14" stroke-linejoin="round" stroke-linecap="round" />
    <!-- Arrow Head -->
    <polygon points="435,180 400,195 425,220" fill="url(#gold)" />

    <!-- The Stylized 'S' Ribbon -->
    <!-- We use a thick path that weaves over the globe -->
    <path d="M 300 100 C 200 80, 100 150, 150 250 C 200 350, 350 250, 250 400 C 200 450, 120 400, 120 400" 
          fill="none" stroke="url(#gold)" stroke-width="35" stroke-linecap="round" filter="url(#inner-shadow)" />
    
    <!-- A second path to give the 'S' a 3D bevel effect -->
    <path d="M 300 100 C 200 80, 100 150, 150 250 C 200 350, 350 250, 250 400 C 200 450, 120 400, 120 400" 
          fill="none" stroke="url(#goldDark)" stroke-width="15" stroke-linecap="round" opacity="0.6" />
  </g>
</svg>
