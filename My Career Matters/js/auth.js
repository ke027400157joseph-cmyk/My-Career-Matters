document.addEventListener('DOMContentLoaded', () => {
	const loginForm = document.getElementById('login-form');
	if (!loginForm) return;

	const emailInput = document.getElementById('email');
	const passwordInput = document.getElementById('password');
	const rememberInput = document.getElementById('remember-me');
	const loginButton = document.getElementById('login-btn');
	const errorBanner = document.getElementById('login-error');
	const errorText = document.getElementById('error-text');
	const successBanner = document.getElementById('login-success');
	const togglePassword = document.getElementById('toggle-password');
	const buttonText = loginButton.querySelector('.btn-text');
	const buttonLoader = loginButton.querySelector('.btn-loader');

	function isValidEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	function showFieldError(field, message) {
		const input = document.getElementById(field);
		const error = document.getElementById(`${field}-error`);
		if (input) {
			input.classList.toggle('error', Boolean(message));
			input.setAttribute('aria-invalid', String(Boolean(message)));
		}
		if (error) error.textContent = message;
	}

	function clearErrors() {
		showFieldError('email', '');
		showFieldError('password', '');
		errorBanner.hidden = true;
	}

	function showBannerError(message) {
		errorText.textContent = message;
		errorBanner.hidden = false;
		successBanner.hidden = true;
	}

	function setLoadingState(isLoading) {
		loginButton.disabled = isLoading;
		buttonText.hidden = isLoading;
		buttonLoader.hidden = !isLoading;
	}

	if (togglePassword) {
		togglePassword.addEventListener('click', () => {
			const showPassword = passwordInput.type === 'password';
			passwordInput.type = showPassword ? 'text' : 'password';
			togglePassword.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
			togglePassword.setAttribute('aria-pressed', String(showPassword));
			const icon = togglePassword.querySelector('i');
			if (icon) {
				icon.classList.toggle('fa-eye', !showPassword);
				icon.classList.toggle('fa-eye-slash', showPassword);
			}
		});
	}

	fetch('../backend/auth/session.php', { credentials: 'same-origin' })
		.then(async response => {
			const session = await response.json();
			if (response.ok && session.authenticated === true) window.location.replace('dashboard.html');
		})
		.catch(() => {});

	const query = new URLSearchParams(window.location.search);
	if (query.has('loggedout') || query.has('registered')) {
		successBanner.textContent = query.has('loggedout')
			? 'You have logged out successfully.'
			: 'Your account is ready. Sign in to continue.';
		successBanner.hidden = false;
	}

	loginForm.addEventListener('submit', async event => {
		event.preventDefault();
		clearErrors();

		const email = emailInput.value.trim();
		const password = passwordInput.value;
		let isValid = true;

		if (!email) {
			showFieldError('email', 'Email is required.');
			isValid = false;
		} else if (!isValidEmail(email)) {
			showFieldError('email', 'Please enter a valid email.');
			isValid = false;
		}

		if (!password) {
			showFieldError('password', 'Password is required.');
			isValid = false;
		}
		if (!isValid) return;

		setLoadingState(true);
		try {
			const response = await fetch('../backend/auth/login.php', {
				method: 'POST',
				credentials: 'same-origin',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password, remember: rememberInput.checked })
			});
			const result = await response.json();
			if (!response.ok || result.status !== 'success') {
				showBannerError(result.message || 'Invalid email or password.');
				return;
			}

			window.location.replace('dashboard.html');
		} catch (error) {
			console.error('Login error:', error);
			showBannerError('Sign-in is temporarily unavailable. Please try again.');
		} finally {
			setLoadingState(false);
		}
	});
});
