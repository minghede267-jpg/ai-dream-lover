alert('auth.js 已加载 - 如果看到此弹窗，说明脚本执行了');

const SUPABASE_URL = 'https://souorplprfxxifsrsyho.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdW9ycGxwcmZ4eGlmc3JzeWhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NDU1NDIsImV4cCI6MjA4NzUyMTU0Mn0.mYppPptcGIi03Tr-GwSLQFXGpwgHKIPVsvlfZ_XZ3NI';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else window.location.href = 'character-create.html';
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
        alert('注册成功，请登录');
        showLogin();
    }
});

document.getElementById('show-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('register-container').style.display = 'block';
});
document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
});

function showLogin() {
    document.getElementById('register-container').style.display = 'none';
    document.getElementById('auth-container').style.display = 'block';
}
