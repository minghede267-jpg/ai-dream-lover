// ===== 请替换下面的占位符 =====
const SUPABASE_URL = '你的SUPABASE_URL';
const SUPABASE_ANON_KEY = '你的SUPABASE_ANON_KEY';
const API_BASE_URL = 'https://你的后端URL';        // 部署后端后替换为真实URL
// =============================

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentCharacter = null;
let chatHistory = [];
let animator = null;

// 动画管理器
class SpriteAnimator {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.sprites = {};
        this.currentAnim = 'idle';
        this.frameIndex = 0;
        this.lastFrameTime = 0;
        this.frameDuration = 200;
        this.framesPerAnim = 4;
        this.loadSprites();
    }

    async loadSprites() {
        const expressions = ['idle', 'happy', 'sad', 'blink'];
        for (let exp of expressions) {
            const img = new Image();
            // 注意：文件名已适配你上传的 .png.JPG 格式
            img.src = `assets/character_${exp}.png.JPG`;
            await new Promise(resolve => { img.onload = resolve; img.onerror = resolve; });
            this.sprites[exp] = img;
        }
        this.startAnimation();
    }

    startAnimation() {
        const animate = (now) => {
            if (!this.lastFrameTime) this.lastFrameTime = now;
            const elapsed = now - this.lastFrameTime;
            if (elapsed >= this.frameDuration) {
                this.frameIndex = (this.frameIndex + 1) % this.framesPerAnim;
                this.lastFrameTime = now;
                this.drawFrame();
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    drawFrame() {
        const img = this.sprites[this.currentAnim];
        if (!img || !img.complete) return;
        const frameWidth = img.width / this.framesPerAnim;
        const frameHeight = img.height;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(
            img,
            frameWidth * this.frameIndex, 0, frameWidth, frameHeight,
            0, 0, this.canvas.width, this.canvas.height
        );
    }

    setExpression(expr) {
        if (this.sprites[expr]) {
            this.currentAnim = expr;
            this.frameIndex = 0;
        }
    }
}

async function init() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    const { data: chars } = await supabase.from('characters').select('*').eq('user_id', user.id).limit(1);
    if (!chars || chars.length === 0) {
        window.location.href = 'character-create.html';
        return;
    }
    currentCharacter = chars[0];
    document.getElementById('speaker-name').innerText = currentCharacter.name;

    const { data: history } = await supabase.from('chat_history').select('*').eq('character_id', currentCharacter.id).order('created_at', { ascending: true });
    chatHistory = history || [];

    animator = new SpriteAnimator('character-canvas');

    document.getElementById('show-free-input').addEventListener('click', () => {
        const input = document.getElementById('free-input');
        input.style.display = 'block';
        input.focus();
    });
    document.getElementById('free-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = e.target.value.trim();
            if (text) {
                handleUserInput(text);
                e.target.value = '';
                e.target.style.display = 'none';
            }
        }
    });
}

async function handleUserInput(input) {
    addMessage('user', input);
    chatHistory.push({ role: 'user', content: input });

    const model = document.getElementById('model-choice').value;
    const apiKey = document.getElementById('api-key').value;
    if (!apiKey) {
        alert('请输入你的 API 密钥');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                apiKey,
                character: currentCharacter,
                messages: chatHistory.slice(-10),
                userInput: input
            })
        });
        const data = await res.json();
        addMessage('assistant', data.dialogue);
        chatHistory.push({ role: 'assistant', content: data.dialogue });

        document.getElementById('dialogue-text').innerText = data.dialogue;
        if (data.expression_change) {
            animator.setExpression(data.expression_change);
        }
        renderOptions(data.options || []);
    } catch (err) {
        alert('调用失败：' + err.message);
    }
}

function addMessage(role, content) {
    console.log(role, content);
}

function renderOptions(options) {
    const container = document.getElementById('options-area');
    container.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleUserInput(opt);
        container.appendChild(btn);
    });
}

init();
