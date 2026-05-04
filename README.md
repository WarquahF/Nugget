# 🤖 JARVIS – AI Assistant (Electron + React)

A fast, JARVIS-style AI assistant with instant responses, smart commands, and a futuristic UI.

---

# ⚠️ IMPORTANT (READ FIRST)

This repository **DOES NOT include the AI model**.

Reasons:

* Models are **very large (GBs)**
* GitHub **does not allow large files easily**
* You must download it separately

👉 You also **will NOT see any `.bin` or model files** in this repo. This is normal.

---

# 🧠 What You Need Before Running

Make sure you have:

* Node.js (v18 or higher)
* npm
* A local AI model (via LM Studio or Ollama)

---

# 🚀 STEP-BY-STEP SETUP (FOR BEGINNERS)

## 1️⃣ Clone the project

```bash
git clone https://github.com/YOUR_USERNAME/jarvis-ai.git
cd jarvis-ai
```

---

## 2️⃣ Install dependencies

```bash
npm install
```

---

## 3️⃣ Install a Local AI Model

You have 2 options:

---

## 🔵 Option A: LM Studio (Recommended)

1. Download LM Studio

2. Open it

3. Go to **Models tab**

4. Download a model like:

   * llama3:8b
   * mistral

5. Start the local server inside LM Studio

👉 This will act as your AI brain

---

## 🟢 Option B: Ollama

Install Ollama and run:

```bash
ollama run llama3
```

---

## 4️⃣ Connect Model to Project

Make sure your app is pointing to:

```bash
http://localhost:11434
```

(or LM Studio local endpoint)

---

## 5️⃣ Run the App

```bash
npm start
```

Then open:

```
http://localhost:3000
```

---

# ⚡ Features

* ⚡ Instant responses (math, simple queries)
* 🧠 AI answers for complex questions
* 🎯 Smart intent detection
* 📧 Email system (with confirmation)
* 📡 Meeting assistant (safe mode)
* 🔵 Animated AI orb UI
* 🎭 JARVIS personality (no slang)

---

# 🧪 How to Test

Try these:

### ⚡ Speed test

```
25 squared
```

### 🧠 Knowledge test

```
what is mitochondria
```

### ⚙️ Command test

```
open notepad
```

### 📧 Email test

```
email father I will be late
```

---

# ⚠️ Notes

* AI responses depend on your model speed
* First run may be slow (model loading)
* Email requires configuration (see code)
* Meeting joining requires confirmation

---

# 🧠 Architecture

* Fast Engine → instant answers
* AI Model → complex queries
* Router → decides what to do
* UI → Electron + React

---

# 🚀 Future Improvements

* Voice activation ("Hey Jarvis")
* Memory system
* Better animations
* Full automation system

---

# 🤝 Contributing

Feel free to fork and improve.

---

# 🧠 Final Note

This project is built to simulate a real-time assistant like JARVIS:

* Fast ⚡
* Smart 🧠
* Controlled 🔒
* Clean UI 🔵

---

Enjoy building your own AI assistant 🚀
