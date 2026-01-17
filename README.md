# CareerTrack
One-Stop Personalized Career and Education Advisor
# 🚀 CareerTrack: AI-Powered Career Path Generator

**CareerTrack** is a React-based single-page application (SPA) designed to help students navigate the confusing transition after 10th grade. By using an image-based psychometric test, it identifies a student's core personality traits and recommends the most suitable career stream (Science, Commerce, Arts, or Vocational).

It features a dual-interface system: one for **Students** to track their roadmap and one for **Parents** to monitor progress without invading privacy.

---

## ✨ Key Features

### 🎓 For Students
* **Psychometric Assessment:** An image-based test to bypass social bias and identify true personality traits (Analytical, Creative, Practical, etc.).
* **Smart Recommendation Engine:** Automatically suggests streams (Science, Commerce, etc.) and lists relevant college courses and scholarships.
* **Interactive Roadmap:** A gamified step-by-step career guide with quizzes to unlock new levels (e.g., "Foundation" -> "Internship Ready").
* **Job Market Insights:** Real-time data estimates on salaries, growth rates, and required skills.

### 👨‍👩‍👧‍👦 For Parents
* **Non-Invasive Tracking:** View high-level progress (e.g., "Level 2 Completed") without seeing the student's private answers to psychological questions.
* **Account Linking:** Easily link to a student account using their email address.
* **Dashboard:** Visual charts showing monthly learning activity and roadmap status.

---

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS
* **Icons:** Lucide React
* **Backend (BaaS):** Firebase (Google)
    * **Authentication:** Anonymous & Email/Password Login
    * **Firestore:** Real-time NoSQL database for storing profiles, test results, and public sharing logic.

---

## 📂 Project Structure

The project is organized into a modular architecture for better maintainability:

```text
/src
  ├── config/        # Firebase configuration and app secrets
  ├── data/          # Static data (Questions, Roadmaps, Course Lists)
  ├── components/    # Reusable UI components (Loaders, Progress Bars)
  ├── pages/         # Main View Controllers
  │   ├── LandingPage.js
  │   ├── AuthPage.js
  │   ├── TestPage.js
  │   ├── StudentDashboard.js
  │   └── ParentDashboard.js
  └── App.js         # Main Router and State Manager
