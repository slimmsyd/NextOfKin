function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.46c-.27 1.45-1.13 2.68-2.41 3.51v2.92h3.89c2.28-2.1 3.55-5.2 3.55-8.67z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.89-2.92c-1.07.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.71-4.94H1.27v3.07A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.38a7.21 7.21 0 0 1 0-4.76V6.55H1.27a12 12 0 0 0 0 10.9l4.02-3.07z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.59 1.78l3.44-3.44A11.96 11.96 0 0 0 12 0 11.99 11.99 0 0 0 1.27 6.55l4.02 3.07C6.23 6.85 8.88 4.75 12 4.75z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="w-5 h-5 text-foreground" aria-hidden>
      <path
        fill="currentColor"
        d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-22.1-81.9-22.1-53.1 0-99.7 34.6-126.2 84.7-20.9 39.6-10.1 107.6 14.3 149.1 10.4 17.6 21.8 32.2 33.7 43.6 22.8 22 31.7 28.5 53.7 28.5 20.8 0 30.6-28.5 54.4-28.5 24.1 0 33.4 28.5 54.7 28.5 21.3 0 31.1-13.4 53.9-33.1 24.3-34.7 33.1-66.2 33.1-67.9zM240.1 123.1c21.4-26.1 35.7-62.1 35.7-98.1 0-5.1-.6-10.2-1.7-15.3-33 1.3-73.2 21.9-97.1 49.7-18.1 21-34.6 57.5-34.6 93.7 0 5.4.8 10.8 1.8 14.8 35.5 2.7 72.8-19.1 95.9-44.8z"
      />
    </svg>
  );
}

function DisabledSocialButton({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled
      aria-disabled="true"
      title="Coming soon"
      className="relative w-full h-[50px] inline-flex items-center justify-center border border-[#DFDFE4] rounded-full text-[13px] font-medium text-foreground bg-white opacity-80 cursor-not-allowed transition-colors"
    >
      <span aria-hidden className="absolute left-4 inline-flex items-center">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function SocialAuthButtons() {
  return (
    <div className="space-y-2.5" aria-label="Other sign-up options (coming soon)">
      <DisabledSocialButton label="Sign up with Google" icon={<GoogleIcon />} />
      <DisabledSocialButton label="Sign up with Apple" icon={<AppleIcon />} />
    </div>
  );
}
