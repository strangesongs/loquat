// Shared state builders for sidebar auth transitions.
export function getTinyScreenGuestAuthState(mode = 'login') {
    const isLoginMode = mode !== 'register';
    return {
        guestAddAttempted: true,
        isLoginMode,
        authError: '',
        authUserName: '',
        authPassword: '',
        authEmail: ''
    };
}
