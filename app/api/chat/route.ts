import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  try {
    const { messages, directories, tasks, events, habits, dailies } =
      await req.json();

    if (!directories || directories.length === 0) {
      console.warn('⚠ No directories received in request!');
    }

    const systemMessage = {
      role: 'system',
      content: `
    You are an AI assistant helping the user manage their tasks, events, daily schedule, and directories.
    
    Your job:
    1. Provide clear summaries of tasks, events, daily routines, and directory usage.
    2. Answer questions based on the user's data.
    3. **Format responses using a structured list format with proper line breaks.**
    
    Strictly follow these rules:
    - **Each item MUST start on a new line.**
    - **Do NOT merge items into a single paragraph.**
    - **Do NOT show ID in any form, be it directory ID or any other ID.**
    - **Use proper spacing between items.**
    - **Separate different sections with TWO new lines.**
    - **DO NOT use inline lists.**
    - **Each task, event, habit, or directory should be on a separate line.**
    - **NEVER format as a continuous sentence.**
    
    User's data:
    ${JSON.stringify({
      directories,
      tasks,
      events,
      habits,
      dailies,
    })}
    `,
    };

    const allMessages = [systemMessage, ...messages];

    const result = await streamText({
      model: openai('gpt-4o-mini-2024-07-18'),
      messages: allMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat route error:', error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred.';

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      { status: 500 }
    );
  }
}
