# CropCare AI — Smart Crop Disease Helper Website

> **A Modern 3D Front-End Web Application for Plant Health Awareness & Crop Disease Education**  
> *Developed as an Engineering College Project and Personal Portfolio Showcase.*

---

## 📌 Project Overview

**CropCare AI** is a responsive, client-side web application designed to help farmers, agriculture students, and gardening enthusiasts explore plant health, inspect crop leaf symptoms, and access verified agronomic prevention practices.

Built using **HTML5, CSS3, and vanilla JavaScript**, the project incorporates an interactive **Three.js WebGL 3D visualizer** and **CSS 3D perspective depth**, creating an engaging educational experience without requiring any backend server or external cloud dependency.

> ⚠️ **Academic Prototype Notice (Version 1.0):**  
> CropCare AI v1.0 is an educational front-end prototype. In accordance with ethical AI design and strict academic integrity, **it does not perform fabricated or unvalidated machine learning disease classification**. Real deep-learning inference is slated for Version 2.0 with a validated agricultural model.

---

## ✨ Key Features

### 1. Interactive 3D Botanical Bio-Visualizer (Three.js WebGL)
- **Procedural 3D Plant Leaf:** Real-time rendered organic leaf blade with cellular curvature, stem geometry, and reticulate venation.
- **Three Inspection Modes:**
  - 🌿 **Organic View:** Natural lighting, realistic chlorophyll sheen, and ambient swirling bio-particles/spores.
  - 🔬 **Bio-Scan View:** Holographic wireframe overlay with an animated bidirectional 3D laser scanning beam.
  - ⚠️ **Symptoms View:** Real-time 3D lesion decals and pathogen markers (concentric rings, water-soaked patches, rust pustules) mapped on the leaf surface.
- **Full 3D Orbit Controls:** Smooth mouse/touch drag rotation, zoom damping, and camera view reset.
- **100% Offline Capability:** Three.js and OrbitControls libraries are stored locally in `js/`, ensuring the 3D model functions smoothly without internet connectivity.

### 2. 3D Card Parallax & Depth System (CSS 3D Perspective)
- Dynamic mouse-following 3D tilt (`perspective: 1000px`, `rotateX`, `rotateY`) on all feature and disease cards.
- Multi-layer depth effects (`translateZ`) providing tactile feedback on hover.

### 3. Leaf Image Analyzer
- **Dual Selection Options:** Drag-and-drop zone or system file picker.
- **Rigorous Validation:**
  - Supported Formats: **JPEG, PNG, WEBP**.
  - File Size Limit: **5 MB maximum**.
  - Real-time rejection with clear error prompts for invalid types or oversized files.
- **Memory Safety:** Temporary browser object URLs are systematically released using `URL.revokeObjectURL()` to prevent memory leaks.
- **3D Holographic Scanner HUD:** Futuristic targeting reticle, corner brackets, and laser scan line animation over uploaded preview images.
- **Preloaded Sample Leaves:** One-click instant testing buttons for Tomato Early Blight, Potato Late Blight, Wheat Leaf Rust, Cotton Bacterial Blight, Corn Leaf Blight, and Healthy Leaf samples.
- **Compliant Educational Result Panel with Actionable Crop Care Guide:**
  - Empty: *"Ready to explore? Upload a leaf image to get started."*
  - On Upload: *"Image Ready! Your image is ready to explore."*
  - On Explore: Generates the **Complete Crop Care & Recovery Protocol**:
    - **Interactive Crop Switcher:** 🍅 Tomato, 🥔 Potato, 🌾 Wheat, 🌱 Cotton, 🌽 Corn, and 🌿 General Garden Plant.
    - 📋 **Interactive Action Checklist:** Check off immediate steps (pruning infected leaves, sanitizing shears with 70% alcohol, removing bottom foliage).
    - 💊 **Organic & Sustainable Treatments:** Specific organic remedies (liquid copper octanoate, neem oil, *Bacillus subtilis* bio-fungicide) with dosage, timing, and spray frequency.
    - 💧 **Watering & Soil Protocols:** Base/drip irrigation schedules, mulching rules to stop spore splashback, and calcium/potassium nutrition balance.
    - 🛡️ **Long-Term Preventive Agronomy:** Crop rotation timelines, hybrid resistance genes, and canopy aeration.
    - 📋 **Copy Care Plan Button:** One-click export of the formatted care plan to the system clipboard with toast feedback.

### 4. Educational Crop Disease Guide
Detailed disease profile cards covering:
1. **Tomato Early Blight (*Alternaria solani*):** Concentric target spots, chlorotic halos, drip irrigation guidance, and 3-year crop rotation recommendations.
2. **Potato Late Blight (*Phytophthora infestans*):** Dark water-soaked lesions, white underleaf bloom, seed tuber health, and regional blight alert monitoring.
3. **Wheat Leaf Rust (*Puccinia triticina*):** Orange-brown powdery pustules, resistant cultivar selection, and green-bridge elimination.
4. **Cotton Bacterial Blight (*Xanthomonas citri* pv. *malvacearum*):** Angular water-soaked vein-bound lesions, blackarm cankers, certified acid-delinted seeds, and resistant cultivars.
5. **Northern Corn Leaf Blight (*Exserohilum turcicum*):** Distinctive 1–6 inch elliptical cigar-shaped tan lesions, olive-gray sporulation, Ht gene hybrids, and crop rotation.

### 5. Accessibility & Modern Design
- Adheres to WCAG AA color contrast standards.
- Keyboard navigation with skip links and `:focus-visible` indicators.
- ARIA live status announcements (`aria-live="polite"`) for assistive screen readers.
- Fully responsive across desktop (>800px), tablet (421px–800px), and mobile (≤420px).

---

## 🛠️ Technology Stack

| Layer | Technologies | Purpose |
|---|---|---|
| **Structure** | HTML5 Semantic Elements | Page layout, accessible controls, ARIA landmark regions |
| **Styling & 3D Depth** | CSS3 (Variables, Grid, Flexbox, 3D Transforms) | Responsive layout, theme colors, 3D perspective tilt, glassmorphism |
| **Logic & State** | Vanilla JavaScript (ES6+) | File validation, DOM manipulation, memory management, scroll spy |
| **3D Rendering** | Three.js (r128) + OrbitControls | WebGL 3D plant model, lighting, shaders, particles, and laser scanning |
| **Fonts & Icons** | Manrope, DM Sans, Custom SVGs | Modern typography with complete offline fallback support |

---

## 📁 File and Folder Structure

```
CropCare-AI/
├── index.html          # Semantic HTML5 page structure and accessible controls
├── style.css           # Theme variables, responsive breakpoints, 3D CSS effects
├── script.js           # Three.js 3D engine, file validation, analyzer controller
├── js/
│   ├── three.min.js    # Local Three.js WebGL library (offline support)
│   └── OrbitControls.js# Three.js OrbitControls module (offline support)
├── images/
│   ├── sample_tomato_early_blight.jpg      # Generated Tomato sample leaf image
│   ├── sample_potato_late_blight.jpg       # Generated Potato sample leaf image
│   ├── sample_wheat_leaf_rust.jpg          # Generated Wheat sample leaf image
│   ├── sample_cotton_bacterial_blight.jpg  # Generated Cotton sample leaf image
│   ├── sample_corn_leaf_blight.jpg         # Generated Corn sample leaf image
│   └── sample_healthy_leaf.jpg             # Generated healthy leaf control
└── README.md           # Project documentation and specifications
```

---

## 🚀 How to Run the Project

CropCare AI is a zero-dependency static web application. It runs directly in any modern web browser without requiring Node.js, Python, or database installations.

### Option 1: Direct File Launch (Quickest)
1. Navigate to the project directory: `c:\Users\Admin\Desktop\python practice\1st website`
2. Double-click `index.html` (or right-click -> **Open with Google Chrome / Microsoft Edge / Firefox**).
3. The website will load immediately with all 3D features and offline scripts active.

### Option 2: Using VS Code Live Server
1. Open the folder in Visual Studio Code.
2. Click **Go Live** on the bottom status bar (or right-click `index.html` -> **Open with Live Server**).
3. The website opens at `http://127.0.0.1:5500`.

### Option 3: Using Any Local Web Server
```powershell
# Using Python (if available):
python -m http.server 8000

# Using Node http-server (if available):
npx http-server . -p 8000
```
Open your browser and navigate to `http://localhost:8000`.

---

## 🧪 Acceptance Criteria & Test Verification

| Test Case | Expected Result | Verification Status |
|---|---|:---:|
| **Initial Page Load** | Navigation, Hero with 3D Leaf, and Metrics render cleanly | ✅ Passed |
| **Smooth Navigation** | Clicking nav links smoothly scrolls to `#home`, `#analyzer`, `#guide`, `#about` | ✅ Passed |
| **Valid Image Upload** | Image previews, filename & formatted size appear, state updates to "Image Ready" | ✅ Passed |
| **Oversized File (>5 MB)** | File rejected with descriptive error: *"File size exceeds 5 MB limit..."* | ✅ Passed |
| **Invalid File Type (e.g. PDF/TXT)** | File rejected with error: *"Unsupported file format..."* | ✅ Passed |
| **Explore without Image** | Prompt informs user to choose a leaf image first | ✅ Passed |
| **Explore with Valid Image** | 3D laser scan animation plays; displays *"Educational Guide Ready. No AI diagnosis has been performed."* | ✅ Passed |
| **Clear Image Button** | Input, preview, filename, and result panel return to initial empty state; Object URL revoked | ✅ Passed |
| **Preloaded Samples** | Clicking sample buttons (Tomato, Potato, Wheat, Healthy) loads instant demonstration | ✅ Passed |
| **3D Mode Switching** | Toggling 🌿 Organic, 🔬 Bio-Scan, and ⚠️ Symptoms alters the 3D model in real time | ✅ Passed |
| **Mobile Responsiveness** | Layout stacks cleanly; hamburger menu operates smoothly on screens ≤ 800px & ≤ 420px | ✅ Passed |
| **100% Offline Resilience** | Three.js and all core layouts function with no active internet connection | ✅ Passed |

---

## 🔒 Privacy & Security

- **Zero Remote Uploads:** In CropCare AI Version 1.0, uploaded leaf images are previewed strictly inside local browser memory via `URL.createObjectURL()`.
- **No Data Harvesting:** No personal information, telemetry, cookies, or tracking pixels are collected.
- **Resource Cleanup:** Temporary memory pointers are revoked immediately upon image clearance or replacement (`URL.revokeObjectURL()`).

---

## 🔮 Future Scope (Version 2.0 Roadmap)

Future engineering milestones for Version 2.0 include:
1. **Deep Learning Inference:** Integrating a lightweight MobileNetV3 / ResNet convolutional neural network trained on the PlantVillage and field crop disease datasets.
2. **Python / FastAPI Inference Backend:** Providing asynchronous image classification endpoints with confidence intervals and uncertainty detection.
3. **Multilingual Regional Support:** Localizing the platform in **Hindi** and **Marathi** to maximize accessibility for Indian agricultural communities.
4. **Offline PWA (Progressive Web App):** Enabling offline service workers for rural farmers in low-connectivity areas.
5. **Direct Agricultural Extension Integration:** Connecting farmers with nearby university agricultural advisory helplines.

---

## 📄 License & Academic Attribution

This project was engineered for academic demonstration and portfolio presentation.  
© 2026 CropCare AI. All rights reserved.
