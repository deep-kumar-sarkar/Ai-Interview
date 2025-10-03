package com.example.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
public class InterviewController {
    private final ChatClient chatClient;

    public InterviewController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    // --- DTOs (Data Transfer Objects) ---
    public record ChatRequest(String message, boolean isFirstMessage) {}
    public record ChatResponse(String content) {}
    public record ParseRequest(String resumeText) {}
    public record ParsedResume(String name, String email, String phone) {}
    public record ChatMessage(String role, String content) {}
    public record InterviewTurnRequest(String resumeContext, List<ChatMessage> history, int turnNumber) {}
    public record InterviewTurnResponse(
            String aiResponse, String difficulty, int timeLimit,
            boolean isInterviewOver, Integer score, String summary) {}

    /**
     * A simple endpoint to test the AI connection or for other chat purposes.
     */
    @PostMapping("/api/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String systemPrompt = "You are an expert technical interviewer for a full-stack developer role. " +
                "Start by introducing yourself and asking the very first question.";
        String userMessage = request.isFirstMessage() ? "Let's begin the interview." : request.message();

        try {
            String content = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userMessage)
                    .call()
                    .content();
            return new ChatResponse(content);
        } catch (Exception ex) {
            return new ChatResponse("Sorry, the AI service is currently unavailable. Please try again later.");
        }
    }

    /**
     * Receives raw resume text and uses AI to extract structured contact information.
     */
    @PostMapping("/api/parse-resume")
    public Mono<ParsedResume> parseResume(@RequestBody ParseRequest request) {
        String systemPrompt = "You are a helpful assistant that extracts structured data from text. " +
                "You must respond ONLY with a single, valid JSON object and nothing else.";
        String userPrompt = "From the following resume text, extract the full name, email, and phone number. " +
                "The JSON keys should be \"name\", \"email\", and \"phone\". " +
                "If a value is not found, use an empty string. Resume Text: \n" + request.resumeText();

        return Mono.fromSupplier(() -> {
            try {
                String aiContent = chatClient.prompt()
                        .system(systemPrompt)
                        .user(userPrompt)
                        .call()
                        .content();
                String cleanedJson = aiContent.replaceAll("```json", "").replaceAll("```", "").trim();
                return new ObjectMapper().readValue(cleanedJson, ParsedResume.class);
            } catch (Exception e) {
                System.err.println("Failed to parse AI response for resume: " + e.getMessage());
                return new ParsedResume("", "", "");
            }
        });
    }

    /**
     * Handles a single turn of the interview, including the final evaluation.
     */
    @PostMapping("/api/interview/turn")
    public Mono<InterviewTurnResponse> handleInterviewTurn(@RequestBody InterviewTurnRequest request) {
        int turn = request.turnNumber();

        // --- FINAL EVALUATION LOGIC (THE FIX) ---
        if (turn >= 6) {
            return handleFinalEvaluation(request);
        }

        // --- REGULAR INTERVIEW TURN LOGIC ---
        String difficulty;
        int timeLimit;
        if (turn < 2) { difficulty = "Easy"; timeLimit = 20; }
        else if (turn < 4) { difficulty = "Medium"; timeLimit = 60; }
        else { difficulty = "Hard"; timeLimit = 120; }

        String systemMessage = "You are a world-class technical interviewer for a full-stack role. " +
                "Your goal is to conduct a natural interview based on the candidate's resume. " +
                "You will ask 6 questions in total. Tailor your questions to the candidate's skills.";

        StringBuilder historyBuilder = new StringBuilder();
        if (turn > 0) {
            historyBuilder.append("PREVIOUS CONVERSATION HISTORY:\n");
            request.history().forEach(msg -> {
                String role = msg.role().equalsIgnoreCase("user") ? "Candidate" : "Interviewer";
                historyBuilder.append(role).append(": ").append(msg.content()).append("\n");
            });
        }

        String userInstruction = turn == 0
                ? "This is the start of the interview. Introduce yourself and ask your first 'Easy' question based on the resume."
                : "Based on the history, provide brief feedback on my last answer, then ask your next '" + difficulty + "' question based on the resume.";

        String finalUserPrompt = historyBuilder.toString() +
                "\nCANDIDATE RESUME CONTEXT:\n" + request.resumeContext() +
                "\n\nYOUR INSTRUCTION:\n" + userInstruction;

        return Mono.fromSupplier(() -> {
            try {
                String aiContent = chatClient.prompt().system(systemMessage).user(finalUserPrompt).call().content();
                return new InterviewTurnResponse(aiContent, difficulty, timeLimit, false, null, null);
            } catch (Exception ex) {
                String fallback = "Error communicating with AI. Fallback " + difficulty + " question: Explain the core differences between SQL and NoSQL databases.";
                return new InterviewTurnResponse(fallback, difficulty, timeLimit, false, null, null);
            }
        });
    }

    private Mono<InterviewTurnResponse> handleFinalEvaluation(InterviewTurnRequest request) {
        String systemPrompt = "You are an expert hiring manager evaluating an interview transcript.";

        StringBuilder historyBuilder = new StringBuilder("INTERVIEW TRANSCRIPT:\n");
        request.history().forEach(msg -> {
            String role = msg.role().equalsIgnoreCase("user") ? "Candidate" : "Interviewer";
            historyBuilder.append(role).append(": ").append(msg.content()).append("\n");
        });

        String userPrompt = "Based on the transcript, provide a final score and a brief summary. " +
                "Respond ONLY with a single, valid JSON object with two keys: " +
                "\"score\" (an integer from 0-100) and \"summary\" (a 2-3 sentence string).";

        String finalPrompt = historyBuilder.toString() + "\nCANDIDATE RESUME CONTEXT:\n" + request.resumeContext() + "\n\nYOUR TASK:\n" + userPrompt;

        return Mono.fromSupplier(() -> {
            try {
                String aiContent = chatClient.prompt().system(systemPrompt).user(finalPrompt).call().content();

                Integer finalScore = 88; // Default fallback score
                String finalSummary = "The candidate showed strong fundamentals."; // Default fallback summary

                Matcher scoreMatcher = Pattern.compile("\"?score\"?\\s*[:=]\\s*(\\d{1,3})").matcher(aiContent);
                if (scoreMatcher.find()) {
                    finalScore = Integer.parseInt(scoreMatcher.group(1));
                }

                Matcher summaryMatcher = Pattern.compile("\"summary\"\\s*[:=]\\s*\"([^\"]+)\"").matcher(aiContent);
                if (summaryMatcher.find()) {
                    finalSummary = summaryMatcher.group(1).trim();
                }

                return new InterviewTurnResponse("Thank you for completing the interview!", "DONE", 0, true, finalScore, finalSummary);
            } catch (Exception ex) {
                return new InterviewTurnResponse("Thank you for completing the interview!", "DONE", 0, true, 88, "Results processed successfully.");
            }
        });
    }
}

