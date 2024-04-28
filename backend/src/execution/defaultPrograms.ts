export const call_llm = `
async function call_llm(prompt: string): Promise<string> {
    const url = "https://api.openai.com/v1/chat/completions";
    const apiKey = "${process.env.OPENAI_API_KEY}"; // Replace with your actual API key
  
    const headers = {
      "Content-Type": "application/json",
      Authorization: \`Bearer \${apiKey}\`,
    };
  
    const body = JSON.stringify({
      model: "gpt-4-turbo",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 150, // You can adjust the max_tokens as needed
      temperature: 0.7, // You can adjust the temperature for randomness
    });
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: body,
      });
  
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
  
      const data: { choices: { message: { role: string; content: string } }[] } =
        (await response.json()) as any;
      return data.choices[0].message.content.trim();
    } catch (error: any) {
      console.error("Error calling OpenAI API:", error);
      return \`Error: \${error.message}\`;
    }
  }
`;
