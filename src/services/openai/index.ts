import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { generatePrompt, generatePromptDetermine, generatePromptDirect, generatePromptArticle } from "./prompt";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 
 * @param name 
 * @param history 
 */
const run = async (name: string, dataBase: string, history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePrompt(name, dataBase)
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runDetermine = async (dataBase: string, history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePromptDetermine(dataBase)
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
            {
                "role": "system",
                "content": promtp
            },
            ...history
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runPromt = async (promt: string, history: ChatCompletionMessageParam[]): Promise<string> => {

    const promtp = generatePromptDirect(promt)
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
            {
                "role": "user",
                "content": promtp
            },
            ...history
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runOneTimeQuery = async (dataBase: string, promt: string): Promise<string> => {

    const defaultSystem = generatePromptDetermine(dataBase)

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
            {
                "role": "system",
                "content": defaultSystem
            },
            {
                "role": "user",
                "content": promt
            },
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

const runArticleConent = async (name: string, articleContent: string): Promise<string> => {

    const defaultPromt = generatePromptArticle(name, articleContent)

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-16k",
        messages: [
            {
                "role": "user",
                "content": defaultPromt
            },
        ],
        temperature: 0.7,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

export { run, runDetermine, runPromt, runOneTimeQuery, runArticleConent }


