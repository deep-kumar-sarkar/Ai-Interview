AI Interview Assistant (Monolith)

Overview
This repository contains a simple monolithic full‑stack application that conducts AI‑powered mock interviews. The frontend (React + Tailwind) parses a resume PDF client‑side and drives a multi‑turn chat with the backend (Spring Boot + Spring AI). The backend orchestrates sessions and delegates interviewer responses to Google Vertex AI Gemini when configured, or uses a safe deterministic mock otherwise.

Why Monolith
- Single deployable unit: One backend service encapsulating HTTP API, session state, and AI orchestration.
- Simple operational model: Fewer moving parts; suitable for early stage projects and demos.
- Clear layering: Controller → Service → Model/DTO. External integrations (Vertex AI) are abstracted behind service logic.

System Design Properties
- Observability: Centralized logging; global exception handler returns structured error payloads; health endpoint /api/health.
- Configurability: AI settings are externalized via application.properties and environment variables. Sensible defaults with safe mock fallback when Vertex AI is not configured.
- Reliability and graceful degradation: If Vertex AI calls fail or credentials are absent, the mock mode provides deterministic behavior so the app remains usable.
- Security: CORS is explicitly restricted to localhost dev origins in WebConfig. No secrets are committed; prefer environment variables for credentials.
- Performance: Client‑side PDF parsing (pdf.js) avoids shipping large files over the wire. Backend maintains in‑memory sessions (ConcurrentHashMap) for low‑latency interactions.
- Scalability (within monolith): Stateless HTTP with per‑process in‑memory sessions adequate for a single instance. For horizontal scaling later, move sessions to a shared store (e.g., Redis) and keep the monolith or split as needed.

Architecture (Monolith)
[Frontend]
  React + Vite + Tailwind
  - PDF parsing (pdf.js)
  - Chat UI and session flow
      |
      v
[Backend]
  Spring Boot (single application)
  - Controller (REST endpoints)
  - Service (interview orchestration, session store)
  - Model/DTO (session & request/response types)
  - Integration (Spring AI -> Vertex AI Gemini)

Key Backend Files
- BackendApplication.java: Spring Boot entry point.
- controller/InterviewController.java: REST endpoints under /api.
- service/InterviewService & VertexInterviewService: Interface and implementation. The service manages sessions and talks to Gemini (or mock).
- model/InterviewSession.java: In‑memory session state.
- dto/*.java: Request/response types for the API.
- config/WebConfig.java: Centralized CORS for the monolith.
- advice/GlobalExceptionHandler.java: Standardized error responses.
- application.properties: Documented config (project id, location, model).

API Endpoints
- GET /api/health → "OK"
- POST /api/interview → One‑shot opening question (legacy endpoint)
- POST /api/interview/start → Starts a session; returns sessionId and first interviewer message
- POST /api/interview/message → Candidate answers; returns interviewer next message (AI controls when to end)
- POST /api/interview/finish → Ends the session and returns rating, feedback, and transcript (kept for compatibility)

Running Locally
1) Backend
   - Java 17+ and Maven.
   - Optional (for live Vertex AI):
     - Set env vars: GOOGLE_CLOUD_PROJECT and VERTEX_LOCATION (e.g., us-central1)
     - Optionally set GEMINI_MODEL (e.g., gemini-1.5-flash)
     - Ensure Google ADC is configured (e.g., gcloud auth application-default login) or provide service account creds.
   - Start: cd backend && mvnw.cmd spring-boot:run (Windows) or ./mvnw spring-boot:run (Unix)
   - Verify: GET http://localhost:8080/api/health

2) Frontend
   - cd frontend && npm install && npm run dev
   - Open http://localhost:5173
   - Optionally set VITE_API_BASE in frontend/.env to point to backend if different.

Frontend Notes
- Uses pdfjs-dist v4 with ES module worker loaded from CDN to ensure reliable PDF parsing under Vite.
- Simple chat interface: AI messages on the left, user on the right. The AI can end the interview and return rating and feedback inline.

Extending the Monolith
- Persistence: Replace in‑memory sessions with a repository (JPA + Postgres) or a shared cache (Redis) for multi‑instance deployments.
- AuthN/Z: Add login and protect endpoints; bind sessions to users.
- Observability: Add structured logging, request ids, and metrics (Micrometer + Prometheus) if needed.
- Validation: Add Bean Validation annotations to DTOs and enable method validation.

License
This project is intended for demonstration/learning and can be adapted to your needs.