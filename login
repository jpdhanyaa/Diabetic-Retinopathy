<html lang="en"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/><style>@layer base{html,body{margin:0;padding:0;}body{overscroll-behavior:none;}main>:first-child{margin-top:0!important;}main>:last-child{margin-bottom:0!important;}}::-webkit-scrollbar{display:none;}</style><script src="https://cdn.tailwindcss.com"></script><script id="tailwind-config">tailwind.config={theme:{extend:{"colors":{"on-primary":"#ffffff","outline":"#76777d","tertiary-fixed":"#a2eeff","on-error-container":"#93000a","background":"#f7f9fb","on-primary-fixed-variant":"#3f465c","tertiary-container":"#001f25","on-tertiary-fixed":"#001f25","on-primary-container":"#7c839b","on-error":"#ffffff","on-secondary":"#ffffff","on-tertiary-container":"#0091a5","surface-bright":"#f7f9fb","on-secondary-fixed-variant":"#005049","primary-container":"#131b2e","surface-container-high":"#e6e8ea","inverse-surface":"#2d3133","on-tertiary-fixed-variant":"#004e5a","secondary-fixed":"#89f5e7","inverse-on-surface":"#eff1f3","on-primary-fixed":"#131b2e","outline-variant":"#c6c6cd","surface-variant":"#e0e3e5","secondary-container":"#86f2e4","surface-tint":"#565e74","on-surface":"#191c1e","surface-container-low":"#f2f4f6","tertiary":"#000000","surface-dim":"#d8dadc","error":"#ba1a1a","error-container":"#ffdad6","inverse-primary":"#bec6e0","secondary":"#006a61","primary-fixed":"#dae2fd","on-tertiary":"#ffffff","on-background":"#191c1e","tertiary-fixed-dim":"#2fd9f4","primary":"#000000","surface-container":"#eceef0","on-surface-variant":"#45464d","primary-fixed-dim":"#bec6e0","on-secondary-container":"#006f66","surface-container-highest":"#e0e3e5","on-secondary-fixed":"#00201d","secondary-fixed-dim":"#6bd8cb","surface-container-lowest":"#ffffff","surface":"#f7f9fb"}}}}</script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/></head><body class="bg-background font-body-md text-on-surface flex items-center justify-center min-h-screen"><main class="w-full"><div class="flex items-center justify-center w-full min-h-screen relative overflow-hidden bg-surface px-gutter py-xl">
<!-- WebGL Background -->

<!-- Subtle gradient overlay to ensure readability -->
<div class="absolute inset-0 bg-gradient-to-r from-surface-container via-surface-container/80 to-transparent -z-10 pointer-events-none"></div>
<!-- CENTERED Authentication Card -->
<div class="relative w-full max-w-md bg-surface rounded-[24px] shadow-[0_8px_32px_rgba(19,27,46,0.08)] border border-outline-variant/20 overflow-hidden backdrop-blur-2xl z-20">
<!-- Logo Header -->
<div class="p-8 pb-4 flex justify-center">
<img alt="RetinaAI Logo" class="w-16 h-16 rounded-xl shadow-sm border border-outline-variant/10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrG3kPq7gi1vQBd3rVXKiqK8Uf6UXNzF3PyW472MxiGrW8OZKfyHZR4H0cufKk3NGCIYb6IqXsUbTF-M9JDzuYwzZ_aq4NSbg_zWXCsaduAH_PqnryPP-dE1H3__eckB6RoK7Prdi7rM1VyGB_7vTgTnMCQmBgIZU6BCJSSyyfe4BD77-2i7-3FitmeDaz_qkKpHGdzDK5uWoW8E83MZs63FXJaWLRHMwAAWKjnHERA5rCk56a8-u9"/>
</div>
<div class="relative w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]" id="auth-container" style="height: 480px;">
<!-- LOGIN FORM -->
<div class="absolute top-0 left-0 w-full h-full px-8 pb-8 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] translate-x-0" id="login-form-wrapper">
<div class="text-center mb-8">
<h2 class="font-headline-md text-headline-md text-on-surface mb-2">Welcome Back</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant">Login to continue screening patients</p>
</div>
<form class="flex-1 flex flex-col gap-5" id="login-form">
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10 transition-colors peer-focus:text-secondary" for="login-identifier">Username / Phone Number</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="login-identifier" placeholder="Username or Phone" required="" type="text"/>
<span class="material-symbols-outlined absolute right-4 top-3.5 text-outline peer-focus:text-secondary transition-colors">person</span>
<p class="text-error font-body-sm text-[12px] mt-1 hidden" id="login-identifier-error">Please enter a valid identifier.</p>
</div>
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10 transition-colors peer-focus:text-secondary" for="login-password">Password</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all pr-12" id="login-password" placeholder="••••••••" required="" type="password"/>
<button class="absolute right-4 top-3.5 text-outline hover:text-on-surface transition-colors focus:outline-none" onclick="togglePasswordVisibility('login-password', this)" type="button">
<span class="material-symbols-outlined">visibility_off</span>
</button>
</div>
<div class="flex justify-end -mt-2">
<a class="font-body-sm text-body-sm text-secondary hover:text-on-secondary-container transition-colors" href="#">Forgot Password?</a>
</div>
<div class="mt-auto pt-6">
<button class="w-full bg-secondary text-on-secondary font-headline-md text-[16px] py-3.5 rounded-xl hover:bg-on-secondary-container transition-colors flex items-center justify-center gap-2 relative overflow-hidden group" id="login-btn" type="submit">
<span class="relative z-10 flex items-center gap-2" id="login-btn-text">
                  Login <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
</span>
<div class="hidden absolute inset-0 bg-secondary flex items-center justify-center z-20" id="login-spinner">
<span class="material-symbols-outlined animate-spin">progress_activity</span>
</div>
</button>
<div class="text-center mt-6">
<p class="font-body-sm text-on-surface-variant">
                  Don't have an account? 
                  <button class="text-secondary font-medium hover:underline focus:outline-none ml-1" onclick="switchToRegister()" type="button">Create New Account</button>
</p>
</div>
</div>
</form>
</div>
<!-- REGISTRATION FORM -->
<div class="absolute top-0 left-0 w-full h-full px-8 pb-8 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] translate-x-full opacity-0 invisible overflow-y-auto scrollbar-hide" id="register-form-wrapper">
<div class="text-center mb-6">
<h2 class="font-headline-md text-headline-md text-on-surface mb-2">Create New Account</h2>
<p class="font-body-sm text-body-sm text-on-surface-variant">Register to access the screening system</p>
</div>
<form class="flex flex-col gap-5" id="register-form">
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-name">Full Name</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="reg-name" placeholder="Dr. Jane Doe" required="" type="text"/>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-age">Age</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="reg-age" max="120" min="18" placeholder="Years" required="" type="number"/>
<p class="text-error font-body-sm text-[12px] mt-1 hidden" id="reg-age-error">Invalid age.</p>
</div>
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-gender">Gender</label>
<select class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all appearance-none" id="reg-gender" required="">
<option disabled="" selected="" value="">Select</option>
<option value="f">Female</option>
<option value="m">Male</option>
<option value="o">Other</option>
<option value="p">Prefer not to say</option>
</select>
<span class="material-symbols-outlined absolute right-3 top-3.5 text-outline pointer-events-none">expand_more</span>
</div>
</div>
<div class="grid grid-cols-2 gap-4">
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-phone">Phone Number</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="reg-phone" placeholder="(555) 000-0000" required="" type="tel"/>
<p class="text-error font-body-sm text-[12px] mt-1 hidden" id="reg-phone-error">Invalid format.</p>
</div>
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-weight">Weight (kg)</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="reg-weight" max="300" min="20" placeholder="kg" required="" type="number"/>
</div>
</div>
<div class="relative">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-password">Password</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all pr-12" id="reg-password" minlength="8" placeholder="Create password" required="" type="password"/>
<button class="absolute right-4 top-3.5 text-outline hover:text-on-surface focus:outline-none" onclick="togglePasswordVisibility('reg-password', this)" type="button">
<span class="material-symbols-outlined">visibility_off</span>
</button>
</div>
<div class="relative mb-2">
<label class="absolute -top-2.5 left-3 px-1 bg-surface font-label-caps text-label-caps text-outline z-10" for="reg-confirm">Confirm Password</label>
<input class="peer w-full bg-transparent border border-outline-variant rounded-xl px-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all" id="reg-confirm" placeholder="Confirm password" required="" type="password"/>
<p class="text-error font-body-sm text-[12px] mt-1 hidden" id="reg-confirm-error">Passwords do not match.</p>
</div>
<div class="pt-2">
<button class="w-full bg-primary-container text-on-primary-container font-headline-md text-[16px] py-3.5 rounded-xl hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 relative overflow-hidden group border border-outline-variant/30" id="reg-btn" type="submit">
<span class="relative z-10 flex items-center gap-2" id="reg-btn-text">
                  Create Account <span class="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">how_to_reg</span>
</span>
<div class="hidden absolute inset-0 bg-secondary text-on-secondary flex items-center justify-center z-20 transition-all duration-300" id="reg-success">
<span class="material-symbols-outlined mr-2">check_circle</span> Account Created
                </div>
</button>
<div class="text-center mt-6 pb-2">
<p class="font-body-sm text-on-surface-variant">
                  Already have an account? 
                  <button class="text-secondary font-medium hover:underline focus:outline-none ml-1" onclick="switchToLogin()" type="button">Login</button>
</p>
</div>
</div>
</form>
</div>
</div>
</div>
</div>
<style>
  /* Utility for hiding scrollbar in register form if it overflows */
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
</style>
<script>
  function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('span');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = 'visibility';
    } else {
      input.type = 'password';
      icon.textContent = 'visibility_off';
    }
  }

  const container = document.getElementById('auth-container');
  const loginForm = document.getElementById('login-form-wrapper');
  const registerForm = document.getElementById('register-form-wrapper');

  function switchToRegister() {
    // Adjust container height for register form
    container.style.height = '600px';
    
    // Slide login out to left
    loginForm.classList.remove('translate-x-0');
    loginForm.classList.add('-translate-x-full', 'opacity-0', 'invisible');
    
    // Slide register in from right
    registerForm.classList.remove('translate-x-full', 'opacity-0', 'invisible');
    registerForm.classList.add('translate-x-0');
  }

  function switchToLogin() {
    // Revert container height
    container.style.height = '480px';
    
    // Slide register out to right
    registerForm.classList.remove('translate-x-0');
    registerForm.classList.add('translate-x-full', 'opacity-0', 'invisible');
    
    // Slide login in from left
    loginForm.classList.remove('-translate-x-full', 'opacity-0', 'invisible');
    loginForm.classList.add('translate-x-0');
  }

  // Login Form Submission simulation
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const identifier = document.getElementById('login-identifier');
    const errorMsg = document.getElementById('login-identifier-error');
    
    // Basic validation
    if (identifier.value.length < 3) {
      errorMsg.classList.remove('hidden');
      identifier.classList.add('border-error');
      return;
    }
    errorMsg.classList.add('hidden');
    identifier.classList.remove('border-error');

    const spinner = document.getElementById('login-spinner');
    spinner.classList.remove('hidden');
    
    setTimeout(() => {
      spinner.classList.add('hidden');
      // Simulate redirect
      alert('Login successful. Redirecting to dashboard...');
    }, 1500);
  });

  // Register Form Validation
  document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let isValid = true;

    // Password Match
    const pwd = document.getElementById('reg-password').value;
    const confirmPwd = document.getElementById('reg-confirm');
    const confirmError = document.getElementById('reg-confirm-error');
    
    if (pwd !== confirmPwd.value) {
      confirmError.classList.remove('hidden');
      confirmPwd.classList.add('border-error');
      isValid = false;
    } else {
      confirmError.classList.add('hidden');
      confirmPwd.classList.remove('border-error');
    }

    // Phone simple regex validation
    const phone = document.getElementById('reg-phone');
    const phoneError = document.getElementById('reg-phone-error');
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    
    if (!phoneRegex.test(phone.value.replace(/\s+/g, ''))) {
       phoneError.classList.remove('hidden');
       phone.classList.add('border-error');
       isValid = false;
    } else {
       phoneError.classList.add('hidden');
       phone.classList.remove('border-error');
    }

    if (isValid) {
      const successOverlay = document.getElementById('reg-success');
      successOverlay.classList.remove('hidden');
      
      setTimeout(() => {
        successOverlay.classList.add('hidden');
        switchToLogin();
        // Clear form
        this.reset();
      }, 2000);
    }
  });
</script></main></body></html>
