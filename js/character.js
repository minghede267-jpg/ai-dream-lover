const SUPABASE_URL = '你的SUPABASE_URL';
const SUPABASE_ANON_KEY = '你的SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 检查登录
supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) window.location.href = 'index.html';
});

// 预设按钮
document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('char-personality').value = btn.dataset.preset;
    });
});

// AI建议（调用后端，需用户已选模型和密钥，这里简化，可后续实现）
document.getElementById('ai-suggest').addEventListener('click', async () => {
    // 这里可调用AI生成建议，暂略
    alert('此功能需用户先选择模型并填入密钥，后续完善');
});

// 提交角色
document.getElementById('create-character').addEventListener('submit', async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const name = document.getElementById('char-name').value;
    const personality = document.getElementById('char-personality').value;
    const background = document.getElementById('char-background').value;
    const { error } = await supabase.from('characters').insert({
        user_id: user.id,
        name,
        personality,
        background,
        avatar_url: 'assets/character_idle.png' // 默认立绘
    });
    if (error) alert(error.message);
    else window.location.href = 'game.html';
});
