import AuthForm from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold text-primary">
            Taco's Task Manager
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to start organizing your tasks.
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
