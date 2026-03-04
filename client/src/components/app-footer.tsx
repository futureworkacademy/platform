export function AppFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t bg-card/50 py-6 px-4 mt-auto">
      <div className="container mx-auto space-y-3">
        <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-muted-foreground">
          <a
            href="/guides/student"
            className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            data-testid="link-footer-student-guide"
          >
            Student Guide
          </a>
          <span className="opacity-40">|</span>
          <a
            href="/guides/instructor"
            className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            data-testid="link-footer-instructor-guide"
          >
            Instructor Guide
          </a>
          <span className="opacity-40">|</span>
          <a
            href="/for-educators"
            className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            data-testid="link-footer-for-educators"
          >
            For Educators
          </a>
          <span className="opacity-40">|</span>
          <a
            href="/methodology"
            className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            data-testid="link-footer-methodology"
          >
            Methodology
          </a>
          <span className="opacity-40">|</span>
          <a
            href="/privacy"
            className="underline underline-offset-4 opacity-80 hover:opacity-100 transition-opacity"
            data-testid="link-footer-privacy"
          >
            Privacy Policy
          </a>
        </div>
        <p className="text-center text-sm text-muted-foreground" data-testid="text-copyright">
          Copyright {currentYear} The Mitchell Group, LLC - Iowa. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
