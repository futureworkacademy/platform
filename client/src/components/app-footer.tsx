export function AppFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-card/50 py-4 px-4 mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p data-testid="text-copyright">
          Copyright {currentYear} The Future of Work. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
