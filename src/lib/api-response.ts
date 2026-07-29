import { NextResponse } from "next/server";

/**
 * Standardized API Error Handling & Information Leakage Prevention Utility
 */

export function handleApiError(
  error: unknown,
  contextMessage: string,
  statusCode = 500
) {
  // Always log detailed stack trace and error info server-side for debugging
  console.error(`[API ERROR] ${contextMessage}:`, error);

  const isProduction = process.env.NODE_ENV === "production";

  // Prevent information leakage: never expose raw stack traces, database schema details, or file paths
  const userFacingError = isProduction
    ? "An unexpected error occurred while processing your request. Please try again later."
    : (error as any)?.message || contextMessage;

  return NextResponse.json(
    {
      success: false,
      error: userFacingError,
    },
    { status: statusCode }
  );
}

export function handleValidationError(validationError: any) {
  const formattedErrors = validationError.errors?.map((err: any) => ({
    field: err.path.join("."),
    message: err.message,
  }));

  return NextResponse.json(
    {
      success: false,
      error: "Invalid request input parameters.",
      details: formattedErrors,
    },
    { status: 400 }
  );
}

export function apiSuccess<T>(data: T, message?: string, statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      ...(message ? { message } : {}),
      ...(typeof data === "object" && data !== null && !Array.isArray(data) ? data : { data }),
    },
    { status: statusCode }
  );
}
