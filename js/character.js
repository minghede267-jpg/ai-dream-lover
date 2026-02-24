// ===== 请替换下面的占位符 =====
const SUPABASE_URL = '你的SUPABASE_URL';
const SUPABASE_ANON_KEY = '你的SUPABASE_ANON_KEY';
// =============================

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) window.location.href = 'index.html';
});

document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('char-personality').value = btn.dataset.preset;
    });
});

document.getElementById('ai-suggest').addEventListener('click', async () => {
    alert('此功能需用户先选择模型并填入密钥，后续完善');
});

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
        avatar_url: 'assets/character_idle.png.JPG' // 匹配实际文件名
    });
    if (error) alert(error.message);
    else window.location.href = 'game.html';
});
