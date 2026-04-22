import Anthropic from "@anthropic-ai/sdk";
import type { TextBlock } from "@anthropic-ai/sdk/resources";
import { ENV } from "../../../shared/config/environments";

type AnthropicConfig = {
    apiKey?:string;
    baseUrl?:string;
    model? : string;
}

// export class AnthropicProvider {
   //Implement IAIProvider interface
// }   



export async function testAnthropicConnection(config:AnthropicConfig) {
    const client = new Anthropic({
        apiKey:ENV.ANTHROPIC_API_KEY,
        baseURL:config.baseUrl,
    })

    const mdl :string = config.model || ENV.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

    try {
        const response = await client.messages.create({
            model: mdl,
            max_tokens: 10,
            messages: [{
                role: 'user',
                content : "say ok"
            }],
        });
        const block = response.content[0] as TextBlock;
        const text = block.text;
        console.log("Connection to ANthropic succesful", text);
    
    }catch(error){
        console.error("Connection to ANthropic failed", error);
    }   

}
