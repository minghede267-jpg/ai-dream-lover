import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

// 模型 API 端点映射
const MODEL_ENDPOINTS = {
    openai: 'https://api.openai.com/v1/chat/completions',
    deepseek: 'https://api.deepseek.com/v1/chat/completions',
    zhipu: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    grok: 'https://api.x.ai/v1/chat/completions' // 预留
};

function getHeaders(model, apiKey) {
    return {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    };
}

function buildRequestBody(model, messages, character, userInput) {
    const systemMessage = {
        role: 'system',
        content: `你正在扮演一个名为'${character.name}'的角色。性格：${character.personality}。背景：${character.background}。请完全以这个角色的身份和语气与用户对话。每次回复请以JSON格式返回，包含以下字段：dialogue（你的台词，字符串），options（2-4个用户可能的下一句话，数组），expression_change（可选，你的表情，如idle/happy/sad等）。只返回JSON，不要其他文字。`
    };
    const userMessage = { role: 'user', content: userInput };
    const history = messages.filter(m => m.role !== 'system');
    return {
        model: model === 'openai' ? 'gpt-3.5-turbo' : 
               model === 'deepseek' ? 'deepseek-chat' :
               model === 'zhipu' ? 'glm-4' : 
               model === 'grok' ? 'grok-1' : 'gpt-3.5-turbo',
        messages: [systemMessage, ...history, userMessage],
        temperature: 0.8,
        stream: false
    };
}

// ✅ 关键路由：必须用 POST 方法
app.post('/api/chat', async (req, res) => {
    const { model, apiKey, character, messages, userInput } = req.body;
    
    if (!apiKey) {
        return res.status(400).json({ error: '缺少API密钥' });
    }

    const endpoint = MODEL_ENDPOINTS[model];
    if (!endpoint) {
        return res.status(400).json({ error: '不支持的模型' });
    }

    const headers = getHeaders(model, apiKey);
    const body = buildRequestBody(model, messages, character, userInput);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || 'API调用失败' });
        }

        const aiMessage = data.choices[0].message.content;
        let parsed;
        try {
            parsed = JSON.parse(aiMessage);
        } catch (e) {
            parsed = {
                dialogue: aiMessage,
                options: ['继续', '原来如此', '然后呢'],
                expression_change: null
            };
        }
        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ 添加一个测试路由，方便验证服务是否正常
app.get('/test', (req, res) => {
    res.json({ message: '后端服务运行正常' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
