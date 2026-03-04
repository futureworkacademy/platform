import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import logoForLight from "@assets/logo-horizontal.png";
import logoForDark from "@assets/logo-white.png";
import { AppFooter } from "@/components/app-footer";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | Future Work Academy";
  }, []);

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
        <h1 className="text-3xl font-bold mb-8" data-testid="text-terms-title">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            <strong>Effective Date:</strong> January 1, 2026
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Future Work Academy platform (the "Service"), operated by
              The Mitchell Group, LLC ("we," "us," or "our"), you agree to be bound by these Terms
              of Service ("Terms"). If you do not agree to these Terms, you may not access or use
              the Service. Your continued use of the Service following the posting of any changes to
              these Terms constitutes acceptance of those changes.
            </p>
            <p className="mt-3">
              If you are using the Service on behalf of an educational institution or other
              organization, you represent and warrant that you have the authority to bind that
              organization to these Terms, and "you" refers to both you individually and the
              organization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Service Description</h2>
            <p>
              Future Work Academy provides an AI-driven experiential learning simulation platform
              designed for graduate-level management education. The Service includes, but is not
              limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>An 8-week strategic leadership simulation set in a fictional manufacturing company</li>
              <li>AI-powered evaluation and feedback on written decision analyses</li>
              <li>Performance analytics, leaderboards, and progress tracking</li>
              <li>Advisory character interactions and stakeholder management scenarios</li>
              <li>Instructor dashboards, class administration, and grading tools</li>
              <li>Research briefings, voicemails, and supplementary educational content</li>
            </ul>
            <p className="mt-3">
              The Service is intended for use by enrolled students and authorized instructors at
              participating educational institutions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              To access the Service, you must create an account through our authentication system.
              You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain the security of your account credentials and not share them with others</li>
              <li>Promptly notify us of any unauthorized access to or use of your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms or
              that have been inactive for an extended period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Violate any applicable law, regulation, or institutional policy</li>
              <li>Submit content that is defamatory, obscene, harassing, threatening, or otherwise objectionable</li>
              <li>Impersonate another person or misrepresent your affiliation with any entity</li>
              <li>Attempt to gain unauthorized access to any portion of the Service or its related systems</li>
              <li>Interfere with or disrupt the Service, servers, or networks connected to the Service</li>
              <li>Use automated scripts, bots, or other means to access the Service without authorization</li>
              <li>Circumvent, disable, or otherwise interfere with security-related features of the Service</li>
              <li>Submit another person's work as your own or otherwise engage in academic dishonesty</li>
              <li>Use the Service for any commercial purpose not expressly authorized by us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Service — including but not limited to
              simulation scenarios, character profiles, storylines, rubrics, evaluation criteria,
              advisory content, visual designs, logos, and software code — are owned by The Mitchell
              Group, LLC and are protected by United States and international copyright, trademark,
              and other intellectual property laws.
            </p>
            <p className="mt-3">
              You retain ownership of the written content you submit through the Service (e.g., essay
              responses and decision analyses). By submitting content, you grant us a non-exclusive,
              worldwide, royalty-free license to use, store, process, and display your submissions
              solely for the purposes of operating the Service, providing feedback, and conducting
              aggregated educational research. We will not publicly identify individual student
              submissions in any research or marketing materials without explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. AI-Generated Content Disclaimer</h2>
            <p>
              The Service uses artificial intelligence to evaluate essay responses and provide
              feedback. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>AI-generated evaluations are provided as educational tools and do not constitute professional advice</li>
              <li>AI scores and feedback may contain errors or reflect limitations inherent to current AI technology</li>
              <li>Final grading authority rests with your instructor, not the AI system</li>
              <li>Your submissions may be processed by third-party AI providers (currently Google Gemini) for evaluation purposes only — they are not used to train AI models</li>
              <li>AI evaluation is based on a transparent rubric that is disclosed to all participants</li>
              <li>We continuously monitor and improve AI evaluation accuracy, but do not guarantee perfect assessments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE MITCHELL GROUP, LLC AND ITS
              OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
              REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
              OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Your access to, use of, or inability to access or use the Service</li>
              <li>Any conduct or content of any third party on the Service</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              <li>AI-generated evaluations, scores, or feedback</li>
              <li>Service interruptions, data loss, or technical failures</li>
            </ul>
            <p className="mt-3">
              OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE
              SHALL NOT EXCEED THE AMOUNT YOU PAID TO ACCESS THE SERVICE IN THE TWELVE (12) MONTHS
              PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), WHICHEVER IS GREATER.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless The Mitchell Group, LLC, its
              affiliates, officers, directors, employees, and agents from and against any and all
              claims, liabilities, damages, losses, costs, and expenses (including reasonable
              attorneys' fees) arising out of or in any way connected with:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Your access to or use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party right, including any intellectual property or privacy right</li>
              <li>Any content you submit through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without
              cause, and with or without notice. Upon termination:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-3">
              <li>Your right to access and use the Service will immediately cease</li>
              <li>We may delete your account and associated data in accordance with our <Link href="/privacy"><span className="text-primary underline underline-offset-4 cursor-pointer">Privacy Policy</span></Link></li>
              <li>Provisions of these Terms that by their nature should survive termination shall survive, including intellectual property provisions, limitation of liability, indemnification, and dispute resolution</li>
            </ul>
            <p className="mt-3">
              You may terminate your account at any time by requesting account deletion through your
              profile settings or by contacting us directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the
              State of Iowa, United States, without regard to its conflict of law provisions. You
              agree that any legal action or proceeding arising out of or relating to these Terms
              or the Service shall be brought exclusively in the state or federal courts located
              in Polk County, Iowa, and you consent to the personal jurisdiction and venue of
              such courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Dispute Resolution</h2>
            <p>
              Before initiating any legal proceeding, you agree to first attempt to resolve any
              dispute informally by contacting us. We will attempt to resolve the dispute through
              good-faith negotiation within thirty (30) days.
            </p>
            <p className="mt-3">
              If the dispute cannot be resolved informally, both parties agree to submit to binding
              arbitration administered by the American Arbitration Association ("AAA") under its
              Commercial Arbitration Rules. The arbitration shall be conducted in Des Moines, Iowa.
              The arbitrator's decision shall be final and binding and may be entered as a judgment
              in any court of competent jurisdiction.
            </p>
            <p className="mt-3">
              You agree that any dispute resolution proceedings will be conducted only on an
              individual basis and not in a class, consolidated, or representative action. If for
              any reason a claim proceeds in court rather than arbitration, you waive any right to
              a jury trial.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of
              material changes by posting the updated Terms on this page and updating the
              "Effective Date" above. For registered users, we may also provide notice through the
              Service or via email. Your continued use of the Service after any modifications
              constitutes acceptance of the revised Terms.
            </p>
            <p className="mt-3">
              We encourage you to review these Terms periodically. If you do not agree to the
              modified Terms, you must discontinue use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and The Mitchell Group, LLC regarding the Service.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</li>
              <li><strong>Waiver:</strong> Our failure to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision.</li>
              <li><strong>Assignment:</strong> You may not assign or transfer these Terms without our prior written consent. We may assign these Terms without restriction.</li>
              <li><strong>Force Majeure:</strong> We shall not be liable for any failure or delay in performance resulting from causes beyond our reasonable control, including natural disasters, pandemics, acts of government, or internet service disruptions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">14. Contact</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 p-4 bg-muted rounded-md">
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