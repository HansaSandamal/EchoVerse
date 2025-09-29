/**
 * This is a placeholder function to prevent Netlify build errors
 * caused by an empty file in the functions directory.
 * The main application does not use this function, as it calls the Gemini API
 * directly from the client-side.
 */
const handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "This is a placeholder function to ensure successful deployment." }),
  };
};

export { handler };