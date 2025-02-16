export const MESSAGES = {

    // Register related messages
    REGISTER: {
        USER_EXISTS: "User already exists",
        MISSING_CREDENTIALS: "Email and password are required",
        USER_CREATED: "User created successfully"
    },
    // User related messages
    USER: {
        NOT_FOUND: "User not found",
        DELETED: "User deleted"
    },

    // Profile related messages
    PROFILE: {
        NOT_FOUND: "Profile not found",
        DELETED: "Profile deleted"
    },

    // Review related messages
    REVIEW: {
        NOT_FOUND: "Review not found",
        DELETED: "Review deleted"
    },

    // Event related messages
    EVENT: {
        NOT_FOUND: "Event not found",
        DELETED: "Event deleted"
    }
} as const;
