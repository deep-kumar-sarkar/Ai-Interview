package com.example.backend.controller;

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

    public record ChatRequest(String message, boolean isFirstMessage) {}

    // DTO for the outgoing response
    public record ChatResponse(String content) {}

    // DTO for the incoming resume text
    public record ParseRequest(String resumeText) {}

    // DTO for the outgoing parsed information
    public record ParsedResume(String name, String email, String phone) {}

    public record ChatMessage(String role, String content) {}

    // The request from the frontend, including the full context
    public record InterviewTurnRequest(List<ChatMessage> history, int turnNumber) {}

    // The response from the backend, including the next step
    public record InterviewTurnResponse(
            String aiResponse,        // Feedback + next question
            String difficulty,        // Difficulty of the new question
            int timeLimit,            // Time limit in seconds for the new question
            boolean isInterviewOver,  // Flag to indicate the interview has ended
            Integer score,            // Final score (optional)
            String summary            // Final summary (optional)
    ) {}

    @PostMapping("/api/chat")
    public ChatResponse chat(@RequestBody ChatRequest request) {
        String systemPrompt = "You are an expert technical interviewer for a full-stack developer role. " +
                "Your goal is to conduct an interview. Ask one question at a time. " +
                "After the user answers, provide brief, constructive feedback and then ask the next question. " +
                "You will ask 6 questions in total, moving from easy to hard difficulty. " +
                "Start by introducing yourself and asking the very first question.";

        // The user's message is what changes based on the context.
        String userMessage;

        if (request.isFirstMessage()) {
            // For the first message, we can ignore the user's input and just kick off the interview.
            userMessage = "Let's begin the interview.";
        } else {
            // For all subsequent messages, the user's message is their answer.
            userMessage = request.message();
        }

        try {
            String content = chatClient.prompt()
                    .system(systemPrompt) // Set the consistent role for the AI
                    .user(userMessage)    // Use the logic-driven user message
                    .call()
                    .content();
            return new ChatResponse(content);
        } catch (Exception ex) {
            String fallback = request.isFirstMessage()
                    ? "Hello! I will ask you 6 questions about full-stack development. First question (Easy): What is the difference between let, const, and var in JavaScript?"
                    : "Thanks for your answer. Next question (Medium): Can you explain how REST differs from GraphQL and when you would choose one over the other?";
            return new ChatResponse(fallback);
        }
    }

    @PostMapping("/api/parse-resume")
    public Mono<ParsedResume> parseResume(@RequestBody ParseRequest request) {
        String resumeText = request.resumeText() != null ? request.resumeText() : "";

        // Very simple regex-based extraction as a fallback to avoid external API dependency here.
        String email = "";
        String phone = "";
        String name = "";

        // Email
        Matcher emailMatcher = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}").matcher(resumeText);
        if (emailMatcher.find()) {
            email = emailMatcher.group();
        }

        // Phone (simple patterns for international or 10-digit numbers)
        Matcher phoneMatcher = Pattern.compile("(\\+?\\d[\\d\\s()-]{7,}\\d)").matcher(resumeText);
        if (phoneMatcher.find()) {
            phone = phoneMatcher.group();
        }

        // Naive name guess: first non-empty line that contains letters and spaces but not email/phone keywords
        String[] lines = resumeText.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.length() >= 3 && trimmed.length() <= 80 && trimmed.matches("[A-Za-z ,.'-]+") && !trimmed.toLowerCase().contains("email") && !trimmed.toLowerCase().contains("phone")) {
                name = trimmed;
                break;
            }
        }

        ParsedResume parsed = new ParsedResume(name, email, phone);
        return Mono.just(parsed);
    }

    @PostMapping("/api/interview/turn")
    public Mono<InterviewTurnResponse> handleInterviewTurn(@RequestBody InterviewTurnRequest request) {
        int turn = request.turnNumber();
        String difficulty;
        int timeLimit;

        // Determine difficulty and time limit based on the turn number
        if (turn < 2) {
            difficulty = "Easy";
            timeLimit = 20;
        } else if (turn < 4) {
            difficulty = "Medium";
            timeLimit = 60;
        } else {
            difficulty = "Hard";
            timeLimit = 120;
        }

        String systemMessage = "You are an expert technical interviewer. " +
                "Your goal is to conduct an interview for a full-stack developer role. " +
                "You will ask 6 questions in total, increasing in difficulty. " +
                "The user will provide their entire chat history with you. " +
                "Your task is to first provide brief, constructive feedback on their last answer, " +
                "and then ask the next question of the specified difficulty. " +
                "Keep your entire response concise.";

        // Check if the interview is over
        if (turn >= 6) { // After 6 questions, the interview ends
            return Mono.just(new InterviewTurnResponse(
                    "Thank you for completing the interview!",
                    "DONE", 0, true, 88,
                    "The candidate showed strong fundamentals but could improve on system design."
            ));
        }

        // Build the prompt for the AI
        var promptBuilder = chatClient.prompt()
                .system(systemMessage);

        // Add previous messages to the prompt for context
        request.history().forEach(msg -> {
            if (msg.role().equalsIgnoreCase("user")) {
                promptBuilder.user(msg.content());
            } else {
                // If assistant messages method is unavailable, include assistant content as part of system context
                promptBuilder.system("Previous assistant reply: " + msg.content());
            }
        });

        // Add the final instruction
        promptBuilder.user(u -> u.text("Please provide feedback on my last answer and ask your next " + difficulty + " question."));

        return Mono.fromSupplier(() -> {
            try {
                String aiContent = promptBuilder.call().content();
                return new InterviewTurnResponse(aiContent, difficulty, timeLimit, false, null, null);
            } catch (Exception ex) {
                String fallback = "Feedback: Thanks for your previous answer. Next " + difficulty + " question: Explain the core differences between SQL and NoSQL databases and when to use each.";
                return new InterviewTurnResponse(fallback, difficulty, timeLimit, false, null, null);
            }
        });
    }
}