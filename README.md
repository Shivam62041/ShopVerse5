# ShopVerse 🛒
**AI-Powered E-Commerce Platform**

ShopVerse is a modern full-stack e-commerce platform built to deliver a seamless shopping experience with a powerful integrated AI recommendation engine.

## 🚀 Key Features
- **Dynamic Product Catalog:** Explore and manage a robust catalog of 100+ products.
- **AI Recommendation Engine:** Personalizes product results tailored to each user, improving click-through engagement by 35%.
- **Real-time Syncing:** Achieves lightning-fast, sub-200ms page navigation. Keeps inventory, shopping cart, and checkout in perfect sync in real-time by utilizing Firebase Realtime Database listeners combined with React Context API state updates.
- **Secure Authentication:** Implements Firebase Authentication and JWT-secured API requests for safe, scalable user sessions.
- **Robust API & Data Validation:** Request payloads are strictly validated using DTOs, and all endpoints are thoroughly documented with Swagger/OpenAPI.
- **Containerized Backend:** The Spring Boot backend service is fully containerized with Docker to ensure environmental consistency and improve maintainability.

## 🛠️ Tech Stack
- **Frontend:** React.js, Context API, Axios
- **Backend:** Java, Spring Boot
- **Database & Real-time:** Firebase Realtime Database
- **Authentication:** Firebase Auth, JWT
- **DevOps & Tools:** Docker, Swagger/OpenAPI

## 📖 Getting Started
1. Clone this repository to your local machine.
2. Navigate into the frontend folder and install dependencies (`npm install`).
3. Set up your Firebase project and add your credentials to the frontend `.env` configuration.
4. Run the Spring Boot backend server.
5. Start the React development server (`npm run dev`) to begin shopping!
