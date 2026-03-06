import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
      <div>
        <div className="text-8xl mb-6">🗳️</div>
        <h1 className="text-4xl font-heading font-bold text-foreground mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity">
          Go Home
        </button>
      </div>
    </div>
  );
}