export const MESSAGES = {
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
        NOT_FOUND: "Shared contact not found"
    }
} as const;
