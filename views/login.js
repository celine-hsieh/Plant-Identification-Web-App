const trans = {
    en: {
        title: "LOGIN",
        title_R: "Register",
        Word_R: "English letters & numbers only",
        USER_R: "Username",
        PASS_R: "Password",
        PASS_C: "Confirm Password",
        USER: "Username",
        PASS: "Password",
        submitButton: "login",
        register: "sign up",
        registerButton: "register",
        passwordError: "Passwords do not match.",
        registerMessage: "Registration successful! Please sign in.",
        validationError: "Username and password must contain only English letters and numbers.",
        exist: "Username already registered!",
        none: "Username and password cannot be empty.",
    },
    zh: {
        title: "使用者登入",
        title_R: "註冊",
        Word_R: "僅限英文數字組合",
        USER_R: "帳號",
        PASS_R: "密碼",
        PASS_C: "確認密碼",
        USER: "帳號",
        PASS: "密碼",
        submitButton: "登入",
        register: "註冊",
        registerButton: "註冊",
        passwordError: "確認密碼與密碼不一致",
        registerMessage: "註冊成功! 請登入",
        validationError: "帳號密碼只能是英文數字",
        exist: "帳號已存在",
        none: "帳號密碼不可空白",

    }
};


function switchLanguage(lang) {
    currentLanguage = lang; // Save the current language
    document.getElementById('title').textContent = trans[lang].title;
    document.getElementById('title_R').textContent = trans[lang].title_R;
    document.getElementById('Word_R').textContent = trans[lang].Word_R;
    document.getElementById('USER').textContent = trans[lang].USER;
    document.getElementById('PASS').textContent = trans[lang].PASS;
    document.getElementById('USER_R').textContent = trans[lang].USER_R;
    document.getElementById('PASS_R').textContent = trans[lang].PASS_R;
    document.getElementById('PASS_C').textContent = trans[lang].PASS_C;
    document.getElementById('submitButton').textContent = trans[lang].submitButton;
    document.getElementById('register').textContent = trans[lang].register;
    document.getElementById('registerButton').textContent = trans[lang].registerButton;
    document.getElementById('passwordError').textContent = trans[lang].passwordError;
    document.getElementById('registerMessage').textContent = trans[lang].registerMessage;
    document.getElementById('validationError').textContent = trans[lang].validationError;
}

document.addEventListener('DOMContentLoaded', () => {
    const languageSwitcher = document.getElementById('languageSwitcher');

    // 初始化默认语言
    switchLanguage(languageSwitcher.value);

    // 语言切换事件
    languageSwitcher.addEventListener('change', (event) => {
        switchLanguage(event.target.value);
    });

    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userID = document.getElementById('userID').value;
        const user_password = document.getElementById('user_password').value;
        console.log('username:', userID);
        console.log('password:', user_password);

        // Send a POST request to the server with the username and password
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userID, user_password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                sessionStorage.setItem('token', data.token); // 保存 JWT
                window.location.href = `../index.html?lang=${currentLanguage}`; // 登录成功后重定向
            } else {
                // 处理登录失败情况
                console.error('Login failed:', data.message);
            }
        } else {
            console.error('Login failed.');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {

    const registerButton = document.getElementById('registerButton');
    const registerPanel = document.getElementById('registerPanel');
    const closeRegisterPanel = document.getElementById('closeRegisterPanel');

    // 显示注册面板
    registerButton.addEventListener('click', function () {
        registerPanel.style.right = '0';
    });

    // 隐藏注册面板
    closeRegisterPanel.addEventListener('click', function () {
        registerPanel.style.right = '-100%';
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');
    const passwordError = document.getElementById('passwordError');
    const registerMessage = document.getElementById('registerMessage');
    const validationError = document.getElementById('validationError'); // 添加一个用于显示验证错误的元素

    function isValid(str) {
        return /^[A-Za-z0-9]+$/.test(str); // 正则表达式，只允许英文和数字
    }


    function hideErrorMessages() {
        passwordError.style.display = 'none';
        registerMessage.style.display = 'none';
        validationError.style.display = 'none';
    }

    // 当用户更改输入字段时隐藏错误消息
    ['input', 'change'].forEach(event => {
        registerForm.addEventListener(event, hideErrorMessages);
    });

    // 表单提交事件
    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // 在事件处理器内部获取输入值
        const registerUsername = document.getElementById('registerUsername').value;
        const registerPassword = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // 检查输入是否有效
        if (!isValid(registerUsername) || !isValid(registerPassword)) {
            validationError.style.display = 'block';
            return;
        } else if (!registerUsername || !registerPassword) {
            validationError.style.display = 'block';
            validationError.textContent = trans[currentLanguage].none;
        }

        // 检查密码是否匹配
        if (registerPassword !== confirmPassword) {
            passwordError.style.display = 'block';
            return;
        } else {
            passwordError.style.display = 'none';
        }

        // 打印调试信息
        console.log('username:', registerUsername);
        console.log('password:', registerPassword);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ registerUsername, registerPassword })
            });

            if (!response.ok) {
                if (response.status === 400) {
                    // registerMessage.textContent = trans[currentLanguage].registerMessage;
                    registerMessage.textContent = trans[currentLanguage].exist;
                    registerMessage.style.color = 'red';
                    registerMessage.style.display = 'block'; // 
                    // throw new Error("用戶已存在");
                } else {
                    throw new Error('Failed to register');
                }
            } else {
                // const data = await response.json();
                registerMessage.textContent = trans[currentLanguage].registerMessage;
                registerMessage.style.color = 'green';
                registerMessage.style.display = 'block'; // 确保显示消息
                registerForm.reset();
            }
        } catch (error) {
            // registerMessage.textContent = trans[currentLanguage].errorText;
            registerMessage.textContent = error.message;
            registerMessage.style.display = 'block'; // 确保显示消息
            registerMessage.style.color = 'red';
        }
    });
});
