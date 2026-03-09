import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AppFooter } from "@/components/app-footer";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | Future Work Academy";
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/">
            <BrandLogo height="h-12" data-testid="img-header-logo" />
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
              <li>IP addresses (logged for security monitoring and rate-limiting purposes)</li>
              <li>User agent strings (logged to identify browser type and operating system for compatibility and security analysis)</li>
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
              Our Service uses third-party artificial intelligence services to evaluate essay responses. 
              Your written submissions are processed by AI systems to generate scores and feedback. 
              This evaluation is based on a transparent 4-criteria rubric (Evidence Quality, 
              Reasoning Coherence, Trade-off Analysis, and Stakeholder Consideration). We do not 
              use your submissions to train AI models. Our current AI provider is OpenAI; this may 
              change as we evaluate and adopt improved services.
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
            <h2 className="text-xl font-semibold mt-8 mb-4" data-testid="text-data-retention-title">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as your account is active or as 
              needed to provide the Service. The following table summarizes our retention periods 
              for different categories of data:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm" data-testid="table-data-retention">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Data Category</th>
                    <th className="text-left py-2 pr-4 font-semibold">Retention Period</th>
                    <th className="text-left py-2 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Account profile data</td>
                    <td className="py-2 pr-4">Duration of account + 90 days</td>
                    <td className="py-2">Service delivery</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Simulation decisions & essays</td>
                    <td className="py-2 pr-4">Duration of course enrollment + 1 year</td>
                    <td className="py-2">Academic records & grading</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Performance scores & analytics</td>
                    <td className="py-2 pr-4">Duration of course enrollment + 1 year</td>
                    <td className="py-2">Instructor reporting & leaderboards</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Activity logs (IP, user agent, timestamps)</td>
                    <td className="py-2 pr-4">90 days</td>
                    <td className="py-2">Security monitoring & troubleshooting</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Cookie consent preferences</td>
                    <td className="py-2 pr-4">13 months</td>
                    <td className="py-2">Regulatory compliance</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Deletion request records</td>
                    <td className="py-2 pr-4">3 years after fulfillment</td>
                    <td className="py-2">Legal compliance & audit trail</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">De-identified / aggregated research data</td>
                    <td className="py-2 pr-4">Indefinite</td>
                    <td className="py-2">Platform improvement & academic research</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              You may request deletion of your account and associated data at any time 
              through your profile settings or by contacting us. Upon deletion, personal data 
              will be removed or de-identified within the retention periods listed above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4" data-testid="text-gdpr-title">8. Your Rights Under GDPR (European Economic Area)</h2>
            <p>
              If you are located in the European Economic Area (EEA), the United Kingdom, or 
              Switzerland, the General Data Protection Regulation (GDPR) and equivalent local 
              laws provide you with specific rights regarding your personal data.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Lawful Basis for Processing</h3>
            <p>We process your personal data under the following lawful bases:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Legitimate Interest:</strong> Providing and improving educational simulation services, performance analytics, security monitoring, and fraud prevention</li>
              <li><strong>Consent:</strong> Analytics cookies (Google Analytics) and optional marketing communications. You may withdraw consent at any time through the cookie consent banner or your account settings.</li>
              <li><strong>Contractual Necessity:</strong> Processing required to deliver the simulation platform to enrolled students and institutions</li>
              <li><strong>Legal Obligation:</strong> Where we are required to retain or disclose data under applicable law</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Data Subject Rights</h3>
            <p>Under the GDPR, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete personal data</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data, subject to legal retention requirements</li>
              <li><strong>Right to Data Portability:</strong> Receive your personal data in a structured, commonly used, machine-readable format (JSON)</li>
              <li><strong>Right to Restriction of Processing:</strong> Request that we limit how we use your data in certain circumstances</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interest, including profiling</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw previously given consent at any time without affecting the lawfulness of prior processing</li>
            </ul>
            <p className="mt-4">
              You can exercise your right to access and data portability through the "Export My Data" 
              feature on your profile page. For erasure requests, use the "Request Account Deletion" 
              feature or contact us directly.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">International Data Transfers</h3>
            <p>
              The Service is hosted in the United States. If you access the Service from the EEA, 
              UK, or Switzerland, your personal data will be transferred to and processed in the 
              United States. We rely on Standard Contractual Clauses (SCCs) approved by the 
              European Commission to provide adequate safeguards for such transfers. Copies of 
              our SCCs are available upon request.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Right to Lodge a Complaint</h3>
            <p>
              If you believe we have not adequately addressed your data protection concerns, you 
              have the right to lodge a complaint with your local data protection supervisory 
              authority. A list of EEA supervisory authorities is available at{" "}
              <a 
                href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary underline underline-offset-4"
                data-testid="link-edpb"
              >
                edpb.europa.eu
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4" data-testid="text-ccpa-title">9. Your Rights Under CCPA (California)</h2>
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA) and 
              the California Privacy Rights Act (CPRA) provide you with additional rights 
              regarding your personal information.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Your CCPA Rights</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Right to Know:</strong> You have the right to request that we disclose the categories and specific pieces of personal information we have collected about you, the categories of sources, the business purposes for collecting the information, and the categories of third parties with whom we share it.</li>
              <li><strong>Right to Delete:</strong> You have the right to request the deletion of personal information we have collected from you, subject to certain exceptions (e.g., legal obligations, completing a transaction).</li>
              <li><strong>Right to Opt-Out of Sale:</strong> We do not sell your personal information. If this practice changes in the future, we will provide a "Do Not Sell My Personal Information" link and update this policy.</li>
              <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA rights. You will not receive different pricing, quality, or levels of service for exercising your rights.</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">How to Submit a Request</h3>
            <p>
              You may exercise your CCPA rights by using the self-service data export and 
              account deletion features on your profile page, or by contacting us using the 
              information in the Contact section below. We will verify your identity before 
              fulfilling any request and respond within 45 days.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Categories of Information Collected</h3>
            <p>In the preceding 12 months, we have collected the following categories of personal information:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Identifiers (name, email address, IP address)</li>
              <li>Internet or electronic network activity (browsing history on the platform, user agent, interaction data)</li>
              <li>Education information (institution, course enrollment, simulation performance)</li>
              <li>Professional information (role, department)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4" data-testid="text-cookies-title">10. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and remember your preferences. You can manage your cookie preferences through the 
              cookie consent banner displayed when you first visit the Service.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Types of Cookies We Use</h3>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full border-collapse text-sm" data-testid="table-cookies">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Cookie</th>
                    <th className="text-left py-2 pr-4 font-semibold">Type</th>
                    <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                    <th className="text-left py-2 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4">Session cookie</td>
                    <td className="py-2 pr-4">Essential</td>
                    <td className="py-2 pr-4">Authentication and session management</td>
                    <td className="py-2">Session (expires on browser close)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">sidebar:state</td>
                    <td className="py-2 pr-4">Essential</td>
                    <td className="py-2 pr-4">Remembers sidebar collapsed/expanded preference</td>
                    <td className="py-2">Persistent (localStorage)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">theme</td>
                    <td className="py-2 pr-4">Essential</td>
                    <td className="py-2 pr-4">Stores light/dark mode preference</td>
                    <td className="py-2">Persistent (localStorage)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">fwa-cookie-consent</td>
                    <td className="py-2 pr-4">Essential</td>
                    <td className="py-2 pr-4">Records your cookie consent choice</td>
                    <td className="py-2">13 months (localStorage)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4">_ga, _ga_*</td>
                    <td className="py-2 pr-4">Analytics</td>
                    <td className="py-2 pr-4">Google Analytics 4 — anonymous usage statistics and page views</td>
                    <td className="py-2">Up to 2 years</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-medium mt-4 mb-2">Managing Cookies</h3>
            <p>
              When you first visit the Service, a cookie consent banner allows you to choose 
              between "Accept All" cookies or "Essential Only." Selecting "Essential Only" 
              disables analytics cookies (including Google Analytics). You can change your 
              preference at any time by clearing your browser's local storage and revisiting 
              the site. You may also configure your browser settings to block or delete cookies, 
              though some features of the Service may not function properly without essential cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Children's Privacy</h2>
            <p>
              The Service is designed for graduate students and adult learners. We do not 
              knowingly collect personal information from children under 13 years of age. 
              If you believe we have collected information from a child under 13, please 
              contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new Privacy Policy on this page and updating the 
              "Effective Date" above. Your continued use of the Service after any changes 
              constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, our data practices, or wish to 
              exercise any of your data rights described above, please contact us:
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
              <p className="mt-1 text-sm text-muted-foreground">
                For GDPR-related inquiries, please include "GDPR Request" in your message subject.
                For CCPA-related inquiries, please include "CCPA Request" in your message subject.
              </p>
            </div>
          </section>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}
