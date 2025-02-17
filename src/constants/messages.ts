export const MESSAGES = {

    // Register related messages
    REGISTER: {
        USER_EXISTS: "User already exists",
        MISSING_CREDENTIALS: "Email and password are required",
        USER_CREATED: "User created successfully"
    },

    // Login related messages
    LOGIN: {
        INVALID_CREDENTIALS: "Invalid credentials",
        MISSING_CREDENTIALS: "Email and password are required",
        LOGIN_SUCCESSFUL: "Login successful"
    },

    LOGOUT: {
        LOGOUT_SUCCESSFUL: "Logged out successfully",
        LOGOUT_FAILED: "Failed to logout"
    },
    // User related messages
    USER: {
        NOT_FOUND: "User not found",
        EMAIL_NOT_FOUND: "User email not found",
        DELETED: "User deleted"
    },

    // Profile related messages
    PROFILE: {
        NOT_FOUND: "Profile not found",
        DELETED: "Profile deleted",
        ALREADY_EXISTS: "User already has a profile"
    },

    // Review related messages
    REVIEW: {
        NOT_FOUND: "Review not found",
        DELETED: "Review deleted"
    },

    // Event related messages
    EVENT: {
        NOT_FOUND: "Event not found",
        DELETED: "Event deleted",
        REGISTRATION: {
            USER_ID_REQUIRED: "userId is required in request body",
            DEADLINE_PASSED: "Registration deadline has passed",
            MAX_PARTICIPANTS: "Event has reached maximum participants",
            ALREADY_REGISTERED: "User is already registered for this event",
            PARTICIPANT_NOT_REGISTERED: "User is not registered for this event"
        },
        MANAGEMENT: {
            MIN_PARTICIPANTS: "Event needs at least 2 participants to start",
            ALREADY_ACTIVE: "Event is already active",
            NOT_ACTIVE: "Event is not active",
            MUST_BE_ACTIVE: "Event must be active to start a new round",
            ROUND_ACTIVE: "Current round must be ended before starting a new one",
            MAX_ROUNDS: "Maximum number of rounds (3) has been reached",
            NO_ACTIVE_ROUND: "No active round to end",
            MUST_BE_ACTIVE_FOR_ROUND: "Event must be active to end a round"
        }
    },

    // Shared Contact related messages
    SHARED_CONTACT: {
        CONTACT_NOT_FOUND: "Contact user not found",
        ALREADY_EXISTS: "Contact already exists",
        NOT_FOUND: "Shared contact not found",
        DELETED: "Shared contact deleted"
    },

    // Notification related messages
    NOTIFICATION: {
        MESSAGE_REQUIRED: "Message is required",
        NOT_FOUND: "Notification not found",
        DELETED: "Notification deleted"
    }
} as const;
