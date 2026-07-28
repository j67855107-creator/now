export default function TermsView() {
  return (
    <div className="max-w-3xl mx-auto text-left font-sans space-y-6 leading-relaxed text-sm text-gray-700 bg-white p-8 md:p-12 rounded-2xl border border-gray-150 shadow-sm animate-fadeIn">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight border-b border-gray-150 pb-5">Terms of Service</h1>
      <p className="text-xs text-slate-400 select-none">Effective Date: June 22, 2026</p>

      <p className="text-slate-600 font-medium">
        Welcome to ConvertOneAI. Please read these Terms of Service (“Terms”) carefully before using our website and services.
      </p>

      <div className="space-y-6 font-sans">
        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">1.</span> Acceptance of Terms
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            By accessing or using ConvertOneAI (the “Service”), you agree to be bound by these Terms and our Privacy Policy. If you do not agree with any part of these terms, you are not permitted to access or use our file conversion services. Your continued use of the Service constitutes your ongoing acceptance of these Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">2.</span> Description of Service
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            ConvertOneAI provides a smart, web-based utility that extracts content from PDF and Word (.docx) documents and converts them into clean, standardized Markdown format. While we aim to provide high-quality structural translations of tables, headers, and formatted lists, our conversion processes depend heavily on the source document formatting. The Service handles files up to a generous 50MB file restriction, but may contain functional limitations when processing heavily nested formats or low-resolution scanned pages.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">3.</span> Acceptable Use
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            You are free to use our Service for both personal and professional conversions. However, you agree to use ConvertOneAI only for lawful operations. Specifically, you agree not to:
          </p>
          <ul className="list-disc pl-5 text-slate-600 text-xs md:text-sm space-y-1">
            <li>Attempt to disrupt or compromise our server performance, API endpoints, or security configurations.</li>
            <li>Upload, transmit, or process files containing malicious code, viruses, malware, or Trojan horses.</li>
            <li>Convert any content that violates third-party intellectual property, privacy rights, or local and international regulations.</li>
            <li>Use automated scrapers, bots, or script sequences to abuse or strain the conversion platform.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">4.</span> File Handling
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            Your data privacy and digital trust are of the utmost importance. Under our volatile processing design, all uploaded documents are processed securely in temporary RAM memory solely during the active conversion transaction. No files are preserved, cached, stored, or distributed on our servers once your Markdown output is compiled. All input files are immediately and permanently cleared from volatile memory upon completion.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">5.</span> Intellectual Property
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We respect your creative output and ownership rights:
          </p>
          <ul className="list-disc pl-5 text-slate-600 text-xs md:text-sm space-y-1">
            <li><strong>Your Files and Output:</strong> You retain absolute, full ownership of all source files uploaded and all resulting Markdown materials compiled by the Service. We assert no claims, licenses, or intellectual ownership over your data.</li>
            <li><strong>Our Platform Rights:</strong> The software, user interfaces, stylistic layout designs, custom code, logos, and the trademark "ConvertOneAI" remain the exclusive property of ConvertOneAI. You are granted a limited, subjective, non-transferable license to access our platform for conversion purposes only.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">6.</span> Disclaimer of Warranties
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            ConvertOneAI is provided strictly on an "as-is" and "as-available" basis without representations of any kind, whether express or implied. Due to the high structural variance of custom formatting across word processors, we do not guarantee 100% conversion accuracy, font retention, or perfect formatting preservation. We disclaim all implied warranties of merchantability, fitness for a specific purpose, and non-infringement.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">7.</span> Limitation of Liability
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            To the maximum extent permitted by applicable laws, in no event shall ConvertOneAI, its developers, or its affiliates be held liable for any damages, metadata discrepancies, data loss, conversion errors, or business disruptions arising from your use of or inability to use this Service. Users are encouraged to maintain independent backups of critical files.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">8.</span> Changes to Terms
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            We reserve the right to review and update these Terms at any time to reflect software upgrades, regulatory shifts, or operational updates. When revisions occur, we will adjust the "Effective Date" at the top of this page. For significant updates, we will place an alert on the website interface. Your continued access to the platform following updates signifies your clear agreement to the revised Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">9.</span> Governing Law
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            These Terms and all disputes arising from your use of ConvertOneAI shall be governed by, and interpreted in accordance with, the laws of the State of California, United States, without regard to its conflict of law principles. Any legal actions must be filed in the competent courts located therein.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <span className="text-indigo-600">10.</span> Contact Us
          </h3>
          <p className="text-slate-600 text-xs md:text-sm">
            If you have questions, concerns, or feedback regarding these Terms, please reach out to us. You can submit an inquiry directly through the <strong>Contact Support</strong> form available under our navigation menu.
          </p>
        </section>
      </div>
    </div>
  );
}
