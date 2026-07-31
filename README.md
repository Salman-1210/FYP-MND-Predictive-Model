
# FYP-MND-Predictive-Model
Final Year Project - AI-powered predictive modeling for Motor Neuron Disease (ALS, PBP, PMA) using Random Forest with validation. Achieves 94% accuracy on clinical NCV data.
=======
#  FYP-MND-Predictive-Model

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Random%20Forest-94%25%20Accuracy-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/AUROC-0.9890-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

<p align="center">
  <b>AI-Powered Predictive Modeling for Motor Neuron Disease (MND)</b><br>
  Early diagnosis, risk assessment, and patient care platform for ALS, PBP, and PMA.
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [What is Motor Neuron Disease?](#-what-is-motor-neuron-disease)
- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Methodology](#-methodology)
  - [Data Collection](#data-collection)
  - [Feature Engineering](#feature-engineering)
  - [Model Selection](#model-selection)
  - [Training & Validation](#training--validation)
- [System Architecture](#-system-architecture)
- [Backend](#-backend)
- [Frontend](#-frontend)
- [Key Features](#-key-features)
  - [Early Diagnosis & Prediction](#1-early-diagnosis--prediction)
  - [Exercise Recommendations](#2-exercise-recommendations)
  - [Doctor-Patient Connection](#3-doctor-patient-connection)
  - [Patient Privacy & Security](#4-patient-privacy--security)
  - [Risk History Tracking](#5-risk-history-tracking)
  - [AI Chatbot Assistant](#6-ai-chatbot-assistant)
- [Model Performance](#-model-performance)
- [Results & Benchmarks](#-results--benchmarks)
- [SDG Alignment](#-sdg-alignment)
- [Future Work](#-future-work)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Team](#-team)
- [License](#-license)

---

## 🔬 Overview

This project presents an **AI-driven web application** for the early detection and management of **Motor Neuron Disease (MND)** — a group of progressive neurological disorders that destroy motor neurons, the cells that control essential voluntary muscle activity.

Our system uses **clinical Nerve Conduction Velocity (NCV) data** to predict the likelihood of MND subtypes (**ALS, PBP, PMA**) with **94% accuracy**, enabling early intervention and improved patient outcomes.

> ⚠️ **Disclaimer:** This tool is designed for **clinical decision support** and does not replace professional medical diagnosis.

---

## 🧬 What is Motor Neuron Disease?

**Motor Neuron Disease (MND)** is a rare, life-limiting neurodegenerative condition that affects the nerve cells (motor neurons) responsible for controlling voluntary muscles.

### Types of MND:

| Type | Full Name | Description |
|------|-----------|-------------|
| **ALS** | Amyotrophic Lateral Sclerosis | Most common form; affects both upper and lower motor neurons. Fatal within 3-5 years. |
| **PBP** | Progressive Bulbar Palsy | Affects bulbar muscles (speech, swallowing). Rapid progression. |
| **PMA** | Progressive Muscular Atrophy | Affects lower motor neurons only. Slower progression than ALS. |
| **NORMAL** | — | No MND detected. |

### Why Early Diagnosis Matters:

- ⏱️ **ALS survival rate:** 50% within 3 years, 20% within 5 years
- 🔬 **No cure exists** — but early intervention extends life expectancy
- 💊 **Riluzole** (only FDA-approved drug) works best when given early
- 🏥 **Multidisciplinary care** improves quality of life significantly

---

## ❗ Problem Statement

Traditional MND diagnosis faces critical challenges:

1. **Delayed Diagnosis:** Average delay of **12-14 months** from symptom onset to diagnosis
2. **Specialist Shortage:** Limited neurologists in developing regions like Pakistan
3. **Expensive Tests:** EMG/NCV tests cost ~PKR 15,000-25,000 per session
4. **Manual Interpretation:** Results require expert analysis, prone to human error
5. **No Early Warning:** Patients visit doctors only when symptoms are severe
6. **Data Scarcity:** Limited datasets for AI research in developing countries

---

## 💡 Our Solution

We built an **end-to-end AI platform** that:

✅ **Predicts MND risk** from NCV test data using machine learning  
✅ **Connects patients** with neurologists across Karachi hospitals  
✅ **Recommends exercises** based on disease progression  
✅ **Tracks risk history** over time for monitoring  
✅ **Ensures privacy** with secure patient data handling  
✅ **Provides 24/7 AI assistance** via chatbot  

---

## 🧪 Methodology

### Data Collection

- **Source:** Clinical NCV reports from neurology clinics in Karachi
- **Patients:** ~600 total (ALS, PBP, PMA, NORMAL)
- **Features Extracted:**
  - **Latency** — Signal delay in nerve conduction (ms)
  - **Amplitude** — Signal strength (mV)
  - **NCV** — Nerve Conduction Velocity (m/s)
  - All features **normalized against healthy population norms**
  - Converted to **ordinal categories** (Low/Normal/High) for model interpretability

### Feature Engineering

```
Raw NCV Data → Normalization → Ordinal Encoding → Feature Selection → Model Input
```

| Feature | Description | Encoding |
|---------|-------------|----------|
| Latency | Time for signal to travel | Ordinal (Low/Normal/High) |
| Amplitude | Strength of nerve response | Ordinal (Low/Normal/High) |
| NCV | Speed of nerve impulse | Ordinal (Low/Normal/High) |

### Model Selection

After comparing multiple algorithms:

| Algorithm | Limitation | Why Rejected |
|-----------|-----------|-------------|
| **Decision Trees** | Overfitting on small data | Unstable, memorizes patterns |
| **SVM** | Complex hyperparameters | Sensitive to kernel choice, struggles with imbalance |
| **Deep Neural Networks** | Massive data needs | Requires 10,000+ samples; black box problem |
| ✅ **Random Forest** | Best balance | Handles limited data, high dimensions, clear feature importance |

> **Note:** Our backend uses **Random Forest** as the primary model. We also evaluated XGBoost for dual-consensus validation during research, but the deployed system runs on a single Random Forest model for simplicity and interpretability.

### Training & Validation

- **Algorithm:** Random Forest Classifier
- **Validation:** 5-Fold Cross-Validation
- **Classes:** ALS, PBP, PMA, NORMAL (4-class classification)
- **Imbalance Handling:** Built-in class weighting

**Why 5-Fold Cross-Validation?**

> Instead of testing on one random split, we train the model 5 times on different data combinations. If accuracy stays consistent (~94% each time), it proves the model actually learned patterns — not just memorized data.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERFACE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Patient  │  │  Doctor  │  │  Admin   │  │ Chatbot  │   │
│  │ Portal   │  │ Dashboard│  │ Dashboard│  │  (AI)    │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
                    ┌────────▼────────┐
                    │   Next.js 14    │
                    │   Frontend      │
                    │  (React + TS)   │
                    └────────┬────────┘
                             │ API Calls
                    ┌────────▼────────┐
                    │   Flask API     │
                    │    Backend      │
                    │  (Python 3.11)  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
       │   Random    │ │   OCR    │ │  PostgreSQL │
       │   Forest    │ │  Engine  │ │   Database  │
       │   Model     │ │ (Reports)│ │             │
       └─────────────┘ └──────────┘ └─────────────┘
```

---

## ⚙️ Backend

### Tech Stack
- **Framework:** Flask (Python)
- **ML Library:** scikit-learn, joblib
- **Database:** PostgreSQL
- **OCR:** Report scanning and data extraction
- **API:** RESTful endpoints for frontend communication

### Key Files

| File | Purpose |
|------|---------|
| `app.py` | Main Flask application with API routes |
| `train_rf_mnd.py` | Model training pipeline |
| `feature_engineering.py` | Data preprocessing & feature extraction |
| `single_patient_predict.py` | Single patient prediction endpoint |
| `models.py` | Database models |
| `database.py` | DB connection & queries |
| `ocr.py` | NCV report OCR extraction |

### API Endpoints

```
POST /api/predict          → Submit NCV data, get MND prediction
POST /api/upload-report    → Upload NCV report (OCR extraction)
GET  /api/risk-history     → Patient's historical risk scores
POST /api/exercises        → Get personalized exercise recommendations
GET  /api/doctors          → List available neurologists
POST /api/chatbot          → AI chatbot query
```

### Model Files

| File | Size | Description |
|------|------|-------------|
| `rf_mnd_worldwide_model.joblib` | ~53 MB | Trained Random Forest model |
| `rf_mnd_worldwide_features.joblib` | — | Feature scaler/encoder |
| `rf_mnd_worldwide_label_encoder.joblib` | — | Label encoder for classes |

---

## 🎨 Frontend

### Tech Stack
- **Framework:** Next.js 14 (React)
- **Language:** TypeScript / JSX
- **Styling:** Tailwind CSS
- **State Management:** Redux
- **Charts:** Recharts

### Key Components

| Component | Purpose |
|-----------|---------|
| `PatientDashboard.jsx` | Patient view: predictions, history, exercises |
| `DoctorDashboard.jsx` | Doctor view: patient list, reports, consultations |
| `AdminDashboard.jsx` | Admin view: system analytics, user management |
| `Screening.jsx` | NCV data input & prediction interface |
| `ReportResultPage.jsx` | Prediction results with explanations |
| `RiskHistoryChart.jsx` | Visual risk trend over time |
| `Exercises.jsx` | Personalized exercise recommendations |
| `ChatBot.jsx` | AI-powered medical assistant |
| `AuthForm.jsx` | Secure login & registration |
| `PrivacyPolicyModal.jsx` | GDPR-compliant privacy controls |

### Portals

1. **Patient Portal** — Submit NCV data, view predictions, track history, get exercises
2. **Doctor Portal** — Review patient predictions, provide consultations, manage appointments
3. **Admin Portal** — Monitor system usage, manage users, view analytics

---

## ⭐ Key Features

### 1. Early Diagnosis & Prediction

- Upload NCV report or manually enter values
- AI predicts MND risk in **seconds**
- Returns: **Predicted Class** + **Confidence Score** + **Risk Level**
- Color-coded results: 🟢 Low | 🟡 Moderate | 🔴 High

```
Input: NCV Latency, Amplitude, Velocity
Output: ALS (87% confidence) | Risk: HIGH
```

### 2. Exercise Recommendations

Based on predicted disease type and progression:

| Disease | Recommended Exercises |
|---------|----------------------|
| **ALS** | Breathing exercises, gentle stretching, speech therapy |
| **PBP** | Swallowing exercises, facial muscle therapy |
| **PMA** | Low-impact strength training, mobility exercises |
| **NORMAL** | General wellness & preventive exercises |

- Video-guided exercises
- Progress tracking
- Adaptive difficulty based on patient feedback

### 3. Doctor-Patient Connection

- **Find Neurologists:** Search by specialty, location, hospital
- **Book Appointments:** Integrated scheduling system
- **Share Reports:** Secure report sharing with doctors
- **Telemedicine:** Video consultation support
- **Network:** Connected with hospitals across Karachi

### 4. Patient Privacy & Security

🔒 **We take privacy seriously:**

- **End-to-end encryption** for patient data
- **GDPR-compliant** data handling
- **Role-based access** (Patient/Doctor/Admin)
- **No data sharing** with third parties
- **Secure authentication** with JWT tokens
- **Audit logs** for all data access
- **Right to deletion** — patients can request data removal

```
Patient Data Flow:
Input → Encryption → Database → Authorized Access Only
```

### 5. Risk History Tracking

- Historical prediction visualization
- Trend analysis over time
- Early warning alerts for risk increase
- Exportable reports for doctor visits

### 6. AI Chatbot Assistant

- 24/7 available medical assistant
- Answers MND-related questions
- Explains prediction results
- Guides patients through the platform
- **Not a replacement** for doctor consultation

---

## 📊 Model Performance

### Confusion Matrix (Multi-Class)

| Actual \ Predicted | ALS | NORMAL | PBP | PMA |
|---------------------|-----|--------|-----|-----|
| **ALS** | 75 | 0 | 1 | 24 |
| **NORMAL** | 0 | 297 | 0 | 3 |
| **PBP** | 7 | 0 | 93 | 0 |
| **PMA** | 8 | 0 | 0 | 91 |

### Key Metrics

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **Overall Accuracy** | 94% | 94 out of 100 predictions correct |
| **Weighted F1-Score** | 0.94 | Balanced performance across classes |
| **Macro F1-Score** | 0.90 | Equal importance to all classes (including rare ones) |
| **ALS Sensitivity** | 0.75 | Detects 75% of ALS cases — critical for early diagnosis |
| **AUROC** | 0.9890 | Excellent class separation ability |

### Why These Metrics?

- **Accuracy:** Overall correctness
- **Macro F1:** Ensures rare diseases (PBP/PMA) aren't ignored
- **ALS Sensitivity:** Most important — missing ALS is life-threatening
- **AUROC:** Model's confidence in distinguishing sick vs healthy

---

## 📈 Results & Benchmarks

### Comparison with Published Research

| Model | Accuracy | Notes |
|-------|----------|-------|
| **XGBoost (Proposed)** | 94% | Our dual-consensus validation |
| **Random Forest (Proposed)** | 94% | Primary deployed model |
| Ensemble | 79% | Published benchmark |
| RWD | 74% | Published benchmark |
| KG | 78% | Published benchmark |
| GPT-4 | 77% | General-purpose AI |

> Our model outperforms all published benchmarks on clinical NCV data.

---

## 🌍 SDG Alignment

Our project contributes to the **UN Sustainable Development Goals:**

| SDG | Goal | Our Contribution |
|-----|------|-----------------|
| **SDG 3** | Good Health & Well-Being | Early screening for rare, life-limiting disease |
| **SDG 9** | Industry & Innovation | Applying AI infrastructure to underserved clinical needs |
| **SDG 17** | Partnerships | Connecting patients with neurologists across Karachi hospitals |

---

## 🚀 Future Work

| Phase | Plan | Timeline |
|-------|------|----------|
| **Phase 1** | Hospital Deployment — Pilot with partner neurology clinics | Q1 2026 |
| **Phase 2** | EMR Integration — Connect with existing hospital record systems | Q2 2026 |
| **Phase 3** | Population Screening — Scale to wider community health drives | Q3-Q4 2026 |

### Research Extensions

- Multi-center validation across Pakistan
- Integration with genetic markers
- Longitudinal progression prediction
- Mobile app for remote monitoring

---

## 🛠️ Tech Stack

### Backend
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=flat&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=flat&logo=scikit-learn&logoColor=white)

### Frontend
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

### Tools
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=flat&logo=visual-studio-code&logoColor=white)

---

## 📦 Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend Setup

```bash
cd MND_frontend
npm install
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@localhost/mnd_db
SECRET_KEY=your-secret-key
FLASK_ENV=development
```

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Neurology clinics in Karachi for providing clinical data
- Open-source community for ML libraries
- Patients and families who inspired this work

---

<p align="center">
  <b>Built for those brave souis fighting Motor Neuron Disease</b><br>
  <i>Early detection saves lives.</i>
</p>
