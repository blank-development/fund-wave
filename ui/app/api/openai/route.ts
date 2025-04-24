import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that rephrases campaign descriptions to make them more compelling and engaging while maintaining the original meaning.",
        },
        {
          role: "user",
          content: `Please rephrase this campaign description to make it more compelling and engaging: ${description}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const rephrasedDescription = completion.choices[0]?.message?.content;

    if (!rephrasedDescription) {
      throw new Error("Failed to generate rephrased description");
    }

    return NextResponse.json({ rephrasedDescription });
  } catch (error) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: "Failed to generate rephrased description" },
      { status: 500 }
    );
  }
}
