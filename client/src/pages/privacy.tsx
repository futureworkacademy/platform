import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import { AppFooter } from "@/components/app-footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <img 
              src={logoForLight} 
              alt="Future Work Academy" 
              className="h-16 w-auto cursor-pointer block dark:hidden"
              data-testid="img-header-logo-light"
            />
            <img 
              src={logoForDark} 
              alt="Future Work Academy" 
              className="h-16 w-auto cursor-pointer hidden dark:block"
              data-testid="img-header-logo-dark"
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8" data-testid="text-privacy-title">Privacy Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Effective Date:</strong> January 1, 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              The Mitchell Group, LLC ("we," "us," or "our") operates the Future Work Academy platform 
              (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our Service. By using the Service, you consent to the 
              practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <h3 className="text-lg font-medium mt-4 mb-2">Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Name and email address (provided during account creation)</li>
              <li>Educational institution and role (student, instructor, administrator)</li>
              <li>Profile information you choose to provide</li>
              <li>Phone number (optional, for SMS notifications)</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Usage Information</h3>
            <p>We automatically collect certain information when you use the Service:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Simulation decisions and responses</li>
              <li>Performance scores and analytics</li>
              <li>Activity logs and timestamps</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain the simulation platform</li>
              <li>Evaluate and score simulation responses using AI-powered grading</li>
              <li>Generate performance analytics and leaderboards</li>
              <li>Send notifications about simulation progress and deadlines</li>
              <li>Communicate with instructors about student participation</li>
              <li>Improve and optimize the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. AI-Powered Evaluation</h2>
            <p>
              Our Service uses artificial intelligence (OpenAI) to evaluate essay responses. 
              Your written submissions are processed by AI systems to generate scores and feedback. 
              This evaluation is based on a transparent 4-criteria rubric (Evidence Quality, 
              Reasoning Coherence, Trade-off Analysis, and Stakeholder Consideration). We do not 
              use your submissions to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Instructors:</strong> Your instructor can view your simulation performance, decisions, and scores</li>
              <li><strong>Team Members:</strong> If you are part of a team, your teammates may see shared team performance data</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (e.g., email delivery, SMS notifications)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your 
              personal information. However, no method of transmission over the Internet or 
              electronic storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as 
              needed to provide the Service. Simulation data may be retained for academic 
              research and platform improvement purposes. You may request deletion of your 
              account and associated data by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of certain data processing activities</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              The Service is designed for graduate students and adult learners. We do not 
              knowingly collect personal information from children under 13 years of age. 
              If you believe we have collected information from a child under 13, please 
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new Privacy Policy on this page and updating the 
              "Effective Date" above. Your continued use of the Service after any changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">The Mitchell Group, LLC</p>
              <p>Des Moines, Iowa</p>
              <p className="mt-2">
                <Link href="/for-educators">
                  <span className="text-primary underline underline-offset-4 cursor-pointer" data-testid="link-contact">
                    Contact Form
                  </span>
                </Link>
              </p>
            </div>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
