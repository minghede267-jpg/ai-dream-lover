const SUPABASE_URL = 'https://souorplprfxxifsrsyho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdW9ycGxwcmZ4eGlmc3JzeWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU1NDIsImV4cCI6MjA4NzUyMTU0Mn0.mYppPptcGIi03Tr-GwSLQFXGpwgHKIPVsvlfZ_XZ3NI';

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
        avatar_url: 'assets/character_idle.png.JPG'
    });
    if (error) alert(error.message);
    else window.location.href = 'game.html';
});
